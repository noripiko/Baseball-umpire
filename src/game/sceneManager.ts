import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  BatterModel,
  createBaseballTexture,
  createBatter,
  createBattersBoxes,
  createCatcher,
  createHomePlate,
  createPitcher,
  PitcherRig,
  createStadiumEnvironment,
  createStrikeZoneBox,
} from './proceduralModels';
import { BatterStance, CameraPreset, PitchResult } from '../types';

// Pre-allocated math helpers to ensure zero GC in render loop
const _vec3 = new THREE.Vector3();

export interface SceneCallbacks {
  onBallCaught: () => void;
  onWindupStarted?: () => void;
  onBallReleased?: () => void;
}

export class UmpireSceneManager {
  private container: HTMLDivElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private animFrameId: number | null = null;
  private clock = new THREE.Clock();

  // Scene entities
  private pitcherRig!: PitcherRig;
  private catcherGroup!: THREE.Group;
  private catcherMitt!: THREE.Mesh;
  private batterData!: BatterModel;
  private baseballMesh!: THREE.Mesh;
  private strikeZoneBox!: ReturnType<typeof createStrikeZoneBox>;
  private trajectoryLine: THREE.Line | null = null;
  private impactMarker: THREE.Mesh | null = null;

  // Camera settings
  private cameraPreset: CameraPreset = 'SLOT';
  private cameraShakeIntensity = 0;
  private isTitleOrbiting = true;
  private orbitAngle = 0;

  // Pitch state
  private isPitchActive = false;
  private pitchPhase: 'IDLE' | 'WINDUP' | 'FLIGHT' | 'CAUGHT' = 'IDLE';
  private pitchTime = 0;
  private windupDuration = 1.25; // Authentic pro baseball windup timing (seconds)
  private flightDuration = 0.42; // seconds (depends on speed)
  private currentTrajectory: Array<{ x: number; y: number; z: number }> = [];
  private currentResult: PitchResult | null = null;
  private callbacks: SceneCallbacks;

  // Catcher framing
  private originalMittPos = new THREE.Vector3(0, 0.72, -0.45);
  private targetMittPos = new THREE.Vector3(0, 0.72, -0.45);

  constructor(container: HTMLDivElement, callbacks: SceneCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.init();
  }

