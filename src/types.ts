export type PitchType =
  | 'FOUR_SEAM'
  | 'TWO_SEAM'
  | 'SLIDER'
  | 'CURVE'
  | 'FORK'
  | 'CHANGEUP'
  | 'CUTTER';

export interface PitchDefinition {
  type: PitchType;
  nameJa: string;
  speedKmh: number; // 115 - 165
  spinRpm: number;
  breakHorizontalCm: number; // -30 to +30 cm (positive is arm side / right for RHP)
  breakVerticalCm: number; // gravity + Magnus drop (-40 to +10 cm)
  description: string;
}

export type BatterStance = 'RIGHT' | 'LEFT';

export interface StrikeZoneBounds {
  xMin: number; // in meters (-0.216m)
  xMax: number; // in meters (+0.216m)
  yMin: number; // knees (~0.48m)
  yMax: number; // chest/letters (~1.08m)
  zPlate: number; // front edge of home plate (0m)
  depth: number; // home plate depth (0.432m)
  ballRadius: number; // 0.0366m
}

export interface PitchResult {
  id: number;
  pitchType: PitchType;
  pitchName: string;
  speedKmh: number;
  crossingX: number; // in meters, relative to plate center
  crossingY: number; // in meters, height from ground
  actualCall: 'STRIKE' | 'BALL';
  userCall: 'STRIKE' | 'BALL' | null;
  isCorrect: boolean;
  distanceToBorderCm: number; // distance from closest zone boundary in cm (positive if inside, negative if outside)
  isBorderline: boolean; // within 3.5cm of the edge (very tough call!)
  reactionTimeMs: number;
  batterStance: BatterStance;
  zoneQuadrant: number; // 1-9 for inside, or 10-18 for outer shadows
  trajectory: Array<{ x: number; y: number; z: number }>;
}

export type GameMode = 'CHALLENGE_10' | 'INNING_GAME' | 'TRAINING';

export type GamePhase =
  | 'TITLE'
  | 'PREPARING_PITCH'
  | 'WINDUP'
  | 'BALL_IN_FLIGHT'
  | 'AWAITING_CALL'
  | 'CALL_RESULT'
  | 'SUMMARY'
  | 'PAUSED';

export type CameraPreset = 'SLOT' | 'CATCHER' | 'WIDE' | 'SIDE';

export interface GameSettings {
  showZoneGuide: boolean;
  soundVolume: number;
  isMuted: boolean;
  batterStance: BatterStance;
  cameraPreset: CameraPreset;
  pitcherVelocityBonus: number; // -10 to +10 km/h
}

export interface InningState {
  inning: number; // 1 to 9
  isTop: boolean; // 表 or 裏
  balls: number; // 0 - 3
  strikes: number; // 0 - 2
  outs: number; // 0 - 2
  totalPitches: number;
  correctCalls: number;
  totalCalls: number;
}
