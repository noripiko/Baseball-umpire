import * as THREE from 'three';
import { BatterStance } from '../types';

/**
 * Procedural Baseball Seam Canvas Texture (Zero external 404 dependencies)
 */
export function createBaseballTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Off-white leather base with subtle grain
  ctx.fillStyle = '#f8f9fa';
  ctx.fillRect(0, 0, 512, 256);

  // Leather micro-speckle
  ctx.fillStyle = '#eaecef';
  for (let i = 0; i < 600; i++) {
    const rx = Math.random() * 512;
    const ry = Math.random() * 256;
    ctx.fillRect(rx, ry, 1, 1);
  }

  // Draw two iconic curved red stitched baseball seams
  ctx.strokeStyle = '#c92a2a';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';

  const drawSeam = (offsetY: number, inverted: boolean) => {
    ctx.beginPath();
    for (let x = 0; x <= 512; x += 4) {
      const angle = (x / 512) * Math.PI * 2;
      const wave = Math.sin(angle) * 45 * (inverted ? -1 : 1);
      const y = offsetY + wave;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Red stitch V-marks along the seam
    ctx.fillStyle = '#b02a2a';
    for (let x = 8; x < 512; x += 16) {
      const angle = (x / 512) * Math.PI * 2;
      const wave = Math.sin(angle) * 45 * (inverted ? -1 : 1);
      const y = offsetY + wave;
      ctx.fillRect(x - 2, y - 5, 4, 2);
      ctx.fillRect(x - 2, y + 4, 4, 2);
    }
  };

  drawSeam(68, false);
  drawSeam(188, true);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Procedural Turf / Grass Texture
 */
export function createTurfTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#2b6e3f';
  ctx.fillRect(0, 0, 512, 512);

  // Mowed stripes pattern
  ctx.fillStyle = '#327c49';
  for (let i = 0; i < 512; i += 64) {
    ctx.fillRect(0, i, 512, 32);
  }

  // Grass noise
  for (let i = 0; i < 3000; i++) {
    const rx = Math.random() * 512;
    const ry = Math.random() * 512;
    ctx.fillStyle = Math.random() > 0.5 ? '#235933' : '#3b8e54';
    ctx.fillRect(rx, ry, 2, 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(24, 24);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Procedural Dirt Texture for home plate circle & mound
 */
export function createDirtTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#9c6644';
  ctx.fillRect(0, 0, 256, 256);

  for (let i = 0; i < 2000; i++) {
    const rx = Math.random() * 256;
    const ry = Math.random() * 256;
    ctx.fillStyle = Math.random() > 0.5 ? '#7f4f24' : '#b08968';
    ctx.fillRect(rx, ry, 2, 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Regulation Home Plate (5-sided pentagon with black rubber bevel)
 */
export function createHomePlate(): THREE.Group {
  const group = new THREE.Group();

  // Home plate regulation dimensions:
  // Front edge = 17 inches = 0.4318m
  // Sides parallel to foul lines = 8.5 inches = 0.2159m
  // Pointed back edges meet at 90 degrees
  const shape = new THREE.Shape();
  const halfW = 0.216;
  const frontY = 0.0;
  const midY = -0.216;
  const backY = -0.432;

  shape.moveTo(-halfW, frontY);
  shape.lineTo(halfW, frontY);
  shape.lineTo(halfW, midY);
  shape.lineTo(0, backY);
  shape.lineTo(-halfW, midY);
  shape.closePath();

  // White rubber plate with subtle bevel
  const plateGeo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.015,
    bevelEnabled: true,
    bevelThickness: 0.003,
    bevelSize: 0.003,
    bevelSegments: 2,
  });
  plateGeo.rotateX(-Math.PI / 2);

  const whiteMat = new THREE.MeshStandardMaterial({
    color: 0xf4f5f6,
    roughness: 0.35,
    metalness: 0.05,
  });

  const plateMesh = new THREE.Mesh(plateGeo, whiteMat);
  plateMesh.position.y = 0.005;
  plateMesh.receiveShadow = true;
  group.add(plateMesh);

  // Black border frame underneath
  const borderGeo = new THREE.BoxGeometry(0.46, 0.008, 0.46);
  const borderMat = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.9,
  });
  const borderMesh = new THREE.Mesh(borderGeo, borderMat);
  borderMesh.position.set(0, 0.003, -0.216);
  group.add(borderMesh);

  return group;
}

/**
 * Left & Right Batter's Boxes with white chalk borders
 */
export function createBattersBoxes(): THREE.Group {
  const group = new THREE.Group();
  const chalkMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.9,
  });

  // Box dimensions: 4 feet wide (1.22m) x 6 feet long (1.83m)
  // Distance from plate edge is 6 inches (0.152m)
  const boxW = 1.22;
  const boxL = 1.83;
  const chalkThickness = 0.05;

  const createBox = (xOffset: number) => {
    const boxGroup = new THREE.Group();
    // 4 crisp white chalk borders
    const topGeo = new THREE.BoxGeometry(boxW, 0.006, chalkThickness);
    const sideGeo = new THREE.BoxGeometry(chalkThickness, 0.006, boxL);

    const bTop = new THREE.Mesh(topGeo, chalkMat);
    bTop.position.set(0, 0.004, boxL / 2 - 0.2);

    const bBottom = new THREE.Mesh(topGeo, chalkMat);
    bBottom.position.set(0, 0.004, -boxL / 2 - 0.2);

    const bLeft = new THREE.Mesh(sideGeo, chalkMat);
    bLeft.position.set(-boxW / 2, 0.004, -0.2);

    const bRight = new THREE.Mesh(sideGeo, chalkMat);
    bRight.position.set(boxW / 2, 0.004, -0.2);

    // Subtle dug-in batter's box dirt patch
    const dirtPlaneGeo = new THREE.PlaneGeometry(boxW - 0.06, boxL - 0.06);
    dirtPlaneGeo.rotateX(-Math.PI / 2);
    const dirtPlaneMat = new THREE.MeshStandardMaterial({
      color: 0x855430,
      roughness: 0.95,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const dirtPlane = new THREE.Mesh(dirtPlaneGeo, dirtPlaneMat);
    dirtPlane.position.set(0, 0.003, -0.2);

    boxGroup.add(dirtPlane, bTop, bBottom, bLeft, bRight);
    boxGroup.position.x = xOffset;
    return boxGroup;
  };

  group.add(createBox(-0.216 - 0.152 - boxW / 2)); // Right-handed batter's box
  group.add(createBox(0.216 + 0.152 + boxW / 2)); // Left-handed batter's box

  return group;
}

/**
 * Composite Procedural Catcher Model (7+ distinct parts)
 */
export function createCatcher(): { group: THREE.Group; mitt: THREE.Mesh } {
  const group = new THREE.Group();

  // Materials
  const uniformMat = new THREE.MeshStandardMaterial({
    color: 0x1d3557, // Deep navy uniform
    roughness: 0.6,
  });
  const chestArmorMat = new THREE.MeshStandardMaterial({
    color: 0x222222, // Protective chest gear
    roughness: 0.35,
    metalness: 0.2,
  });
  const shinArmorMat = new THREE.MeshStandardMaterial({
    color: 0x181818, // Glossy leg guards
    roughness: 0.25,
    metalness: 0.3,
  });
  const helmetMat = new THREE.MeshStandardMaterial({
    color: 0x1d3557,
    roughness: 0.3,
    metalness: 0.4,
  });
  const cageMat = new THREE.MeshStandardMaterial({
    color: 0xb0b0b0, // Steel wire face cage
    roughness: 0.2,
    metalness: 0.9,
  });
  const leatherMittMat = new THREE.MeshStandardMaterial({
    color: 0x6f3e18, // Rich brown leather mitt
    roughness: 0.45,
    metalness: 0.05,
  });

  // 1. Kneeling Shin Guards & Thighs (catcher squat stance)
  const leftLeg = new THREE.Group();
  const leftShin = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.42, 8), shinArmorMat);
  leftShin.position.set(-0.24, 0.2, -0.7);
  leftShin.rotation.x = 0.4;
  leftLeg.add(leftShin);
  const leftKneeCap = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), shinArmorMat);
  leftKneeCap.position.set(-0.24, 0.38, -0.62);
  leftLeg.add(leftKneeCap);

  const rightLeg = new THREE.Group();
  const rightShin = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.42, 8), shinArmorMat);
  rightShin.position.set(0.24, 0.2, -0.7);
  rightShin.rotation.x = 0.4;
  rightLeg.add(rightShin);
  const rightKneeCap = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), shinArmorMat);
  rightKneeCap.position.set(0.24, 0.38, -0.62);
  rightLeg.add(rightKneeCap);

  group.add(leftLeg, rightLeg);

  // 2. Torso with Ribbed Chest Protector
  const torsoGroup = new THREE.Group();
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.50, 0.30), uniformMat);
  torso.position.set(0, 0.58, -0.68);
  torso.rotation.x = 0.32; // leaning forward ready for pitch

  const chestPad = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.46, 0.06), chestArmorMat);
  chestPad.position.set(0, 0.58, -0.54);
  chestPad.rotation.x = 0.32;

  torsoGroup.add(torso, chestPad);
  group.add(torsoGroup);

  // 3. Catcher Helmet (Royal Blue skull cap with tan leather padding rim & white center strap as in reference photo)
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.82, -0.68);

  // Royal blue skull cap
  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.165, 16, 16), helmetMat);
  headGroup.add(helmet);

  // White center harness strap across the top of helmet
  const strapGeo = new THREE.BoxGeometry(0.04, 0.18, 0.18);
  const strapMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.8 });
  const strap = new THREE.Mesh(strapGeo, strapMat);
  strap.position.set(0, 0.08, 0.02);
  headGroup.add(strap);

  // Tan / Yellow leather cushion pad rim beneath mask (distinctive feature in reference photo)
  const padRimGeo = new THREE.TorusGeometry(0.16, 0.022, 8, 24, Math.PI);
  const padRimMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.7 });
  const padRim = new THREE.Mesh(padRimGeo, padRimMat);
  padRim.position.set(0, -0.04, 0.06);
  padRim.rotation.x = Math.PI * 0.45;
  headGroup.add(padRim);

  // Steel wire face cage extending forward
  const faceCage = new THREE.Mesh(new THREE.CylinderGeometry(0.145, 0.145, 0.16, 10, 1, true), cageMat);
  faceCage.position.set(0, -0.02, 0.09);
  faceCage.rotation.x = Math.PI / 2;
  headGroup.add(faceCage);

  group.add(headGroup);

  // 4. Catcher's Mitt (Leather Pocket)
  // Positioned around target zone right in front of catcher / behind home plate
  const mittGeo = new THREE.CylinderGeometry(0.16, 0.15, 0.12, 16);
  mittGeo.rotateZ(Math.PI / 2);
  const mitt = new THREE.Mesh(mittGeo, leatherMittMat);
  mitt.position.set(0.0, 0.72, -0.45); // target position right behind plate
  mitt.castShadow = true;

  // Leather web pocket accent
  const pocketGeo = new THREE.SphereGeometry(0.12, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  pocketGeo.rotateX(Math.PI / 2);
  const pocket = new THREE.Mesh(pocketGeo, new THREE.MeshStandardMaterial({ color: 0x4a2800, roughness: 0.6 }));
  pocket.position.set(0, 0, 0.04);
  mitt.add(pocket);

  group.add(mitt);

  // Ground catcher behind home plate
  group.position.set(0, 0, 0);

  return { group, mitt };
}

