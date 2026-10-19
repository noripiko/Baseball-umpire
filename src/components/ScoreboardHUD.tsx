import React from 'react';
import { GameMode, InningState } from '../types';

interface ScoreboardHUDProps {
  gameMode: GameMode;
  inningState: InningState;
  currentPitchIndex: number;
  totalPitchesLimit?: number;
  radarSpeed?: number | null;
  radarPitchName?: string | null;
  streak: number;
}

export const ScoreboardHUD: React.FC<ScoreboardHUDProps> = ({
  gameMode,
  inningState,
  currentPitchIndex,
  totalPitchesLimit = 10,
  radarSpeed,
  radarPitchName,
  streak,
}) => {
  const accuracyPct =
    inningState.totalCalls > 0
      ? Math.round((inningState.correctCalls / inningState.totalCalls) * 100)
      : 100;

  return (
    <div className="absolute top-4 inset-x-0 pointer-events-none z-20 flex justify-between items-start px-5 max-w-7xl mx-auto">
      {/* Left: Ballpark Scoreboard Cluster (BSO + Inning) */}
      <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-3 shadow-xl flex items-center gap-5 text-white">
        {/* Inning / Mode tag */}
        <div className="text-center pr-3 border-r border-slate-800">
          <div className="text-[10px] tracking-wider text-slate-400 font-bold uppercase">
            {gameMode === 'CHALLENGE_10'
              ? '検定チャレンジ'
              : gameMode === 'INNING_GAME'
              ? '公式戦イニング'
              : '投球特訓ラボ'}
          </div>
          <div className="text-lg font-black text-amber-400 font-mono">
            {gameMode === 'CHALLENGE_10'
              ? `${Math.min(currentPitchIndex, totalPitchesLimit)} / ${totalPitchesLimit} 球`
              : `${inningState.inning}回${inningState.isTop ? '表' : '裏'}`}
          </div>
        </div>

        {/* BSO Count Cluster */}
        <div className="space-y-1 font-mono font-bold text-xs select-none">
          {/* Balls (Green) */}
          <div className="flex items-center gap-2">
            <span className="w-3 text-emerald-400">B</span>
            <div className="flex gap-1.5">
              {[0, 1, 2].map((idx) => (
                <div
                  key={idx}
                  className={`w-3 h-3 rounded-full border border-emerald-950 transition-colors ${
                    idx < inningState.balls ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Strikes (Yellow) */}
          <div className="flex items-center gap-2">
            <span className="w-3 text-amber-400">S</span>
            <div className="flex gap-1.5">
              {[0, 1].map((idx) => (
                <div
                  key={idx}
                  className={`w-3 h-3 rounded-full border border-amber-950 transition-colors ${
                    idx < inningState.strikes ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Outs (Red) */}
          <div className="flex items-center gap-2">
            <span className="w-3 text-rose-500">O</span>
            <div className="flex gap-1.5">
              {[0, 1].map((idx) => (
                <div
                  key={idx}
                  className={`w-3 h-3 rounded-full border border-rose-950 transition-colors ${
                    idx < inningState.outs ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]' : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Center Radar Speed Gun (When pitch thrown) */}
      {radarSpeed && (
        <div className="animate-in fade-in zoom-in-95 duration-200 bg-slate-950/90 border border-amber-500/40 rounded-xl px-5 py-2 shadow-2xl text-center text-white">
          <div className="text-[10px] text-amber-400 font-bold tracking-widest uppercase">
            {radarPitchName || 'SPEED GUN'}
          </div>
          <div className="text-3xl font-black font-mono tracking-tight text-white">
            {radarSpeed} <span className="text-sm font-sans font-bold text-slate-400">km/h</span>
          </div>
        </div>
      )}

      {/* Right: Umpire Accuracy Rating */}
      <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-3 shadow-xl text-right text-white">
        <div className="text-[10px] tracking-wider text-slate-400 font-bold uppercase">
          球審判定精度
        </div>
        <div className="flex items-baseline justify-end gap-1.5">
          <span className="text-2xl font-black font-mono tabular-nums text-emerald-400">
            {accuracyPct}
          </span>
          <span className="text-xs text-slate-400 font-bold">%</span>
        </div>
        <div className="text-[11px] text-slate-400 font-mono tabular-nums">
          正解: <strong className="text-white">{inningState.correctCalls}</strong> / {inningState.totalCalls}
          {streak >= 3 && (
            <span className="ml-2 text-amber-400 font-bold">🔥 {streak}連続正解!</span>
          )}
        </div>
      </div>
    </div>
  );
};
