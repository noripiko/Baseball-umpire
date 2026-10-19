import React from 'react';
import { PitchResult } from '../types';
import { EFFECTIVE_ZONE, REGULATION_ZONE } from '../game/physics';

interface StatcastZoneProps {
  result: PitchResult;
  onNext: () => void;
}

export const StatcastZone: React.FC<StatcastZoneProps> = ({ result, onNext }) => {
  // SVG Strike zone viewport calculation
  const svgW = 260;
  const svgH = 300;

  // View bounds in meters around zone
  const viewXMin = -0.45;
  const viewXMax = 0.45;
  const viewYMin = 0.25;
  const viewYMax = 1.35;

  const toSvgX = (x: number) => {
    return ((x - viewXMin) / (viewXMax - viewXMin)) * svgW;
  };

  const toSvgY = (y: number) => {
    // Invert Y so higher is up
    return (1 - (y - viewYMin) / (viewYMax - viewYMin)) * svgH;
  };

  // Regulation zone box in SVG
  const zoneLeft = toSvgX(REGULATION_ZONE.xMin);
  const zoneRight = toSvgX(REGULATION_ZONE.xMax);
  const zoneTop = toSvgY(REGULATION_ZONE.yMax);
  const zoneBottom = toSvgY(REGULATION_ZONE.yMin);
  const zoneW = zoneRight - zoneLeft;
  const zoneH = zoneBottom - zoneTop;

  // Ball crossing SVG position
  const ballX = toSvgX(result.crossingX);
  const ballY = toSvgY(result.crossingY);
  const ballRadiusPx = ((REGULATION_ZONE.ballRadius) / (viewXMax - viewXMin)) * svgW;

  const isStrike = result.actualCall === 'STRIKE';
  const isCorrect = result.isCorrect;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 pointer-events-auto bg-black/60">
      <div className="relative w-full max-w-xl bg-slate-900/95 border border-slate-700/80 rounded-2xl p-6 shadow-2xl text-white">
        {/* Header Verdict Banner */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-md text-xs font-bold tracking-wider uppercase ${
                isCorrect ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
              }`}
            >
              {isCorrect ? '✓ 正解 (EXCELLENT CALL)' : '✕ 誤審 (MISSED CALL)'}
            </span>
            {result.isBorderline && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                ギリギリの際どいコース!
              </span>
            )}
          </div>
          <span className="text-xs text-slate-400 font-mono">
            反応速度: <strong className="text-white">{result.reactionTimeMs}ms</strong>
          </span>
        </div>

        {/* Main Content: 2D Zone + Pitch Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-5 items-center">
          {/* Statcast 2D Strike Zone */}
          <div className="flex flex-col items-center">
            <div className="relative bg-slate-950/80 rounded-xl p-3 border border-slate-800 shadow-inner">
              <svg width={svgW} height={svgH} className="overflow-visible">
                {/* Home Plate base representation at bottom */}
                <polygon
                  points={`${toSvgX(-0.216)},${toSvgY(0.32)} ${toSvgX(0.216)},${toSvgY(0.32)} ${toSvgX(0.216)},${toSvgY(0.26)} ${toSvgX(0)},${toSvgY(0.2)} ${toSvgX(-0.216)},${toSvgY(0.26)}`}
                  fill="#475569"
                  stroke="#64748b"
                  strokeWidth="1.5"
                />

                {/* Outer effective strike margin halo */}
                <rect
                  x={toSvgX(EFFECTIVE_ZONE.xMin)}
                  y={toSvgY(EFFECTIVE_ZONE.yMax)}
                  width={toSvgX(EFFECTIVE_ZONE.xMax) - toSvgX(EFFECTIVE_ZONE.xMin)}
                  height={toSvgY(EFFECTIVE_ZONE.yMin) - toSvgY(EFFECTIVE_ZONE.yMax)}
                  fill="none"
                  stroke="#334155"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />

                {/* Regulation Strike Zone Rect */}
                <rect
                  x={zoneLeft}
                  y={zoneTop}
                  width={zoneW}
                  height={zoneH}
                  fill={isStrike ? 'rgba(239, 68, 68, 0.08)' : 'rgba(59, 130, 246, 0.08)'}
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  rx="3"
                />

                {/* 3x3 Grid Inner Dividers */}
                {/* Vertical lines */}
                <line
                  x1={zoneLeft + zoneW / 3}
                  y1={zoneTop}
                  x2={zoneLeft + zoneW / 3}
                  y2={zoneBottom}
                  stroke="#0284c7"
                  strokeWidth="1"
                  strokeOpacity="0.45"
                />
                <line
                  x1={zoneLeft + (zoneW * 2) / 3}
                  y1={zoneTop}
                  x2={zoneLeft + (zoneW * 2) / 3}
                  y2={zoneBottom}
                  stroke="#0284c7"
                  strokeWidth="1"
                  strokeOpacity="0.45"
                />
                {/* Horizontal lines */}
                <line
                  x1={zoneLeft}
                  y1={zoneTop + zoneH / 3}
                  x2={zoneRight}
                  y2={zoneTop + zoneH / 3}
                  stroke="#0284c7"
                  strokeWidth="1"
                  strokeOpacity="0.45"
                />
                <line
                  x1={zoneLeft}
                  y1={zoneTop + (zoneH * 2) / 3}
                  x2={zoneRight}
                  y2={zoneTop + (zoneH * 2) / 3}
                  stroke="#0284c7"
                  strokeWidth="1"
                  strokeOpacity="0.45"
                />

                {/* Ball Crossing Position Marker */}
                <circle
                  cx={ballX}
                  cy={ballY}
                  r={ballRadiusPx}
                  fill={isStrike ? '#ef4444' : '#3b82f6'}
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  className="filter drop-shadow-md"
                />
                {/* Center dot inside ball */}
                <circle cx={ballX} cy={ballY} r={2.5} fill="#ffffff" />
              </svg>
            </div>
            <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> ストライクゾーン
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> ボールゾーン
              </span>
            </div>
          </div>

          {/* Pitch Metrics Breakdown */}
          <div className="space-y-3.5 text-sm">
            <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">球種 / 球速</span>
                <span className="font-bold text-white text-base">
                  {result.pitchName} · <span className="text-amber-400">{result.speedKmh} km/h</span>
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">正式ルール判定</span>
                <span className={`font-bold px-2 py-0.5 rounded ${isStrike ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                  {result.actualCall}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">あなたの判定</span>
                <span className={`font-bold px-2 py-0.5 rounded ${result.userCall === 'STRIKE' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                  {result.userCall || '無判定'}
                </span>
              </div>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">ゾーン境界からの距離</span>
                <span className={`font-mono font-semibold ${result.distanceToBorderCm >= 0 ? 'text-emerald-400' : 'text-blue-400'}`}>
                  {result.distanceToBorderCm >= 0 ? `内側 +${result.distanceToBorderCm} cm` : `外側 ${result.distanceToBorderCm} cm`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">通過座標</span>
                <span className="font-mono text-slate-300">
                  X: {result.crossingX > 0 ? `+${(result.crossingX * 100).toFixed(1)}` : (result.crossingX * 100).toFixed(1)}cm / 高: {(result.crossingY * 100).toFixed(1)}cm
                </span>
              </div>
            </div>

            <button
              onClick={onNext}
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              次の投球へ [Space / Enter]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