/**
 * Procedural Jersey Texture with Player Number on the back
 */
export function createJerseyTexture(numberStr: string = '17'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Clean uniform fabric base
  ctx.fillStyle = '#f8f9fa';
  ctx.fillRect(0, 0, 256, 256);

  // Subtle navy pinstripes
  ctx.strokeStyle = '#1d3557';
  ctx.lineWidth = 2;
  for (let x = 16; x < 256; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 256);
    ctx.stroke();
  }

  // Player Name and Number on the back (upper half)
  ctx.fillStyle = '#e63946';
  ctx.strokeStyle = '#1d3557';
  ctx.lineWidth = 4;
  ctx.textAlign = 'center';
  ctx.font = 'bold 84px system-ui, sans-serif';
  ctx.strokeText(numberStr, 128, 140);
  ctx.fillText(numberStr, 128, 140);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export interface BatterModel {
  group: THREE.Group;
  headGroup: THREE.Group;
  batGroup: THREE.Group;
  torsoGroup: THREE.Group;
  stance: BatterStance;
}

/**
 * Composite Procedural Batter Model (12+ distinct parts, Right or Left stance)
 * Authentically positioned squarely in the batter's box next to home plate
 */
export function createBatter(stance: BatterStance = 'RIGHT'): BatterModel {
  const group = new THREE.Group();

  const isRighty = stance === 'RIGHT';
  // Batter stands squarely in the batter's box beside home plate:
  // Righty: left side of plate (x = -0.56m)
  // Lefty: right side of plate (x = +0.56m)
  const posX = isRighty ? -0.56 : 0.56;
  const posZ = -0.08;

  // Materials
  const jerseyTex = createJerseyTexture(isRighty ? '17' : '51');
  const jerseyMat = new THREE.MeshStandardMaterial({
    map: jerseyTex,
    roughness: 0.65,
    metalness: 0.05,
  });
  const solidJerseyMat = new THREE.MeshStandardMaterial({
    color: 0x1d3557, // Navy trim
    roughness: 0.6,
  });
  const pantsMat = new THREE.MeshStandardMaterial({
    color: 0xf1faee, // White pants
    roughness: 0.7,
  });
  const stripeMat = new THREE.MeshStandardMaterial({
    color: 0xe63946, // Red pants stripe
    roughness: 0.6,
  });
  const helmetMat = new THREE.MeshStandardMaterial({
    color: 0x1d3557, // Glossy team batting helmet
    roughness: 0.2,
    metalness: 0.35,
  });
  const batMat = new THREE.MeshStandardMaterial({
    color: 0xd4a373, // Natural blonde lacquered maple/ash
    roughness: 0.3,
    metalness: 0.1,
  });
  const gripMat = new THREE.MeshStandardMaterial({
    color: 0x111111, // Black bat grip tape
    roughness: 0.9,
  });
  const gloveMat = new THREE.MeshStandardMaterial({
    color: 0xe63946, // Red/white batting gloves
    roughness: 0.5,
  });
  const cleatMat = new THREE.MeshStandardMaterial({
    color: 0x1c1917, // Black cleats
    roughness: 0.4,
  });
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xddb892,
    roughness: 0.75,
  });

  // 1. Cleats / Spikes grounded in the batter's box
  const footFront = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.07, 0.26), cleatMat);
  footFront.position.set(isRighty ? 0.06 : -0.06, 0.035, 0.28);
  footFront.rotation.y = isRighty ? 0.25 : -0.25;

  const footBack = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.07, 0.26), cleatMat);
  footBack.position.set(isRighty ? -0.06 : 0.06, 0.035, -0.28);
  footBack.rotation.y = isRighty ? 0.05 : -0.05;

  group.add(footFront, footBack);

  // 2. Legs in Athletic Batting Stance (bent knees, weight balanced)
  // Front leg
  const legFrontGroup = new THREE.Group();
  legFrontGroup.position.set(isRighty ? 0.06 : -0.06, 0.07, 0.28);

  const shinFront = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.42, 8), pantsMat);
  shinFront.position.set(0, 0.2, 0);
  shinFront.rotation.x = -0.15;

  const thighFront = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.065, 0.44, 8), pantsMat);
  thighFront.position.set(0, 0.54, -0.06);
  thighFront.rotation.x = 0.25;

  // Red piping stripe down outer leg
  const stripeFront = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.75, 0.03), stripeMat);
  stripeFront.position.set(isRighty ? -0.07 : 0.07, 0.38, 0);

  legFrontGroup.add(shinFront, thighFront, stripeFront);

  // Back leg (drive leg)
  const legBackGroup = new THREE.Group();
  legBackGroup.position.set(isRighty ? -0.06 : 0.06, 0.07, -0.28);

  const shinBack = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.42, 8), pantsMat);
  shinBack.position.set(0, 0.2, 0);
  shinBack.rotation.x = 0.15;

  const thighBack = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.065, 0.44, 8), pantsMat);
  thighBack.position.set(0, 0.54, 0.06);
  thighBack.rotation.x = -0.25;

  const stripeBack = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.75, 0.03), stripeMat);
  stripeBack.position.set(isRighty ? -0.07 : 0.07, 0.38, 0);

  legBackGroup.add(shinBack, thighBack, stripeBack);

  group.add(legFrontGroup, legBackGroup);

  // 3. Waist & Leather Belt
  const waistGroup = new THREE.Group();
  waistGroup.position.set(0, 0.88, 0);

  const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.17, 0.06, 12), new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.5 }));
  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.04, 0.02), new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.2 }));
  buckle.position.set(isRighty ? 0.17 : -0.17, 0, 0);
  waistGroup.add(belt, buckle);
  group.add(waistGroup);

  // 4. Torso with Striped Jersey & Player Number
  const torsoGroup = new THREE.Group();
  torsoGroup.position.set(0, 1.18, 0);

  // Chest facing home plate (positive X for righty, negative X for lefty)
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.55, 0.44), jerseyMat);
  // Angle shoulders slightly tucked toward pitcher
  torso.rotation.y = isRighty ? 0.15 : -0.15;
  torsoGroup.add(torso);

  // Jersey sleeves / shoulders
  const leftSleeve = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), solidJerseyMat);
  leftSleeve.position.set(0, 0.22, 0.24);
  const rightSleeve = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), solidJerseyMat);
  rightSleeve.position.set(0, 0.22, -0.24);
  torsoGroup.add(leftSleeve, rightSleeve);

  group.add(torsoGroup);

  // 5. Arms & Batting Grip
  // Both arms reach up and back to hold the bat in batting stance
  const armsGroup = new THREE.Group();
  armsGroup.position.set(0, 1.25, 0);

  // Front arm
  const frontUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.045, 0.32, 8), skinMat);
  frontUpperArm.position.set(isRighty ? -0.05 : 0.05, 0.05, 0.18);
  frontUpperArm.rotation.x = isRighty ? -0.6 : 0.6;
  frontUpperArm.rotation.z = isRighty ? -0.4 : 0.4;

  const frontForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.28, 8), skinMat);
  frontForearm.position.set(isRighty ? -0.12 : 0.12, 0.22, 0.02);
  frontForearm.rotation.x = isRighty ? 0.9 : -0.9;

  // Back arm
  const backUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.045, 0.32, 8), skinMat);
  backUpperArm.position.set(isRighty ? -0.15 : 0.15, 0.08, -0.18);
  backUpperArm.rotation.x = isRighty ? 0.7 : -0.7;

  const backForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.28, 8), skinMat);
  backForearm.position.set(isRighty ? -0.15 : 0.15, 0.26, -0.05);
  backForearm.rotation.x = isRighty ? 1.2 : -1.2;

  // Batting gloves holding handle
  const gloves = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.16, 8), gloveMat);
  gloves.position.set(isRighty ? -0.16 : 0.16, 0.36, -0.04);
  gloves.rotation.x = 0.3;

  armsGroup.add(frontUpperArm, frontForearm, backUpperArm, backForearm, gloves);
  group.add(armsGroup);

  // 6. Bat held high and ready (with dedicated batGroup for waggle animation)
  const batGroup = new THREE.Group();
  batGroup.position.set(isRighty ? -0.16 : 0.16, 1.62, -0.04);

  // Bat Handle with grip tape
  const handleGeo = new THREE.CylinderGeometry(0.016, 0.018, 0.28, 12);
  const handleMesh = new THREE.Mesh(handleGeo, gripMat);
  handleMesh.position.y = 0.12;

  // Bat Knob at base
  const knobGeo = new THREE.CylinderGeometry(0.026, 0.026, 0.02, 12);
  const knobMesh = new THREE.Mesh(knobGeo, batMat);
  knobMesh.position.y = -0.01;

  // Taper & Barrel (thick hitting area)
  const taperGeo = new THREE.CylinderGeometry(0.038, 0.018, 0.36, 12);
  const taperMesh = new THREE.Mesh(taperGeo, batMat);
  taperMesh.position.y = 0.42;

  const barrelGeo = new THREE.CylinderGeometry(0.042, 0.038, 0.34, 12);
  const barrelMesh = new THREE.Mesh(barrelGeo, batMat);
  barrelMesh.position.y = 0.76;

  // Gold brand logo accent
  const logoBandGeo = new THREE.CylinderGeometry(0.0425, 0.0425, 0.04, 12);
  const logoMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.2 });
  const logoBand = new THREE.Mesh(logoBandGeo, logoMat);
  logoBand.position.y = 0.72;

  // Bat default cocked angle (upright, pointing toward sky as in reference photo)
  batGroup.rotation.z = isRighty ? 0.12 : -0.12;
  batGroup.rotation.x = -0.18;
  batGroup.castShadow = true;

  group.add(batGroup);

  // 7. Head, Face & Pro Batting Helmet
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.56, 0);

  // Neck
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.065, 0.12, 8), skinMat);
  neck.position.y = -0.05;
  headGroup.add(neck);

  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), skinMat);
  headGroup.add(head);

  // Royal Blue Batting Helmet (Dodgers style as in reference photo)
  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.142, 16, 16), helmetMat);
  helmet.position.set(0, 0.03, 0);
  headGroup.add(helmet);

  // Front Visor Brim (pointing toward pitcher)
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.018, 0.14), helmetMat);
  visor.position.set(0, 0.06, 0.14);
  visor.rotation.x = -0.18;
  headGroup.add(visor);

  // Protective Earflap (on the ear facing the pitcher)
  const earflapGeo = new THREE.BoxGeometry(0.02, 0.11, 0.09);
  const earflap = new THREE.Mesh(earflapGeo, helmetMat);
  earflap.position.set(isRighty ? 0.12 : -0.12, -0.03, 0.02);
  headGroup.add(earflap);

  // White "17" and sponsor decal on the back of the helmet (clearly visible to umpire as in reference photo)
  const decalGeo = new THREE.BoxGeometry(0.06, 0.035, 0.01);
  const decalMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const decal = new THREE.Mesh(decalGeo, decalMat);
  decal.position.set(isRighty ? 0.03 : -0.03, 0.06, -0.138);
  decal.rotation.y = isRighty ? 0.2 : -0.2;
  headGroup.add(decal);

  // Turn head toward pitcher (+Z) so batter tracks the mound
  headGroup.rotation.y = isRighty ? 0.35 : -0.35;

  group.add(headGroup);

  // Position the whole batter in the batter's box next to home plate
  group.position.set(posX, 0, posZ);

  return {
    group,
    headGroup,
    batGroup,
    torsoGroup,
    stance,
  };
}

