import { PitchDefinition, PitchResult, PitchType, StrikeZoneBounds, BatterStance } from '../types';

export const REGULATION_ZONE: StrikeZoneBounds = {
  xMin: -0.216, // 17 inches = 0.432m wide, centered at 0
  xMax: 0.216,
  yMin: 0.48, // hollow of knee (~48 cm from ground)
  yMax: 1.08, // midpoint between top of pants and shoulders (~108 cm)
  zPlate: 0.0, // front tip/edge of home plate
  depth: 0.432,
  ballRadius: 0.0366, // 7.32 cm diameter regulation baseball
};

// Effective strike boundaries (if ball edge touches anywhere inside)
export const EFFECTIVE_ZONE = {
  xMin: REGULATION_ZONE.xMin - REGULATION_ZONE.ballRadius, // ~ -0.2526m
  xMax: REGULATION_ZONE.xMax + REGULATION_ZONE.ballRadius, // ~ +0.2526m
  yMin: REGULATION_ZONE.yMin - REGULATION_ZONE.ballRadius, // ~ +0.4434m
  yMax: REGULATION_ZONE.yMax + REGULATION_ZONE.ballRadius, // ~ +1.1166m
};

export const PITCH_PRESETS: Record<PitchType, Omit<PitchDefinition, 'speedKmh' | 'breakHorizontalCm' | 'breakVerticalCm'>> = {
  FOUR_SEAM: {
    type: 'FOUR_SEAM',
    nameJa: 'ストレート (4シーム)',
    spinRpm: 2400,
    description: 'キレのある快速球。バックスピンで浮き上がるような軌道。',
  },
  TWO_SEAM: {
    type: 'TWO_SEAM',
    nameJa: 'ツーシーム / シンカー',
    spinRpm: 2150,
    description: '右打者の懐へ鋭く沈みながら食い込む高速変化球。',
  },
  SLIDER: {
    type: 'SLIDER',
    nameJa: 'スライダー',
    spinRpm: 2550,
    description: '外角へ鋭く滑り曲がる魔球。コース見極めの難所。',
  },
  CURVE: {
    type: 'CURVE',
    nameJa: 'ドロップカーブ',
    spinRpm: 2700,
    description: '山なりの軌道からホーム手前で急激に垂直落下する緩急球。',
  },
  FORK: {
    type: 'FORK',
    nameJa: 'フォークボール',
    spinRpm: 900,
    description: '無回転で直球の軌道からベース直前でストンと視界から消える落差。',
  },
  CHANGEUP: {
    type: 'CHANGEUP',
    nameJa: 'チェンジアップ',
    spinRpm: 1750,
    description: 'ストレートの腕の振りから抜けるような遅球とシンカー軌道。',
  },
  CUTTER: {
    type: 'CUTTER',
    nameJa: 'カットボール',
    spinRpm: 2380,
    description: 'ストレートと見紛う球速からベース直前で小さく鋭く曲がる。',
  },
};

/**
 * Determines whether a ball at (crossingX, crossingY) is a rulebook strike.
 */
export function evaluatePitchCall(crossingX: number, crossingY: number): {
  isStrike: boolean;
  distanceToBorderCm: number;
  isBorderline: boolean;
  quadrant: number;
} {
  // Check against effective boundary (ball center relative to zone bounds + radius)
  const isInsideX = crossingX >= EFFECTIVE_ZONE.xMin && crossingX <= EFFECTIVE_ZONE.xMax;
  const isInsideY = crossingY >= EFFECTIVE_ZONE.yMin && crossingY <= EFFECTIVE_ZONE.yMax;
  const isStrike = isInsideX && isInsideY;

  // Calculate distance to closest border
  const distLeft = crossingX - EFFECTIVE_ZONE.xMin;
  const distRight = EFFECTIVE_ZONE.xMax - crossingX;
  const distBottom = crossingY - EFFECTIVE_ZONE.yMin;
  const distTop = EFFECTIVE_ZONE.yMax - crossingY;

  let minBorderDistM: number;
  if (isStrike) {
    // Inside: distance to closest edge (positive)
    minBorderDistM = Math.min(distLeft, distRight, distBottom, distTop);
  } else {
    // Outside: distance from closest edge (negative)
    let dx = 0;
    if (crossingX < EFFECTIVE_ZONE.xMin) dx = EFFECTIVE_ZONE.xMin - crossingX;
    else if (crossingX > EFFECTIVE_ZONE.xMax) dx = crossingX - EFFECTIVE_ZONE.xMax;

    let dy = 0;
    if (crossingY < EFFECTIVE_ZONE.yMin) dy = EFFECTIVE_ZONE.yMin - crossingY;
    else if (crossingY > EFFECTIVE_ZONE.yMax) dy = crossingY - EFFECTIVE_ZONE.yMax;

    minBorderDistM = -Math.hypot(dx, dy);
  }

  const distanceToBorderCm = Math.round(minBorderDistM * 1000) / 10;
  // Borderline pitch: within 4 cm inside or outside the edge
  const isBorderline = Math.abs(distanceToBorderCm) <= 4.0;

  // Determine Statcast 9-zone quadrant (1 to 9 if inside, or shadow 10-18)
  const xRatio = (crossingX - REGULATION_ZONE.xMin) / (REGULATION_ZONE.xMax - REGULATION_ZONE.xMin);
  const yRatio = (crossingY - REGULATION_ZONE.yMin) / (REGULATION_ZONE.yMax - REGULATION_ZONE.yMin);

  let col = Math.floor(xRatio * 3);
  let row = Math.floor((1 - yRatio) * 3); // row 0 is top
  col = Math.max(0, Math.min(2, col));
  row = Math.max(0, Math.min(2, row));

  let quadrant = row * 3 + col + 1; // 1 to 9
  if (!isStrike) {
    quadrant += 10; // Outer / chase zone
  }

  return {
    isStrike,
    distanceToBorderCm,
    isBorderline,
    quadrant,
  };
}

