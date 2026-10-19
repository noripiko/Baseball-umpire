import React from 'react';
import { GameMode } from '../types';
import { Play, Award, Flame, Crosshair } from 'lucide-react';

interface TitleScreenProps {
  onStartGame: (mode: GameMode) => void;
  selectedMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  selectedMode,
  onSelectMode,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-between p-6 md:p-12 pointer-events-auto bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent text-white select-none">
      {/* Top Header Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full text-amber-300 text-xs font-bold tracking-widest uppercase">
          <Award size={14} />
          NPB / MLB Official Zone Simulator
        </div>
        <div className="text-xs text-slate-400 font-mono">
          3D REAL-PHYSICS UMPIRE
        </div>
      </div>

      {/* Center Hero Lockup with bespoke inline SVG Title */}
      <div className="max-w-2xl my-auto space-y-4">
        {/* Bespoke SVG Title Lockup */}
        <div className="relative">
          <svg viewBox="0 0 540 110" className="w-full max-w-lg h-auto overflow-visible">
            <defs>
              <linearGradient id="titleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="#f8fafc" />
                <stop offset="100%" stopColor="#94a3b8" />
              </linearGradient>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
              <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#000" floodOpacity="0.8" />
              </filter>
            </defs>

            {/* Subtitle */}
            <text
              x="4"
              y="22"
              fill="url(#goldGrad)"
              fontSize="14"
              fontWeight="900"
              letterSpacing="6"
              className="uppercase"
            >
              PRO BASEBALL STRIKE ZONE
            </text>

            {/* Main Title Lockup */}
            <text
              x="0"
              y="85"
              fill="url(#titleGrad)"
              fontSize="68"
              fontWeight="950"
              letterSpacing="-2"
              filter="url(#shadow)"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              THE UMPIRE
            </text>

            {/* Accent Japanese Badge */}
            <rect x="420" y="44" width="95" height="36" rx="6" fill="#e11d48" filter="url(#shadow)" />
            <text x="467" y="68" fill="#ffffff" fontSize="16" fontWeight="900" textAnchor="middle">
              球審道
            </text>
          </svg>
        </div>

        <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-xl">
          キャッチャーの背後から迫り来る160km/hの豪速球とキレ味鋭い変化球！
          ストライクゾーンの境界を見極め、威厳を持って正確にコールせよ。
        </p>

        {/* Game Mode Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Mode 1: 10-pitch certification */}
          <div
            onClick={() => onSelectMode('CHALLENGE_10')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              selectedMode === 'CHALLENGE_10'
                ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2 text-amber-400 font-black text-sm mb-1">
              <Award size={16} /> 10球検定モード
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              きわどい10球のコース判定であなたの「審判能力ランク」を測定！
            </p>
          </div>

          {/* Mode 2: Inning match */}
          <div
            onClick={() => onSelectMode('INNING_GAME')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              selectedMode === 'INNING_GAME'
                ? 'bg-rose-500/20 border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.25)]'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2 text-rose-400 font-black text-sm mb-1">
              <Flame size={16} /> 実戦イニング勝負
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              カウントを刻み3アウトを取るまで誤審なくコールし続けろ！
            </p>
          </div>

          {/* Mode 3: Practice pitch lab */}
          <div
            onClick={() => onSelectMode('TRAINING')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              selectedMode === 'TRAINING'
                ? 'bg-sky-500/20 border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.25)]'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2 text-sky-400 font-black text-sm mb-1">
              <Crosshair size={16} /> コース見極め特訓
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              球種や視点、ゾーンガイドを自由に切り替えて反復トレーニング。
            </p>
          </div>
        </div>

        {/* Primary Start CTA */}
        <div className="pt-3">
          <button
            onClick={() => onStartGame(selectedMode)}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-slate-950 font-black text-lg rounded-2xl shadow-[0_8px_30px_rgba(245,158,11,0.4)] transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            <Play size={20} fill="currentColor" />
            試合開始 [Space / Enter]
          </button>
        </div>
      </div>

      {/* Flat Single Control Hint Line */}
      <div className="text-center text-xs text-slate-400 font-medium py-2 border-t border-slate-800/80">
        [S / →] ストライク判定 · [B / ←] ボール判定 · [Space] 投球開始 / 次の球 · [Esc] 一時停止
      </div>
    </div>
  );
};