export interface PitcherRig {
  group: THREE.Group;
  bodyRoot: THREE.Group;
  pelvis: THREE.Group;
  torso: THREE.Group;
  headGroup: THREE.Group;

  // Throwing arm (Right arm)
  rightShoulder: THREE.Group;
  rightUpperArm: THREE.Group;
  rightElbow: THREE.Group;
  rightForearm: THREE.Group;
  rightHand: THREE.Group;
  ballSocket: THREE.Group;

  // Glove arm (Left arm)
  leftShoulder: THREE.Group;
  leftUpperArm: THREE.Group;
  leftElbow: THREE.Group;
  leftForearm: THREE.Group;
  gloveGroup: THREE.Group;

  // Lead leg (Left leg - strides toward home plate)
  leftHip: THREE.Group;
  leftThigh: THREE.Group;
  leftKnee: THREE.Group;
  leftShin: THREE.Group;
  leftFoot: THREE.Group;

  // Pivot leg (Right leg - pushes off rubber)
  rightHip: THREE.Group;
  rightThigh: THREE.Group;
  rightKnee: THREE.Group;
  rightShin: THREE.Group;
  rightFoot: THREE.Group;

  setPose: (phase: 'IDLE' | 'WINDUP' | 'FLIGHT' | 'FOLLOW_THROUGH', progress: number, time?: number) => void;
  getBallSocketWorldPos: (targetVec: THREE.Vector3) => THREE.Vector3;
}

