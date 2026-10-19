import React, { useEffect } from 'react';
import { PitchResult, GameMode } from '../types';
import confetti from 'canvas-confetti';
import { Award, RotateCcw, Home } from 'lucide-react';
import { REGULATION_ZONE } from '../game/physics';

interface SummaryModalProps {
  gameMode: GameMode;
  results: PitchResult[];
  onRestart: () => void;
  onHome: () => void;
}

export const SummaryModal: React.FC<SummaryModalProps> = ({
  gameMode,
  results,
  onRestart,
  onHome,
}) => {
  const totalCalls = results.length;
  const correctCalls = results.filter((r) => r.isCorrect).length;
  const accuracyPct = totalCalls > 0 ? Math.round((correctCalls / totalCalls) * 100) : 0;

  // Average reaction time
  const avgReactionTime =
    totalCalls > 0
      ? Math.round(results.reduce((sum, r) => sum + r.reactionTimeMs, 0) / totalCalls)
      : 0;

  // Grade calculation
  let grade = 'B';
  let title = '審判講習生';
  let gradeColor = 'text-sky-400';

  if (accuracyPct >= 95) {
    grade = 'SSS';
    title = '神の眼力 · 伝説のプロ球審';
    gradeColor = 'text-amber-400';
  } else if (accuracyPct >= 90) {
    grade = 'SS';
    title = '一軍チーフアンパイア';
    gradeColor = 'text-amber-300';
  } else if (accuracyPct >= 80) {
    grade = 'S';
    title = '一軍レギュラー球審';
    gradeColor = 'text-emerald-400';
  } else if (accuracyPct >= 70) {
    grade = 'A';
    title = '二軍優秀審判員';
    gradeColor = 'text-blue-400';
  } else if (accuracyPct >= 60) {
    grade = 'B';
    title = '審判講習修了生';
    gradeColor = 'text-slate-300';
  } else if (accuracyPct >= 50) {
    grade = 'C';
    title = '誤審注意報発令中';
    gradeColor = 'text-rose-400';
  } else {
    grade = 'D';
    title = '抗議殺到の猛省審判';
    gradeColor = 'text-rose-500';
  }

  // Trigger celebratory confetti on high accuracy
  useEffect(() => {
    if (accuracyPct >= 80) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [accuracyPct]);

  // SVG dimensions for pitch plot
  const svgW = 200;
  const svgH = 220;
  const viewXMin = -0.4;
  const viewXMax = 0.4;
  const viewYMin = 0.3;
  const viewYMax = 1.3;

  const toSvgX = (x: number) => ((x - viewXMin) / (viewXMax - viewXMin)) * svgW;
  const toSvgY = (y: number) => (1 - (y - viewYMin) / (viewYMax - viewYMin)) * svgH;

  const zoneLeft = toSvgX(REGULATION_ZONE.xMin);
  const zoneRight = toSvgX(REGULATION_ZONE.xMax);
  const zoneTop = toSvgY(REGULATION_ZONE.yMax);
  const zoneBottom = toSvgY(REGULATION_ZONE.yMin);

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 pointer-events-auto bg-black/75">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl text-white">
        {/* Certificate Header */}
        <div className="text-center pb-4 border-b border-slate-800 space-y-1">
          <div className="text-xs font-bold text-amber-400 tracking-widest uppercase flex items-center justify-center gap-1.5">
            <Award size={16} /> 審判員適性審査 判定報告書
          </div>
          <h2 className="text-2xl font-black tracking-tight">GAME RESULT</h2>
        </div>

        {/* Grade Spotlight */}
        <div className="my-5 p-4 rounded-xl bg-gradient-to-b from-slate-800/80 to-slate-900 border border-slate-700/60 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">球審能力ランク</div>
            <div className="text-lg font-black text-white">{title}</div>
            <div className="text-xs text-slate-400 mt-1 font-mono">
              平均判定反応速度: <strong className="text-white">{avgReactionTime} ms</strong>
            </div>
          </div>
          <div className={`text-5xl font-black font-mono tracking-tighter ${gradeColor}`}>
            {grade}
          </div>
        </div>

        {/* Metrics Grid + Visual Strike Zone Plot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center mb-6">
          {/* Numbers */}
          <div className="space-y-3">
            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/40">
              <div className="text-xs text-slate-400">判定精度 (Accuracy)</div>
              <div className="text-3xl font-black font-mono text-emerald-400">
                {accuracyPct}%
              </div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                正解数: <strong className="text-white">{correctCalls}</strong> / {totalCalls}
              </div>
            </div>

            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/40 text-xs space-y-1 text-slate-300">
              <div className="flex justify-between">
                <span>きわどい球 (Borderline):</span>
                <span className="font-mono font-bold text-white">
                  {results.filter((r) => r.isBorderline).length} 球
                </span>
              </div>
              <div className="flex justify-between">
                <span>最高球速:</span>
                <span className="font-mono font-bold text-amber-400">
                  {results.length > 0 ? Math.max(...results.map((r) => r.speedKmh)) : 0} km/h
                </span>
              </div>
            </div>
          </div>

          {/* 2D Zone Pitch Chart */}
          <div className="flex flex-col items-center">
            <div className="text-[11px] text-slate-400 mb-1 font-semibold">
              全投球コース分布チャート
            </div>
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
              <svg width={svgW} height={svgH} className="overflow-visible">
                {/* Strike zone rectangle */}
                <rect
                  x={zoneLeft}
                  y={zoneTop}
                  width={zoneRight - zoneLeft}
                  height={zoneBottom - zoneTop}
                  fill="rgba(56, 189, 248, 0.05)"
                  stroke="#38bdf8"
                  strokeWidth="2"
                />
                {/* 3x3 inner lines */}
                <line
                  x1={zoneLeft + (zoneRight - zoneLeft) / 3}
                  y1={zoneTop}
                  x2={zoneLeft + (zoneRight - zoneLeft) / 3}
                  y2={zoneBottom}
                  stroke="#0284c7"
                  strokeWidth="0.8"
                  strokeOpacity="0.4"
                />
                <line
                  x1={zoneLeft + ((zoneRight - zoneLeft) * 2) / 3}
                  y1={zoneTop}
                  x2={zoneLeft + ((zoneRight - zoneLeft) * 2) / 3}
                  y2={zoneBottom}
                  stroke="#0284c7"
                  strokeWidth="0.8"
                  strokeOpacity="0.4"
                />
                <line
                  x1={zoneLeft}
                  y1={zoneTop + (zoneBottom - zoneTop) / 3}
                  x2={zoneRight}
                  y2={zoneTop + (zoneBottom - zoneTop) / 3}
                  stroke="#0284c7"
                  strokeWidth="0.8"
                  strokeOpacity="0.4"
                />
                <line
                  x1={zoneLeft}
                  y1={zoneTop + ((zoneBottom - zoneTop) * 2) / 3}
                  x2={zoneRight}
                  y2={zoneTop + ((zoneBottom - zoneTop) * 2) / 3}
                  stroke="#0284c7"
                  strokeWidth="0.8"
                  strokeOpacity="0.4"
                />

                {/* Plot each pitch */}
                {results.map((r, i) => {
                  const px = toSvgX(r.crossingX);
                  const py = toSvgY(r.crossingY);
                  return (
                    <circle
                      key={i}
                      cx={px}
                      cy={py}
                      r="4"
                      fill={r.isCorrect ? '#34d399' : '#f43f5e'}
                      stroke="#ffffff"
                      strokeWidth="1"
                    />
                  );
                })}
              </svg>
            </div>
            <div className="flex gap-3 text-[10px] text-slate-400 mt-1">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> 正解判定
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> 誤審
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onRestart}
            className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw size={18} /> もう一度挑戦 [Space]
          </button>
          <button
            onClick={onHome}
            className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home size={18} /> タイトルへ
          </button>
        </div>
      </div>
    </div>
  );
};
