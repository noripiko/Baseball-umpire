/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { UmpireSceneManager } from './game/sceneManager';
import { generatePitch } from './game/physics';
import {
  GameMode,
  GamePhase,
  GameSettings,
  InningState,
  PitchResult,
  PitchType,
} from './types';
import { sounds } from './audio/soundEffects';
import { ScoreboardHUD } from './components/ScoreboardHUD';
import { CallActionBar } from './components/CallActionBar';
import { StatcastZone } from './components/StatcastZone';
import { BottomControlDock } from './components/BottomControlDock';
import { TitleScreen } from './components/TitleScreen';
import { SummaryModal } from './components/SummaryModal';

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneManagerRef = useRef<UmpireSceneManager | null>(null);

  // Game flow states
  const [gamePhase, setGamePhase] = useState<GamePhase>('TITLE');
  const [gameMode, setGameMode] = useState<GameMode>('CHALLENGE_10');

  // Active pitch & history
  const [currentResult, setCurrentResult] = useState<PitchResult | null>(null);
  const [pitchHistory, setPitchHistory] = useState<PitchResult[]>([]);
  const [pitchIndex, setPitchIndex] = useState(1);
  const [streak, setStreak] = useState(0);

  // Inning state
  const [inningState, setInningState] = useState<InningState>({
    inning: 1,
    isTop: true,
    balls: 0,
    strikes: 0,
    outs: 0,
    totalPitches: 0,
    correctCalls: 0,
    totalCalls: 0,
  });

  // Settings (Default to LEFT matching user's reference photo)
  const [settings, setSettings] = useState<GameSettings>({
    showZoneGuide: false,
    soundVolume: 0.85,
    isMuted: false,
    batterStance: 'LEFT',
    cameraPreset: 'SLOT',
    pitcherVelocityBonus: 0,
  });

  // Practice mode custom pitch type
  const [selectedPracticeType, setSelectedPracticeType] = useState<PitchType>('FOUR_SEAM');

  // Radar gun display during pitch
  const [radarSpeed, setRadarSpeed] = useState<number | null>(null);
  const [radarPitchName, setRadarPitchName] = useState<string | null>(null);

  // Track call reaction time
  const catchTimestampRef = useRef<number>(0);

  // Update sound settings when changed
  useEffect(() => {
    sounds.setMuted(settings.isMuted);
    sounds.setVolume(settings.soundVolume);
  }, [settings.isMuted, settings.soundVolume]);

  // Handle ball caught by catcher's mitt
  const handleBallCaught = useCallback(() => {
    catchTimestampRef.current = performance.now();
    setGamePhase('AWAITING_CALL');
  }, []);

  // Initialize 3D Scene once
  useEffect(() => {
    if (!mountRef.current) return;

    const manager = new UmpireSceneManager(mountRef.current, {
      onBallCaught: () => {
        sounds.playGloveCatch(150);
        handleBallCaught();
      },
      onBallReleased: () => {
        sounds.playPitchWhoosh();
      },
    });

    sceneManagerRef.current = manager;

    return () => {
      manager.destroy();
      sceneManagerRef.current = null;
    };
  }, [handleBallCaught]);

  // Sync settings with scene manager
  const handleUpdateSettings = useCallback((newSettings: Partial<GameSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      if (sceneManagerRef.current) {
        if (newSettings.cameraPreset) {
          sceneManagerRef.current.setCameraPreset(newSettings.cameraPreset);
        }
        if (newSettings.showZoneGuide !== undefined) {
          sceneManagerRef.current.setZoneGuideVisible(newSettings.showZoneGuide);
        }
        if (newSettings.batterStance) {
          sceneManagerRef.current.setBatterStance(newSettings.batterStance);
        }
      }
      return updated;
    });
  }, []);

  // Throw a new pitch
  const throwNextPitch = useCallback(() => {
    if (!sceneManagerRef.current) return;

    const pitchId = pitchIndex;
    const forcedType = gameMode === 'TRAINING' ? selectedPracticeType : undefined;
    const { definition, result, trajectoryPoints } = generatePitch(
      pitchId,
      forcedType,
      settings.pitcherVelocityBonus,
      settings.batterStance
    );

    setCurrentResult(result);
    setRadarSpeed(definition.speedKmh);
    setRadarPitchName(definition.nameJa);
    setGamePhase('BALL_IN_FLIGHT');

    // Flight duration depends on pitch speed: 160km/h is approx 0.38s, 115km/h is approx 0.52s
    const flightSec = (18.44 / (definition.speedKmh / 3.6)) * 0.95;

    sceneManagerRef.current.pitchBall(trajectoryPoints, result, flightSec);
  }, [pitchIndex, gameMode, selectedPracticeType, settings.pitcherVelocityBonus, settings.batterStance]);

  // Start new game
  const handleStartGame = useCallback(
    (mode: GameMode) => {
      setGameMode(mode);
      setPitchIndex(1);
      setPitchHistory([]);
      setStreak(0);
      setInningState({
        inning: 1,
        isTop: true,
        balls: 0,
        strikes: 0,
        outs: 0,
        totalPitches: 0,
        correctCalls: 0,
        totalCalls: 0,
      });

      if (sceneManagerRef.current) {
        sceneManagerRef.current.setTitleOrbitMode(false);
        sceneManagerRef.current.setCameraPreset(settings.cameraPreset);
        sceneManagerRef.current.setZoneGuideVisible(settings.showZoneGuide);
      }

      setGamePhase('PREPARING_PITCH');
      // Delay slightly for batter/catcher ready stance before throwing
      setTimeout(() => {
        throwNextPitch();
      }, 700);
    },
    [settings.cameraPreset, settings.showZoneGuide, throwNextPitch]
  );

  // Umpire makes the call: STRIKE or BALL
  const handleUmpireCall = useCallback(
    (call: 'STRIKE' | 'BALL') => {
      if (gamePhase !== 'AWAITING_CALL' || !currentResult) return;

      const reactionTimeMs = Math.round(performance.now() - catchTimestampRef.current);
      const isCorrect = call === currentResult.actualCall;

      // Play vocal and audio feedback
      if (call === 'STRIKE') {
        if (inningState.strikes === 2) {
          // Punchout!
          sounds.playUmpireCall('OUT');
          if (sceneManagerRef.current) {
            sceneManagerRef.current.triggerCameraShake(0.06);
          }
        } else {
          sounds.playUmpireCall('STRIKE');
        }
      } else {
        sounds.playUmpireCall('BALL');
      }

      if (isCorrect) {
        sounds.playCorrectChime();
        setStreak((s) => s + 1);
      } else {
        sounds.playMissBuzzer();
        setStreak(0);
      }

      const updatedResult: PitchResult = {
        ...currentResult,
        userCall: call,
        isCorrect,
        reactionTimeMs,
      };

      setCurrentResult(updatedResult);
      setPitchHistory((prev) => [...prev, updatedResult]);

      // Update Inning / Game status
      setInningState((prev) => {
        let newBalls = prev.balls;
        let newStrikes = prev.strikes;
        let newOuts = prev.outs;

        if (call === 'STRIKE') {
          if (newStrikes >= 2) {
            // Strikeout recorded!
            newStrikes = 0;
            newBalls = 0;
            newOuts += 1;
          } else {
            newStrikes += 1;
          }
        } else {
          if (newBalls >= 3) {
            // Walk / Four balls
            newBalls = 0;
            newStrikes = 0;
          } else {
            newBalls += 1;
          }
        }

        return {
          ...prev,
          balls: newBalls,
          strikes: newStrikes,
          outs: newOuts,
          totalPitches: prev.totalPitches + 1,
          correctCalls: prev.correctCalls + (isCorrect ? 1 : 0),
          totalCalls: prev.totalCalls + 1,
        };
      });

      // Show 3D replay trajectory and open Statcast breakdown
      if (sceneManagerRef.current) {
        sceneManagerRef.current.showReplay(updatedResult);
      }

      setGamePhase('CALL_RESULT');
    },
    [gamePhase, currentResult, inningState.strikes]
  );

  // Advance to next pitch or summary
  const handleNextFromReplay = useCallback(() => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.clearReplayGraphics();
      sceneManagerRef.current.setZoneGuideVisible(settings.showZoneGuide);
    }

    // Check game termination conditions
    if (gameMode === 'CHALLENGE_10' && pitchIndex >= 10) {
      setGamePhase('SUMMARY');
      return;
    }

    if (gameMode === 'INNING_GAME' && inningState.outs >= 3) {
      setGamePhase('SUMMARY');
      return;
    }

    setPitchIndex((i) => i + 1);
    setGamePhase('PREPARING_PITCH');

    setTimeout(() => {
      throwNextPitch();
    }, 600);
  }, [gameMode, pitchIndex, inningState.outs, settings.showZoneGuide, throwNextPitch]);

  // Return to title screen
  const handleBackToTitle = useCallback(() => {
    setGamePhase('TITLE');
    if (sceneManagerRef.current) {
      sceneManagerRef.current.clearReplayGraphics();
      sceneManagerRef.current.setTitleOrbitMode(true);
      sceneManagerRef.current.setZoneGuideVisible(false);
    }
  }, []);

  // Global Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;

      // When awaiting call: [S] or [ArrowRight] = STRIKE, [B] or [ArrowLeft] = BALL
      if (gamePhase === 'AWAITING_CALL') {
        if (e.key === 's' || e.key === 'S' || e.key === 'ArrowRight') {
          e.preventDefault();
          handleUmpireCall('STRIKE');
        } else if (e.key === 'b' || e.key === 'B' || e.key === 'ArrowLeft') {
          e.preventDefault();
          handleUmpireCall('BALL');
        }
      }

      // In Replay / Title / Summary: Space or Enter
      if (e.key === ' ' || e.key === 'Enter') {
        if (gamePhase === 'CALL_RESULT') {
          e.preventDefault();
          handleNextFromReplay();
        } else if (gamePhase === 'TITLE') {
          e.preventDefault();
          handleStartGame(gameMode);
        } else if (gamePhase === 'SUMMARY') {
          e.preventDefault();
          handleStartGame(gameMode);
        } else if (gamePhase === 'PREPARING_PITCH' && gameMode === 'TRAINING') {
          e.preventDefault();
          throwNextPitch();
        }
      }

      // Esc to return to title / pause
      if (e.key === 'Escape') {
        if (gamePhase !== 'TITLE') {
          handleBackToTitle();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    gamePhase,
    gameMode,
    handleUmpireCall,
    handleNextFromReplay,
    handleStartGame,
    handleBackToTitle,
    throwNextPitch,
  ]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 3D WebGL Canvas isolated container */}
      <div ref={mountRef} className="absolute inset-0 z-0" />

      {/* Title Screen Overlay */}
      {gamePhase === 'TITLE' && (
        <TitleScreen
          onStartGame={handleStartGame}
          selectedMode={gameMode}
          onSelectMode={setGameMode}
        />
      )}

      {/* Active In-Game HUD elements */}
      {gamePhase !== 'TITLE' && (
        <>
          {/* Top Scoreboard */}
          <ScoreboardHUD
            gameMode={gameMode}
            inningState={inningState}
            currentPitchIndex={pitchIndex}
            totalPitchesLimit={10}
            radarSpeed={radarSpeed}
            radarPitchName={radarPitchName}
            streak={streak}
          />

          {/* Catcher Pop / Call Action Bar */}
          {gamePhase === 'AWAITING_CALL' && (
            <CallActionBar
              onCall={handleUmpireCall}
              isTwoStrikes={inningState.strikes === 2}
            />
          )}

          {/* Statcast Zone 2D Inspection Overlay */}
          {gamePhase === 'CALL_RESULT' && currentResult && (
            <StatcastZone
              result={currentResult}
              onNext={handleNextFromReplay}
            />
          )}

          {/* Game Over / Certificate Summary Modal */}
          {gamePhase === 'SUMMARY' && (
            <SummaryModal
              gameMode={gameMode}
              results={pitchHistory}
              onRestart={() => handleStartGame(gameMode)}
              onHome={handleBackToTitle}
            />
          )}

          {/* Bottom Dock (Zero Viewport Occlusion per Three.js guidelines) */}
          <BottomControlDock
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            isPitchInProgress={gamePhase === 'BALL_IN_FLIGHT' || gamePhase === 'WINDUP'}
            onTriggerPitch={throwNextPitch}
            selectedPitchType={selectedPracticeType}
            onSelectPitchType={setSelectedPracticeType}
            isTrainingMode={gameMode === 'TRAINING'}
          />
        </>
      )}
    </div>
  );
}