/**
 * Creates custom Pitcher Ace Jersey Texture (No. 18 with navy pinstripes)
 */
export function createPitcherJerseyTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Clean uniform fabric base
  ctx.fillStyle = '#f8f9fa';
  ctx.fillRect(0, 0, 256, 256);

  // Navy pinstripes
  ctx.strokeStyle = '#1d3557';
  ctx.lineWidth = 2;
  for (let x = 16; x < 256; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 256);
    ctx.stroke();
  }

  // Ace Pitcher Number 18 on back
  ctx.fillStyle = '#e63946';
  ctx.strokeStyle = '#1d3557';
  ctx.lineWidth = 4;
  ctx.textAlign = 'center';
  ctx.font = 'bold 88px system-ui, sans-serif';
  ctx.strokeText('18', 128, 140);
  ctx.fillText('18', 128, 140);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Highly Articulated Pro Baseball Pitcher Rig on the Mound
 * Features a 100% interconnected anatomical kinematic chain:
 * Pelvis -> Spine/Torso -> Shoulders -> Elbows -> Wrists -> Fingers & Ball Socket
 * Pelvis -> Hips -> Thighs -> Knees -> Shins -> Cleats
 */
export function createPitcher(): PitcherRig {
  const group = new THREE.Group();

  // Root placed at pitcher rubber (18.44m away from home plate, y = 0.26m on mound)
  group.position.set(0, 0.26, 18.44);

  // Materials
  const jerseyTex = createPitcherJerseyTexture();
  const jerseyMat = new THREE.MeshStandardMaterial({
    map: jerseyTex,
    roughness: 0.65,
    metalness: 0.05,
  });
  const navyTrimMat = new THREE.MeshStandardMaterial({
    color: 0x1d3557, // Deep royal navy
    roughness: 0.55,
  });
  const compressionSleeveMat = new THREE.MeshStandardMaterial({
    color: 0x14213d, // Dark compression sleeve on right arm
    roughness: 0.45,
  });
  const pantsMat = new THREE.MeshStandardMaterial({
    color: 0xf8f9fa, // Clean white pants
    roughness: 0.7,
  });
  const stripeMat = new THREE.MeshStandardMaterial({
    color: 0xe63946, // Red uniform piping
    roughness: 0.6,
  });
  const capMat = new THREE.MeshStandardMaterial({
    color: 0x1d3557, // Navy baseball cap
    roughness: 0.35,
    metalness: 0.2,
  });
  const gloveMat = new THREE.MeshStandardMaterial({
    color: 0x78350f, // Rich tan/brown leather glove
    roughness: 0.4,
    metalness: 0.08,
  });
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xddb892,
    roughness: 0.75,
  });
  const beltMat = new THREE.MeshStandardMaterial({
    color: 0x1c1917,
    roughness: 0.5,
  });
  const buckleMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    metalness: 0.85,
    roughness: 0.2,
  });
  const cleatMat = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.4,
  });
  const studMat = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    metalness: 0.9,
    roughness: 0.2,
  });

  // Body Root (translates forward along -Z toward home plate during stride)
  const bodyRoot = new THREE.Group();
  group.add(bodyRoot);

  // Pelvis / Hips (Root of torso and leg kinematics, standard height 0.88m)
  const pelvis = new THREE.Group();
  pelvis.position.set(0, 0.88, 0);
  bodyRoot.add(pelvis);

  // Waist & Belt meshes
  const waistMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.17, 0.12, 12), pantsMat);
  waistMesh.position.y = 0.04;
  const beltMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.182, 0.182, 0.045, 12), beltMat);
  beltMesh.position.y = 0.07;
  const buckleMesh = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.035, 0.02), buckleMat);
  buckleMesh.position.set(0, 0.07, -0.18);
  pelvis.add(waistMesh, beltMesh, buckleMesh);

  // ===================== LEGS =====================
  // Helper to construct articulated leg (Hip -> Thigh -> Knee -> Shin -> Foot)
  const createArticulatedLeg = (isLeadLeg: boolean) => {
    const hip = new THREE.Group();
    hip.position.set(isLeadLeg ? -0.11 : 0.11, 0, 0);

    // Thigh (length 0.42m)
    const thighGroup = new THREE.Group();
    const thighMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.065, 0.42, 10), pantsMat);
    thighMesh.position.y = -0.21;
    thighMesh.castShadow = true;

    // Red piping stripe down outer side of thigh
    const thighStripe = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.42, 0.025), stripeMat);
    thighStripe.position.set(isLeadLeg ? -0.075 : 0.075, -0.21, 0);
    thighGroup.add(thighMesh, thighStripe);
    hip.add(thighGroup);

    // Knee joint at -0.42m
    const knee = new THREE.Group();
    knee.position.set(0, -0.42, 0);
    const kneeCap = new THREE.Mesh(new THREE.SphereGeometry(0.072, 8, 8), pantsMat);
    knee.add(kneeCap);

    // Shin (length 0.40m)
    const shinGroup = new THREE.Group();
    const shinMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.052, 0.40, 10), pantsMat);
    shinMesh.position.y = -0.20;
    shinMesh.castShadow = true;

    const shinStripe = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.40, 0.022), stripeMat);
    shinStripe.position.set(isLeadLeg ? -0.06 : 0.06, -0.20, 0);
    shinGroup.add(shinMesh, shinStripe);
    knee.add(shinGroup);

    // Foot / Cleat at -0.40m
    const foot = new THREE.Group();
    foot.position.set(0, -0.40, 0);

    // Cleat body pointing toward home plate (-Z)
    const cleatBody = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.07, 0.25), cleatMat);
    cleatBody.position.set(0, 0.035, -0.04);
    cleatBody.castShadow = true;

    // Cleat metallic spikes
    const soleSpikes = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.015, 0.22), studMat);
    soleSpikes.position.set(0, 0.005, -0.04);
    foot.add(cleatBody, soleSpikes);
    knee.add(foot);

    hip.add(knee);

    return { hip, thigh: thighGroup, knee, shin: shinGroup, foot };
  };

  const leftLeg = createArticulatedLeg(true); // Lead leg
  const rightLeg = createArticulatedLeg(false); // Pivot leg
  pelvis.add(leftLeg.hip, rightLeg.hip);

  // ===================== TORSO & HEAD =====================
  const torso = new THREE.Group();
  torso.position.set(0, 0.10, 0);
  pelvis.add(torso);

  // Torso Chest & Back
  const torsoMesh = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.52, 0.25), jerseyMat);
  torsoMesh.position.set(0, 0.26, 0);
  torsoMesh.castShadow = true;
  torso.add(torsoMesh);

  // Jersey center buttons & collar trim
  const collarTrim = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.13, 0.04, 10), navyTrimMat);
  collarTrim.position.set(0, 0.51, 0);
  torso.add(collarTrim);

  // Neck & Head
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.54, 0);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.065, 0.10, 8), skinMat);
  neck.position.y = 0.04;
  headGroup.add(neck);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), skinMat);
  head.position.y = 0.14;
  headGroup.add(head);

  // Pitcher Cap
  const capDome = new THREE.Mesh(new THREE.SphereGeometry(0.135, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2), capMat);
  capDome.position.y = 0.17;
  headGroup.add(capDome);

  const capButton = new THREE.Mesh(new THREE.SphereGeometry(0.015, 6, 6), navyTrimMat);
  capButton.position.set(0, 0.305, 0);
  headGroup.add(capButton);

  // Curved Cap Visor extending forward (-Z toward home plate)
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.018, 0.13), capMat);
  visor.position.set(0, 0.19, -0.12);
  visor.rotation.x = 0.15;
  headGroup.add(visor);

  torso.add(headGroup);

  // ===================== GLOVE ARM (LEFT) =====================
  const leftShoulder = new THREE.Group();
  leftShoulder.position.set(-0.24, 0.44, 0);

  const leftShoulderCap = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), navyTrimMat);
  leftShoulder.add(leftShoulderCap);

  const leftUpperArm = new THREE.Group();
  const leftUpperArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.046, 0.28, 8), jerseyMat);
  leftUpperArmMesh.position.y = -0.14;
  leftUpperArm.add(leftUpperArmMesh);
  leftShoulder.add(leftUpperArm);

  const leftElbow = new THREE.Group();
  leftElbow.position.set(0, -0.28, 0);

  const leftForearm = new THREE.Group();
  const leftForearmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.042, 0.26, 8), skinMat);
  leftForearmMesh.position.y = -0.13;
  leftForearm.add(leftForearmMesh);
  leftElbow.add(leftForearm);

  // Detailed 3D Leather Fielding Glove
  const gloveGroup = new THREE.Group();
  gloveGroup.position.set(0, -0.26, 0);

  const glovePalm = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.16, 0.11), gloveMat);
  glovePalm.position.set(0, -0.02, 0);
  const gloveWeb = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.08), gloveMat);
  gloveWeb.position.set(0.08, 0.02, 0);
  const glovePocket = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshStandardMaterial({ color: 0x5a2d0c, roughness: 0.6 }));
  glovePocket.position.set(0.03, -0.01, -0.03);
  glovePocket.scale.set(1.0, 1.2, 0.6);

  gloveGroup.add(glovePalm, gloveWeb, glovePocket);
  leftElbow.add(gloveGroup);
  torso.add(leftShoulder);

  // ===================== THROWING ARM (RIGHT) =====================
  const rightShoulder = new THREE.Group();
  rightShoulder.position.set(0.24, 0.44, 0);

  const rightShoulderCap = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), navyTrimMat);
  rightShoulder.add(rightShoulderCap);

  const rightUpperArm = new THREE.Group();
  // Compression sleeve on pitching bicep
  const rightUpperArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.046, 0.28, 8), compressionSleeveMat);
  rightUpperArmMesh.position.y = -0.14;
  rightUpperArm.add(rightUpperArmMesh);
  rightShoulder.add(rightUpperArm);

  const rightElbow = new THREE.Group();
  rightElbow.position.set(0, -0.28, 0);

  const rightForearm = new THREE.Group();
  const rightForearmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.042, 0.26, 8), skinMat);
  rightForearmMesh.position.y = -0.13;
  rightForearm.add(rightForearmMesh);
  rightElbow.add(rightForearm);

  // Pitcher Hand & Grip Socket
  const rightHand = new THREE.Group();
  rightHand.position.set(0, -0.26, 0);

  const handMesh = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.09, 0.06), skinMat);
  handMesh.position.set(0, -0.03, 0);
  // Fingers curling around baseball
  const fingers = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.04, 0.07), skinMat);
  fingers.position.set(0, -0.06, -0.02);
  rightHand.add(handMesh, fingers);

  // Ball Socket: the exact physical socket where baseball is held
  const ballSocket = new THREE.Group();
  ballSocket.position.set(0, -0.05, -0.04);
  rightHand.add(ballSocket);

  rightElbow.add(rightHand);
  torso.add(rightShoulder);

  // ===================== KINEMATIC POSE SOLVER =====================
  /**
   * Evaluates the authentic professional pitching kinetic chain:
   * Leg kick & coiling -> Stride & separation -> Scapular load/layback -> Arm whip & release -> Follow-through
   */
  const setPose = (phase: 'IDLE' | 'WINDUP' | 'FLIGHT' | 'FOLLOW_THROUGH', progress: number, time: number = 0) => {
    if (phase === 'IDLE') {
      // 1. Authentic MLB/NPB Set Stance on the Rubber
      bodyRoot.position.set(0, 0, 0);
      pelvis.position.set(0, 0.88, 0);

      // Turned sideways to home plate (~76°)
      pelvis.rotation.set(0, 1.32, 0);
      torso.rotation.set(0, 0.06, 0);
      torso.position.y = 0.10 + Math.sin(time * 2.4) * 0.003; // breathing

      // Head peers straight down the slot at the catcher
      headGroup.rotation.set(0, -1.38, 0);

      // Hands joined at chest in the set position, ball inside glove
      leftShoulder.rotation.set(-0.35, -0.22, 0.48);
      leftElbow.rotation.set(1.42, 0.18, 0);

      rightShoulder.rotation.set(-0.38, 0.20, -0.48);
      rightElbow.rotation.set(1.45, -0.16, 0);
      rightHand.rotation.set(0, 0, 0);

      // Lead leg (Left): relaxed stance in front of rubber
      leftLeg.hip.rotation.set(-0.12, 0, 0.05);
      leftLeg.knee.rotation.set(0.18, 0, 0);
      leftLeg.foot.rotation.set(0, 0, 0);

      // Pivot leg (Right): firmly on the rubber
      rightLeg.hip.rotation.set(0.05, 0, -0.05);
      rightLeg.knee.rotation.set(0.10, 0, 0);
      rightLeg.foot.rotation.set(0, 0, 0);
      return;
    }

    if (phase === 'WINDUP') {
      const p = Math.max(0, Math.min(1.0, progress));

      if (p < 0.36) {
        // ----------------------------------------------------
        // Stage 1: High Leg Kick & Weight Coil (Balance Point)
        // ----------------------------------------------------
        const t = p / 0.36;
        const ease = 0.5 - 0.5 * Math.cos(t * Math.PI);

        bodyRoot.position.set(0, 0, 0);
        pelvis.position.set(0, 0.88 + 0.03 * ease, 0);

        // Pelvis coils back slightly
        pelvis.rotation.set(0, 1.32 + 0.18 * ease, 0);
        torso.rotation.set(0, 0.06 + 0.10 * ease, 0.04 * ease);
        headGroup.rotation.set(0, -(pelvis.rotation.y + torso.rotation.y), 0);

        // Lead leg (Left) lifts high into chest, knee bent sharply
        leftLeg.hip.rotation.set(-1.68 * ease, 0, -0.22 * ease);
        leftLeg.knee.rotation.set(1.85 * ease, 0, 0);
        leftLeg.foot.rotation.set(0.25 * ease, 0, 0);

        // Pivot leg (Right) sits slightly into glute for power
        rightLeg.hip.rotation.set(-0.10 * ease, 0, -0.04);
        rightLeg.knee.rotation.set(0.24 * ease, 0, 0);
        rightLeg.foot.rotation.set(0, 0, 0);

        // Hands stay together at chest, raising slightly with knee
        leftShoulder.rotation.set(-0.45 * ease, -0.15, 0.55);
        leftElbow.rotation.set(1.50, 0.15, 0);

        rightShoulder.rotation.set(-0.45 * ease, 0.15, -0.55);
        rightElbow.rotation.set(1.50, -0.15, 0);
        rightHand.rotation.set(0, 0, 0);
      } else if (p < 0.70) {
        // ----------------------------------------------------
        // Stage 2: Stride Forward & Hand Separation (The Break)
        // ----------------------------------------------------
        const t = (p - 0.36) / 0.34;
        const ease = Math.pow(t, 1.25);

        // Dynamic forward stride toward home plate (along -Z)
        bodyRoot.position.set(0, 0, -1.55 * ease);
        pelvis.position.set(0, 0.88 - 0.14 * Math.sin(t * Math.PI * 0.82), 0);

        // Hips begin to uncoil toward home plate
        pelvis.rotation.set(0, 1.50 * (1 - ease) + 0.28 * ease, 0);

        // Torso keeps shoulders closed longer (Hip-Shoulder Separation!)
        torso.rotation.set(0, 0.16 * (1 - ease) + 0.45 * Math.sin(t * Math.PI), 0.12 * ease);
        headGroup.rotation.set(0, -(pelvis.rotation.y + torso.rotation.y), 0);

        // Lead leg (Left) reaches forward and lands
        leftLeg.hip.rotation.set(-1.68 * (1 - t) - 0.42 * t, 0, -0.22 * (1 - t));
        leftLeg.knee.rotation.set(1.85 * (1 - t) + 0.55 * t, 0, 0);
        leftLeg.foot.rotation.set(0.25 * (1 - t), 0, 0);

        // Pivot leg (Right) drives off the rubber
        rightLeg.hip.rotation.set(0.55 * ease, 0, -0.04);
        rightLeg.knee.rotation.set(0.24 * (1 - t) + 0.08 * t, 0, 0);

        // Hands break apart:
        // Glove arm reaches forward toward target for front-side stability
        leftShoulder.rotation.set(-0.85 * ease, -0.42 * ease, 0.35);
        leftElbow.rotation.set(0.65 * (1 - ease), 0, 0);

        // Throwing arm swings down, back, and cocks up into 90° scapular pinch
        rightShoulder.rotation.set(0.75 * ease, -0.65 * ease, -1.45 * ease);
        rightElbow.rotation.set(1.57 * ease, -0.60 * ease, 0);
        rightHand.rotation.set(0, 0, 0);
      } else if (p < 0.86) {
        // ----------------------------------------------------
        // Stage 3: Maximum External Rotation (Layback)
        // ----------------------------------------------------
        const t = (p - 0.70) / 0.16;
        const ease = Math.pow(t, 1.2);

        bodyRoot.position.set(0, 0, -1.55 - 0.15 * ease);
        pelvis.position.set(0, 0.88 - 0.14, 0);

        // Pelvis opens fully toward home plate
        pelvis.rotation.set(0, 0.28 * (1 - ease), 0);

        // Torso drives forward with lateral tilt for 3/4 release slot
        torso.rotation.set(0.40 * ease, -0.15 * ease, 0.28 * ease);
        headGroup.rotation.set(0, -(pelvis.rotation.y + torso.rotation.y), 0);

        // Lead leg is firmly braced
        leftLeg.hip.rotation.set(-0.42, 0, 0);
        leftLeg.knee.rotation.set(0.55 + 0.10 * ease, 0, 0);

        // Glove arm tucks firmly into left ribcage
        leftShoulder.rotation.set(0.35 * ease, 0.45 * ease, 0.25 * ease);
        leftElbow.rotation.set(1.85 * ease, 0, 0);

        // Throwing arm experiences extreme layback (forearm horizontal pointing back)
        rightShoulder.rotation.set(0.75 - 0.65 * ease, -0.65, -1.45);
        rightElbow.rotation.set(1.57, -0.60 - 1.05 * ease, 0);
        rightHand.rotation.set(-0.25 * ease, 0, 0);
      } else {
        // ----------------------------------------------------
        // Stage 4: Arm Acceleration & Release Apex
        // ----------------------------------------------------
        const t = (p - 0.86) / 0.14;
        const ease = Math.pow(t, 1.7);

        bodyRoot.position.set(0, 0, -1.70);
        pelvis.position.set(0, 0.74, 0);
        pelvis.rotation.set(0, 0, 0);

        // Trunk forward flexion over braced lead knee
        torso.rotation.set(0.40 + 0.45 * ease, -0.15 - 0.10 * ease, 0.28);
        headGroup.rotation.set(0, 0, 0);

        leftLeg.hip.rotation.set(-0.42, 0, 0);
        leftLeg.knee.rotation.set(0.65, 0, 0);

        // Throwing arm whips violently forward overhead:
        // Forearm snaps forward, elbow extends rapidly toward release apex
        rightShoulder.rotation.set(0.10 - 1.05 * ease, -0.65 + 0.45 * ease, -1.45 + 0.35 * ease);
        rightElbow.rotation.set(1.57 * (1 - ease) + 0.22 * ease, -1.65 * (1 - ease) + 0.45 * ease, 0);
        rightHand.rotation.set(-0.25 - 0.35 * ease, 0, 0);
      }
      return;
    }

    if (phase === 'FLIGHT' || phase === 'FOLLOW_THROUGH') {
      // ----------------------------------------------------
      // Follow-Through: Deceleration & Balanced Landing
      // ----------------------------------------------------
      const t = Math.max(0, Math.min(1.0, progress));
      const ease = 1 - Math.pow(1 - t, 2.0);

      bodyRoot.position.set(0, 0, -1.70);
      pelvis.position.set(0, 0.74, 0);
      pelvis.rotation.set(0, -0.15 * ease, 0);

      // Deep torso bow over front knee
      torso.rotation.set(0.85 + 0.22 * ease, -0.25 - 0.12 * ease, 0.28 + 0.10 * ease);
      headGroup.rotation.set(0, 0.15 * ease, 0);

      // Throwing arm decelerates smoothly across the body toward left hip
      rightShoulder.rotation.set(-0.95 - 0.30 * ease, -0.20 + 0.40 * ease, -1.10 + 1.65 * ease);
      rightElbow.rotation.set(0.22 + 1.15 * ease, 0.45 - 0.65 * ease, 0);
      rightHand.rotation.set(-0.6, 0, 0);

      // Glove arm tucked in tight
      leftShoulder.rotation.set(0.40, 0.50, 0.30);
      leftElbow.rotation.set(1.85, 0, 0);

      // Lead leg absorbs landing weight
      leftLeg.hip.rotation.set(-0.42, 0, 0);
      leftLeg.knee.rotation.set(0.65 + 0.12 * ease, 0, 0);

      // Drive leg (Right) lifts off rubber and kicks high into the air!
      rightLeg.hip.rotation.set(0.55 + 0.65 * ease, 0, 0.35 * ease);
      rightLeg.knee.rotation.set(0.08 + 1.30 * ease, 0, 0);
      rightLeg.foot.rotation.set(0.4 * ease, 0, 0);
    }
  };

  const getBallSocketWorldPos = (targetVec: THREE.Vector3) => {
    // Ensure all local transforms are updated to world matrix
    group.updateMatrixWorld(true);
    ballSocket.getWorldPosition(targetVec);
    return targetVec;
  };

  // Initialize in realistic Set Stance
  setPose('IDLE', 0, 0);

  return {
    group,
    bodyRoot,
    pelvis,
    torso,
    headGroup,
    rightShoulder,
    rightUpperArm,
    rightElbow,
    rightForearm,
    rightHand,
    ballSocket,
    leftShoulder,
    leftUpperArm,
    leftElbow,
    leftForearm,
    gloveGroup,
    leftHip: leftLeg.hip,
    leftThigh: leftLeg.thigh,
    leftKnee: leftLeg.knee,
    leftShin: leftLeg.shin,
    leftFoot: leftLeg.foot,
    rightHip: rightLeg.hip,
    rightThigh: rightLeg.thigh,
    rightKnee: rightLeg.knee,
    rightShin: rightLeg.shin,
    rightFoot: rightLeg.foot,
    setPose,
    getBallSocketWorldPos,
  };
}