  private init() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // 1. Scene & Horizon Fog
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0c1421); // Night sky
    this.scene.fog = new THREE.FogExp2(0x0c1421, 0.015);

    // 2. Camera (behind home plate umpire slot - realistic wide Umpire Cam matching reference)
    this.camera = new THREE.PerspectiveCamera(58, width / height, 0.1, 200);
    this.applyCameraPreset('SLOT', 1.0);

    // 3. Renderer with ACES ToneMapping & SRGB Color Pipeline
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    // 4. Studio Environment Reflection (RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. Lighting Rig (Key Light + Shadows + Cool Fill)
    const keyLight = new THREE.DirectionalLight(0xfff5ea, 2.2);
    keyLight.position.set(15, 26, 20);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 70;
    keyLight.shadow.camera.left = -16;
    keyLight.shadow.camera.right = 16;
    keyLight.shadow.camera.top = 16;
    keyLight.shadow.camera.bottom = -16;
    keyLight.shadow.bias = -0.0003;
    keyLight.shadow.normalBias = 0.02;
    this.scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight(0x7ea8d8, 0x1f3c24, 0.9);
    this.scene.add(hemiLight);

    // Rim light from behind mound
    const rimLight = new THREE.DirectionalLight(0xaad4f5, 1.4);
    rimLight.position.set(-10, 14, 25);
    this.scene.add(rimLight);

    // 6. Build Stadium & Field Elements
    const stadium = createStadiumEnvironment();
    this.scene.add(stadium);

    const homePlate = createHomePlate();
    this.scene.add(homePlate);

    const battersBoxes = createBattersBoxes();
    this.scene.add(battersBoxes);

    // 7. Pitcher (Articulated Pro Baseball Rig)
    this.pitcherRig = createPitcher();
    this.scene.add(this.pitcherRig.group);

    // 8. Catcher
    const catcherData = createCatcher();
    this.catcherGroup = catcherData.group;
    this.catcherMitt = catcherData.mitt;
    this.scene.add(this.catcherGroup);

    // 9. Batter (Default to LEFT matching user's reference photo)
    this.batterData = createBatter('LEFT');
    this.scene.add(this.batterData.group);
    this.catcherGroup.position.x = -0.12;

    // 10. Baseball
    const ballGeo = new THREE.SphereGeometry(0.0366, 24, 24);
    const ballTex = createBaseballTexture();
    const ballMat = new THREE.MeshStandardMaterial({
      map: ballTex,
      roughness: 0.35,
      metalness: 0.05,
    });
    this.baseballMesh = new THREE.Mesh(ballGeo, ballMat);
    this.baseballMesh.castShadow = true;
    this.baseballMesh.position.set(0.42, 1.95, 16.5);
    this.scene.add(this.baseballMesh);

    // 11. Strike Zone Box
    this.strikeZoneBox = createStrikeZoneBox();
    this.scene.add(this.strikeZoneBox.group);
    this.strikeZoneBox.setVisible(false);

    // 12. Handle window resize
    window.addEventListener('resize', this.onResize);

    // Pre-warm shaders
    this.renderer.compile(this.scene, this.camera);

    // Start render loop
    this.clock.start();
    this.tick();
  }

  private onResize = () => {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public setBatterStance(stance: BatterStance) {
    if (this.batterData) {
      this.scene.remove(this.batterData.group);
    }
    this.batterData = createBatter(stance);
    this.scene.add(this.batterData.group);

    // Complement catcher position:
    // Left-handed batter (on right side): catcher shifts left to x = -0.12m
    // Right-handed batter (on left side): catcher shifts right to x = +0.12m
    if (this.catcherGroup) {
      this.catcherGroup.position.x = stance === 'LEFT' ? -0.12 : 0.12;
    }

    if (this.cameraPreset === 'SLOT') {
      this.applyCameraPreset('SLOT', 0.2);
    }
  }

  public setCameraPreset(preset: CameraPreset) {
    this.cameraPreset = preset;
    this.isTitleOrbiting = false;
    this.applyCameraPreset(preset, 0.1);
  }

  private applyCameraPreset(preset: CameraPreset, damping: number = 0.08) {
    let targetPos = new THREE.Vector3(0, 1.34, -1.02);
    let lookTarget = new THREE.Vector3(0, 0.95, 12);

    switch (preset) {
      case 'SLOT': {
        // Authentic MLB/NPB Umpire Cam matching reference photo:
        // When Left-handed batter is up (x = +0.58m):
        // Umpire camera stands at x = +0.16m, y = 1.45m, z = -1.82m!
        // Catcher's helmet is visible in bottom-left corner!
        // Batter is standing in box on right side with bat held high!
        // Home plate and chalk lines clearly visible in foreground dirt!
        // When Right-handed batter is up (x = -0.58m):
        // Umpire camera stands at x = -0.16m, y = 1.45m, z = -1.82m!
        // Catcher's helmet is visible in bottom-right corner!
        const isRighty = this.batterData ? this.batterData.stance === 'RIGHT' : false;
        const slotX = isRighty ? -0.16 : 0.16;
        targetPos.set(slotX, 1.45, -1.82);
        lookTarget.set(0, 0.85, 12.0);
        break;
      }
      case 'CATCHER':
        // Catcher mask eye view
        targetPos.set(0.0, 1.15, -1.1);
        lookTarget.set(0, 0.88, 18.44);
        break;
      case 'WIDE':
        // High behind home plate broadcast view
        targetPos.set(0.0, 2.1, -2.6);
        lookTarget.set(0, 0.85, 12.0);
        break;
      case 'SIDE':
        // Side profile angle
        targetPos.set(-2.5, 1.25, 0.2);
        lookTarget.set(0, 0.8, 0.0);
        break;
    }

    if (damping >= 1.0) {
      this.camera.position.copy(targetPos);
      this.camera.lookAt(lookTarget);
    } else {
      this.camera.position.lerp(targetPos, damping);
      this.camera.lookAt(lookTarget);
    }
  }

  public setTitleOrbitMode(enabled: boolean) {
    this.isTitleOrbiting = enabled;
    if (enabled) {
      this.isPitchActive = false;
      this.pitchPhase = 'IDLE';
      this.pitcherRig.setPose('IDLE', 0, 0);
      this.baseballMesh.visible = false;
    }
  }

  public setZoneGuideVisible(visible: boolean) {
    this.strikeZoneBox.setVisible(visible);
  }

  /**
   * Start a new pitch throwing sequence
   */
  public pitchBall(
    trajectory: Array<{ x: number; y: number; z: number }>,
    result: PitchResult,
    flightDurationSec: number = 0.42
  ) {
    this.clearReplayGraphics();

    this.currentTrajectory = trajectory;
    this.currentResult = result;
    this.flightDuration = Math.max(0.32, flightDurationSec);
    this.isPitchActive = true;
    this.pitchPhase = 'WINDUP';
    this.pitchTime = 0;
    this.isTitleOrbiting = false;

    // Reset pitcher pose into beginning of windup and glue ball to hand socket
    this.pitcherRig.setPose('WINDUP', 0, 0);
    this.pitcherRig.getBallSocketWorldPos(this.baseballMesh.position);
    this.baseballMesh.visible = true;

    // Reset mitt position
    this.catcherMitt.position.copy(this.originalMittPos);

    if (this.callbacks.onWindupStarted) {
      this.callbacks.onWindupStarted();
    }
  }

  /**
   * Show pitch replay trail & impact marker
   */
  public showReplay(result: PitchResult) {
    this.clearReplayGraphics();

    // 1. Strike zone box with strike/ball color highlight
    this.strikeZoneBox.setVisible(true);
    this.strikeZoneBox.setHighlight(result.actualCall === 'STRIKE');

    // 2. Trajectory 3D Line
    if (result.trajectory && result.trajectory.length > 1) {
      const points = result.trajectory.map((p) => new THREE.Vector3(p.x, p.y, p.z));
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({
        color: result.actualCall === 'STRIKE' ? 0xff4d4d : 0x4cc9f0,
        linewidth: 3,
        transparent: true,
        opacity: 0.85,
      });
      this.trajectoryLine = new THREE.Line(geom, mat);
      this.scene.add(this.trajectoryLine);
    }

    // 3. Impact crossing marker sphere at plate plane (z = 0)
    const markerGeo = new THREE.SphereGeometry(0.04, 16, 16);
    const markerMat = new THREE.MeshBasicMaterial({
      color: result.actualCall === 'STRIKE' ? 0xff3b30 : 0x007aff,
    });
    this.impactMarker = new THREE.Mesh(markerGeo, markerMat);
    this.impactMarker.position.set(result.crossingX, result.crossingY, 0.0);
    this.scene.add(this.impactMarker);
  }

  public clearReplayGraphics() {
    if (this.trajectoryLine) {
      this.scene.remove(this.trajectoryLine);
      this.trajectoryLine.geometry.dispose();
      (this.trajectoryLine.material as THREE.Material).dispose();
      this.trajectoryLine = null;
    }
    if (this.impactMarker) {
      this.scene.remove(this.impactMarker);
      this.impactMarker.geometry.dispose();
      (this.impactMarker.material as THREE.Material).dispose();
      this.impactMarker = null;
    }
  }

  public triggerCameraShake(intensity: number = 0.035) {
    this.cameraShakeIntensity = intensity;
  }

  private tick = () => {
    this.animFrameId = requestAnimationFrame(this.tick);
    const rawDt = this.clock.getDelta();
    const dt = Math.min(rawDt, 0.05); // clamped delta time per craft guidelines

    // 1. Title Orbit Camera Pan
    if (this.isTitleOrbiting) {
      this.orbitAngle += dt * 0.25;
      const camX = Math.sin(this.orbitAngle) * 2.8;
      const camZ = -1.2 + Math.cos(this.orbitAngle) * 0.9;
      this.camera.position.set(camX, 1.45 + Math.sin(this.orbitAngle * 1.5) * 0.15, camZ);
      this.camera.lookAt(0, 0.95, 6.0);
    } else {
      // Smooth damp toward selected preset
      this.applyCameraPreset(this.cameraPreset, 0.12);
    }

    // 2. Camera Shake decay
    if (this.cameraShakeIntensity > 0.001) {
      this.camera.position.x += (Math.random() - 0.5) * this.cameraShakeIntensity;
      this.camera.position.y += (Math.random() - 0.5) * this.cameraShakeIntensity;
      this.cameraShakeIntensity = THREE.MathUtils.damp(this.cameraShakeIntensity, 0, 8, dt);
    }

    // 3. Batter Idle, Bat Waggle & Head Tracking
    if (this.batterData) {
      const time = this.clock.elapsedTime;
      const isRighty = this.batterData.stance === 'RIGHT';
      const baseZ = isRighty ? 0.35 : -0.35;
      const baseX = -0.45;

      // Natural rhythmic pro-batter bat waggle
      this.batterData.batGroup.rotation.z = baseZ + Math.sin(time * 3.6) * 0.05;
      this.batterData.batGroup.rotation.x = baseX + Math.cos(time * 2.8) * 0.04;

      // Subtle breathing motion
      this.batterData.torsoGroup.position.y = 1.18 + Math.sin(time * 2.0) * 0.005;

      // Head tracking the incoming baseball during pitch flight!
      if (this.pitchPhase === 'FLIGHT' && this.baseballMesh) {
        const ballZ = this.baseballMesh.position.z;
        const trackProgress = 1 - Math.max(0, Math.min(1, ballZ / 18.44));
        const headTargetRot = isRighty
          ? 0.35 - trackProgress * 0.55
          : -0.35 + trackProgress * 0.55;
        this.batterData.headGroup.rotation.y = headTargetRot;
      } else {
        // Return head smoothly to face pitcher on mound
        const defaultHeadY = isRighty ? 0.35 : -0.35;
        this.batterData.headGroup.rotation.y = THREE.MathUtils.damp(
          this.batterData.headGroup.rotation.y,
          defaultHeadY,
          5,
          dt
        );
      }
    }

    // 4. Pitch Sequence Simulation
    if (this.isPitchActive) {
      this.pitchTime += dt;

      if (this.pitchPhase === 'WINDUP') {
        const windupProgress = Math.min(1.0, this.pitchTime / this.windupDuration); // 0 to 1

        // Drive the fully articulated pitching kinetic chain
        this.pitcherRig.setPose('WINDUP', windupProgress, this.pitchTime);

        // Keep baseball physically locked in the pitcher's right hand socket
        this.pitcherRig.getBallSocketWorldPos(this.baseballMesh.position);
        this.baseballMesh.visible = true;

        if (windupProgress >= 1.0) {
          // Ball released at apex into flight toward home plate!
          this.pitchPhase = 'FLIGHT';
          this.pitchTime = 0;

          // Connect release position seamlessly to the start of trajectory
          if (this.currentTrajectory.length > 0) {
            this.currentTrajectory[0] = {
              x: this.baseballMesh.position.x,
              y: this.baseballMesh.position.y,
              z: this.baseballMesh.position.z,
            };
          }

          if (this.callbacks.onBallReleased) {
            this.callbacks.onBallReleased();
          }
        }
      } else if (this.pitchPhase === 'FLIGHT') {
        const flightProgress = Math.min(1.0, this.pitchTime / this.flightDuration); // 0 to 1

        // Pitcher executes natural deceleration, chest bow & high leg kick follow-through
        this.pitcherRig.setPose('FLIGHT', flightProgress, this.pitchTime);

        // Interpolate baseball along calculated aerodynamic trajectory
        if (this.currentTrajectory.length > 0) {
          const indexFloat = flightProgress * (this.currentTrajectory.length - 1);
          const idx = Math.floor(indexFloat);
          const fract = indexFloat - idx;
          const nextIdx = Math.min(idx + 1, this.currentTrajectory.length - 1);

          const p1 = this.currentTrajectory[idx];
          const p2 = this.currentTrajectory[nextIdx];

          const ballX = p1.x * (1 - fract) + p2.x * fract;
          const ballY = p1.y * (1 - fract) + p2.y * fract;
          const ballZ = p1.z * (1 - fract) + p2.z * fract;

          this.baseballMesh.position.set(ballX, ballY, ballZ);

          // Fast spinning rotation around pitch axis
          this.baseballMesh.rotation.x += dt * 55;
          this.baseballMesh.rotation.y += dt * 30;

          // Catcher tracks ball with mitt
          if (flightProgress > 0.4) {
            const trackT = (flightProgress - 0.4) / 0.6;
            const endPos = this.currentTrajectory[this.currentTrajectory.length - 1];
            this.targetMittPos.set(endPos.x, endPos.y, endPos.z);
            this.catcherMitt.position.lerp(this.targetMittPos, trackT * 0.5);
          }
        }

        // When ball reaches catcher's mitt
        if (flightProgress >= 1.0) {
          this.pitchPhase = 'CAUGHT';
          this.isPitchActive = false;

          // Snap ball right in the pocket of the mitt
          const endPos = this.currentTrajectory[this.currentTrajectory.length - 1];
          this.baseballMesh.position.set(endPos.x, endPos.y, endPos.z);

          // Trigger catcher framing (subtle framing tug 2cm toward center)
          if (this.currentResult) {
            const frameTarget = new THREE.Vector3(
              endPos.x * 0.85,
              0.78 + (endPos.y - 0.78) * 0.88,
              endPos.z
            );
            this.catcherMitt.position.copy(frameTarget);
            this.baseballMesh.position.copy(frameTarget);
          }

          // Trigger catch callback & camera thump
          this.triggerCameraShake(0.045);
          this.callbacks.onBallCaught();
        }
      }
    } else {
      // Mound idle / ready breathing animation when not actively throwing
      if (this.pitchPhase === 'IDLE') {
        this.pitcherRig.setPose('IDLE', 0, this.clock.elapsedTime);
        this.baseballMesh.visible = false;
      } else if (this.pitchPhase === 'CAUGHT') {
        // Hold follow-through momentarily, then relax back into set stance
        this.pitchTime += dt;
        if (this.pitchTime > 1.2) {
          this.pitcherRig.setPose('IDLE', 0, this.clock.elapsedTime);
        } else {
          this.pitcherRig.setPose('FOLLOW_THROUGH', 1.0, this.pitchTime);
        }
      }
    }

    this.renderer.render(this.scene, this.camera);
  };

  public destroy() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
    window.removeEventListener('resize', this.onResize);

    this.clearReplayGraphics();

    // Scene disposal
    this.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else if (child.material) {
          child.material.dispose();
        }
      }
    });

    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentElement) {
        this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
      }
    }
  }
}