/**
 * Generate a realistic pitch scenario designed to test the umpire!
 */
export function generatePitch(
  pitchId: number,
  forcedType?: PitchType,
  velocityBonus: number = 0,
  batterStance: BatterStance = 'RIGHT'
): {
  definition: PitchDefinition;
  result: PitchResult;
  trajectoryPoints: Array<{ x: number; y: number; z: number }>;
} {
  const pitchTypes: PitchType[] = [
    'FOUR_SEAM',
    'SLIDER',
    'FORK',
    'TWO_SEAM',
    'CURVE',
    'CUTTER',
    'CHANGEUP',
  ];

  const type = forcedType || pitchTypes[Math.floor(Math.random() * pitchTypes.length)];
  const preset = PITCH_PRESETS[type];

  let speedKmh = 148;
  let breakHorizontalCm = 0;
  let breakVerticalCm = -10;

  switch (type) {
    case 'FOUR_SEAM':
      speedKmh = 145 + Math.random() * 16 + velocityBonus; // 145 - 161 km/h
      breakHorizontalCm = (Math.random() - 0.5) * 8; // slight run
      breakVerticalCm = -12 + (Math.random() - 0.5) * 4; // slight gravity drop, looks "rising"
      break;
    case 'TWO_SEAM':
      speedKmh = 140 + Math.random() * 12 + velocityBonus;
      breakHorizontalCm = 15 + Math.random() * 12; // run arm-side (right)
      breakVerticalCm = -20 - Math.random() * 8;
      break;
    case 'SLIDER':
      speedKmh = 132 + Math.random() * 12 + velocityBonus;
      breakHorizontalCm = -(16 + Math.random() * 14); // sharp glove-side break (left)
      breakVerticalCm = -18 - Math.random() * 10;
      break;
    case 'CURVE':
      speedKmh = 114 + Math.random() * 14 + velocityBonus;
      breakHorizontalCm = -(10 + Math.random() * 10);
      breakVerticalCm = -(36 + Math.random() * 14); // massive 12-6 drop
      break;
    case 'FORK':
      speedKmh = 130 + Math.random() * 12 + velocityBonus;
      breakHorizontalCm = (Math.random() - 0.5) * 6;
      breakVerticalCm = -(30 + Math.random() * 14); // late cliff drop
      break;
    case 'CHANGEUP':
      speedKmh = 124 + Math.random() * 10 + velocityBonus;
      breakHorizontalCm = 12 + Math.random() * 10;
      breakVerticalCm = -22 - Math.random() * 8;
      break;
    case 'CUTTER':
      speedKmh = 142 + Math.random() * 10 + velocityBonus;
      breakHorizontalCm = -(8 + Math.random() * 10);
      breakVerticalCm = -14 - Math.random() * 6;
      break;
  }

  // To make it an exciting umpire game, we weight toward borderline pitches (40% borderline strike, 40% borderline ball, 20% clear)
  const roll = Math.random();
  let targetX = 0;
  let targetY = 0.78; // zone center

  if (roll < 0.35) {
    // Borderline STRIKE (just inside edge)
    const side = Math.floor(Math.random() * 4);
    const margin = (0.5 + Math.random() * 2.5) / 100; // 0.5 to 3.0 cm inside
    if (side === 0) {
      // Left border (inside)
      targetX = EFFECTIVE_ZONE.xMin + margin;
      targetY = REGULATION_ZONE.yMin + Math.random() * (REGULATION_ZONE.yMax - REGULATION_ZONE.yMin);
    } else if (side === 1) {
      // Right border (inside)
      targetX = EFFECTIVE_ZONE.xMax - margin;
      targetY = REGULATION_ZONE.yMin + Math.random() * (REGULATION_ZONE.yMax - REGULATION_ZONE.yMin);
    } else if (side === 2) {
      // Low border (knees)
      targetX = REGULATION_ZONE.xMin + Math.random() * (REGULATION_ZONE.xMax - REGULATION_ZONE.xMin);
      targetY = EFFECTIVE_ZONE.yMin + margin;
    } else {
      // High border (letters)
      targetX = REGULATION_ZONE.xMin + Math.random() * (REGULATION_ZONE.xMax - REGULATION_ZONE.xMin);
      targetY = EFFECTIVE_ZONE.yMax - margin;
    }
  } else if (roll < 0.75) {
    // Borderline BALL (just outside edge)
    const side = Math.floor(Math.random() * 4);
    const margin = (0.8 + Math.random() * 3.2) / 100; // 0.8 to 4.0 cm outside
    if (side === 0) {
      // Left border (outside)
      targetX = EFFECTIVE_ZONE.xMin - margin;
      targetY = REGULATION_ZONE.yMin + Math.random() * (REGULATION_ZONE.yMax - REGULATION_ZONE.yMin);
    } else if (side === 1) {
      // Right border (outside)
      targetX = EFFECTIVE_ZONE.xMax + margin;
      targetY = REGULATION_ZONE.yMin + Math.random() * (REGULATION_ZONE.yMax - REGULATION_ZONE.yMin);
    } else if (side === 2) {
      // Low border (just below knees)
      targetX = REGULATION_ZONE.xMin + Math.random() * (REGULATION_ZONE.xMax - REGULATION_ZONE.xMin);
      targetY = EFFECTIVE_ZONE.yMin - margin;
    } else {
      // High border (just above letters)
      targetX = REGULATION_ZONE.xMin + Math.random() * (REGULATION_ZONE.xMax - REGULATION_ZONE.xMin);
      targetY = EFFECTIVE_ZONE.yMax + margin;
    }
  } else if (roll < 0.90) {
    // Solid Strike (middle or corner clear)
    targetX = REGULATION_ZONE.xMin * 0.7 + Math.random() * REGULATION_ZONE.xMax * 1.4;
    targetY = REGULATION_ZONE.yMin + 0.15 + Math.random() * 0.35;
  } else {
    // Clear Ball (further out or wild)
    const angle = Math.random() * Math.PI * 2;
    const dist = 0.35 + Math.random() * 0.18;
    targetX = Math.cos(angle) * dist;
    targetY = 0.78 + Math.sin(angle) * dist;
  }

  const crossingX = targetX;
  const crossingY = Math.max(0.18, targetY);

  const evaluation = evaluatePitchCall(crossingX, crossingY);

  const definition: PitchDefinition = {
    ...preset,
    speedKmh: Math.round(speedKmh * 10) / 10,
    breakHorizontalCm: Math.round(breakHorizontalCm * 10) / 10,
    breakVerticalCm: Math.round(breakVerticalCm * 10) / 10,
  };

  // Trajectory calculation from Pitcher release (z = 16.5m) to Home Plate (z = 0m) and Catcher (z = -0.65m)
  const trajectoryPoints: Array<{ x: number; y: number; z: number }> = [];
  const startZ = 16.5; // pitcher release point
  const startX = 0.42; // right-handed pitcher 3/4 release slot
  const startY = 1.95; // release height

  const endZ = -0.48; // catcher's mitt location right behind home plate
  const steps = 60;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps; // 0 to 1
    const z = startZ * (1 - t) + endZ * t;

    // Calculate progression fraction up to home plate (z = 0)
    const toPlateRatio = (startZ - z) / startZ; // 0 at release, 1 at plate

    // Physics curve:
    // Break occurs progressively, intensifying as the ball decelerates toward the plate (Magnus effect is non-linear)
    const breakProgress = Math.pow(toPlateRatio, 1.8);

    // Crossing point at z = 0 is exactly (crossingX, crossingY)
    // Ball position X:
    const baseX = startX * (1 - toPlateRatio) + crossingX * toPlateRatio;
    const curvedX = baseX + (breakHorizontalCm / 100) * (breakProgress - toPlateRatio);

    // Ball position Y:
    // Gravity arc + spin lift
    const arcHeight = (type === 'CURVE' ? 0.35 : 0.08) * Math.sin(toPlateRatio * Math.PI);
    const baseY = startY * (1 - toPlateRatio) + crossingY * toPlateRatio;
    const dropOffset = (breakVerticalCm / 100) * (breakProgress - toPlateRatio);
    const curvedY = baseY + arcHeight + dropOffset;

    trajectoryPoints.push({
      x: curvedX,
      y: curvedY,
      z,
    });
  }

  const result: PitchResult = {
    id: pitchId,
    pitchType: type,
    pitchName: definition.nameJa,
    speedKmh: definition.speedKmh,
    crossingX,
    crossingY,
    actualCall: evaluation.isStrike ? 'STRIKE' : 'BALL',
    userCall: null,
    isCorrect: false,
    distanceToBorderCm: evaluation.distanceToBorderCm,
    isBorderline: evaluation.isBorderline,
    reactionTimeMs: 0,
    batterStance,
    zoneQuadrant: evaluation.quadrant,
    trajectory: trajectoryPoints,
  };

  return {
    definition,
    result,
    trajectoryPoints,
  };
}