/**
 * 3D Stadium Environment (Field, Mound, Grandstand, Floodlight Towers, Wall)
 */
export function createStadiumEnvironment(): THREE.Group {
  const stadium = new THREE.Group();

  // 1. Large Grass Field
  const turfTex = createTurfTexture();
  const fieldGeo = new THREE.PlaneGeometry(160, 160);
  fieldGeo.rotateX(-Math.PI / 2);
  const fieldMat = new THREE.MeshStandardMaterial({
    map: turfTex,
    roughness: 0.85,
    metalness: 0.05,
  });
  const fieldMesh = new THREE.Mesh(fieldGeo, fieldMat);
  fieldMesh.receiveShadow = true;
  stadium.add(fieldMesh);

  // 2. Home Plate Infield Dirt Circle
  const dirtTex = createDirtTexture();
  const dirtGeo = new THREE.CircleGeometry(4.2, 32);
  dirtGeo.rotateX(-Math.PI / 2);
  const dirtMat = new THREE.MeshStandardMaterial({
    map: dirtTex,
    roughness: 0.9,
    metalness: 0.02,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const homeDirtMesh = new THREE.Mesh(dirtGeo, dirtMat);
  homeDirtMesh.position.set(0, 0.002, -0.2);
  homeDirtMesh.receiveShadow = true;
  stadium.add(homeDirtMesh);

  // 3. Pitcher's Mound (Elevated dirt circle + Pitcher Rubber)
  const moundGeo = new THREE.CylinderGeometry(2.7, 2.9, 0.25, 32);
  const moundMesh = new THREE.Mesh(moundGeo, dirtMat);
  moundMesh.position.set(0, 0.125, 18.44);
  moundMesh.receiveShadow = true;
  stadium.add(moundMesh);

  // Pitcher rubber slab (white)
  const rubberGeo = new THREE.BoxGeometry(0.61, 0.02, 0.15);
  const rubberMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
  const rubberMesh = new THREE.Mesh(rubberGeo, rubberMat);
  rubberMesh.position.set(0, 0.26, 18.44);
  stadium.add(rubberMesh);

  // 4. Foul Lines (Left and Right extending out from home plate)
  const foulLineMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
  const createFoulLine = (angle: number) => {
    const lineGeo = new THREE.BoxGeometry(0.1, 0.005, 90);
    const lineMesh = new THREE.Mesh(lineGeo, foulLineMat);
    lineMesh.rotation.y = angle;
    lineMesh.position.set(Math.sin(angle) * 45, 0.003, Math.cos(angle) * 45);
    return lineMesh;
  };
  stadium.add(createFoulLine(Math.PI * 0.25)); // 45 deg Right
  stadium.add(createFoulLine(-Math.PI * 0.25)); // 45 deg Left

  // 5. Outfield Wall (Center field 120m, corners 100m)
  const wallGeo = new THREE.CylinderGeometry(85, 85, 4.5, 32, 1, true, -Math.PI * 0.35, Math.PI * 0.7);
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x0f2b1d, // Deep ballpark forest green
    roughness: 0.6,
    metalness: 0.2,
  });
  const wallMesh = new THREE.Mesh(wallGeo, wallMat);
  wallMesh.position.set(0, 2.25, 0);
  stadium.add(wallMesh);

  // Top yellow line on outfield fence
  const topBarGeo = new THREE.CylinderGeometry(85.1, 85.1, 0.15, 32, 1, true, -Math.PI * 0.35, Math.PI * 0.7);
  const yellowMat = new THREE.MeshBasicMaterial({ color: 0xffd166 });
  const topBar = new THREE.Mesh(topBarGeo, yellowMat);
  topBar.position.set(0, 4.5, 0);
  stadium.add(topBar);

  // 6. Outfield Scoreboard Backdrop
  const boardGeo = new THREE.BoxGeometry(32, 14, 1.5);
  const boardMat = new THREE.MeshStandardMaterial({ color: 0x111b24, roughness: 0.8 });
  const boardMesh = new THREE.Mesh(boardGeo, boardMat);
  boardMesh.position.set(0, 11, 86);
  stadium.add(boardMesh);

  // 7. Four Grand Floodlight Towers (Stadium Lights)
  const towerPositions = [
    { x: -45, z: 25 },
    { x: 45, z: 25 },
    { x: -55, z: 65 },
    { x: 55, z: 65 },
  ];

  towerPositions.forEach((pos) => {
    const towerGroup = new THREE.Group();
    towerGroup.position.set(pos.x, 0, pos.z);

    // Lattice steel pillar
    const pillarGeo = new THREE.CylinderGeometry(0.8, 1.4, 28, 6);
    const steelMat = new THREE.MeshStandardMaterial({ color: 0x495057, metalness: 0.8, roughness: 0.4 });
    const pillar = new THREE.Mesh(pillarGeo, steelMat);
    pillar.position.y = 14;
    towerGroup.add(pillar);

    // Floodlight rack at top
    const rackGeo = new THREE.BoxGeometry(7, 4, 1);
    const rack = new THREE.Mesh(rackGeo, steelMat);
    rack.position.set(0, 28, 0);
    rack.lookAt(0, 5, 10);
    towerGroup.add(rack);

    // Glowing floodlight bank
    const glowGeo = new THREE.BoxGeometry(6.6, 3.6, 0.3);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xfff3bf });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.set(0, 28, 0.4);
    glow.lookAt(0, 5, 10);
    towerGroup.add(glow);

    stadium.add(towerGroup);
  });

  return stadium;
}

/**
 * 3D Strike Zone Wireframe with 3x3 Grid (Statcast box)
 */
export function createStrikeZoneBox(): {
  group: THREE.Group;
  setVisible: (v: boolean) => void;
  setHighlight: (isStrike: boolean) => void;
} {
  const group = new THREE.Group();

  // Zone bounds
  const w = 0.432; // width
  const h = 0.60; // 1.08 - 0.48
  const centerY = 0.78; // 0.48 + 0.30

  // 1. Outer Box Wireframe
  const outerEdges = new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, 0.432));
  const outerMat = new THREE.LineBasicMaterial({
    color: 0x4cc9f0,
    transparent: true,
    opacity: 0.65,
    linewidth: 2,
  });
  const outerLine = new THREE.LineSegments(outerEdges, outerMat);
  outerLine.position.set(0, centerY, -0.216);
  group.add(outerLine);

  // 2. Front 3x3 Grid Plate
  const gridGroup = new THREE.Group();
  gridGroup.position.set(0, centerY, 0.0);

  const gridMat = new THREE.LineBasicMaterial({
    color: 0x4cc9f0,
    transparent: true,
    opacity: 0.75,
  });

  // Vertical dividing lines (2 lines)
  const v1Geo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-w / 6, -h / 2, 0),
    new THREE.Vector3(-w / 6, h / 2, 0),
  ]);
  const v2Geo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(w / 6, -h / 2, 0),
    new THREE.Vector3(w / 6, h / 2, 0),
  ]);

  // Horizontal dividing lines (2 lines)
  const h1Geo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-w / 2, -h / 6, 0),
    new THREE.Vector3(w / 2, -h / 6, 0),
  ]);
  const h2Geo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-w / 2, h / 6, 0),
    new THREE.Vector3(w / 2, h / 6, 0),
  ]);

  gridGroup.add(
    new THREE.Line(v1Geo, gridMat),
    new THREE.Line(v2Geo, gridMat),
    new THREE.Line(h1Geo, gridMat),
    new THREE.Line(h2Geo, gridMat)
  );

  // Translucent face
  const planeGeo = new THREE.PlaneGeometry(w, h);
  const planeMat = new THREE.MeshBasicMaterial({
    color: 0x4cc9f0,
    transparent: true,
    opacity: 0.08,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const planeMesh = new THREE.Mesh(planeGeo, planeMat);
  planeMesh.position.set(0, centerY, 0.0);

  group.add(gridGroup, planeMesh);

  return {
    group,
    setVisible: (v: boolean) => {
      group.visible = v;
    },
    setHighlight: (isStrike: boolean) => {
      const color = isStrike ? 0xff4d4d : 0x4361ee;
      outerMat.color.setHex(color);
      gridMat.color.setHex(color);
      planeMat.color.setHex(color);
      planeMat.opacity = 0.2;
    },
  };
}
