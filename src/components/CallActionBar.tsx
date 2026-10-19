import React, { useEffect, useState } from 'react';

interface CallActionBarProps {
  onCall: (call: 'STRIKE' | 'BALL') => void;
  isTwoStrikes: boolean;
  timeLimitSec?: number;
}

export const CallActionBar: React.FC<CallActionBarProps> = ({
  onCall,
  isTwoStrikes,
  timeLimitSec = 3.2,
}) => {
  const [timeLeft, setTimeLeft] = useState(timeLimitSec);

  // Countdown timer for umpire decision
  useEffect(() => {
    setTimeLeft(timeLimitSec);
    const start = performance.now();

    const interval = setInterval(() => {
      const elapsed = (performance.now() - start) / 1000;
      const remaining = Math.max(0, timeLimitSec - elapsed);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        // Default timeout call
        onCall('BALL');
      }
    }, 30);

    return () => clearInterval(interval);
  }, [timeLimitSec, onCall]);

  const progressPct = (timeLeft / timeLimitSec) * 100;

  return (
    <div className="absolute bottom-28 inset-x-0 z-20 flex flex-col items-center pointer-events-auto px-4">
      {/* 2-Strikes Punchout Prompt */}
      {isTwoStrikes && (
        <div className="mb-3 px-4 py-1 rounded-full bg-amber-500/90 text-slate-950 font-black text-xs tracking-wider uppercase animate-bounce shadow-lg">
          ⚡ 2ストライク追い込み！三振パンチアウトのチャンス！
        </div>
      )}

      {/* Decision Timer Bar */}
      <div className="w-72 max-w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-4 border border-slate-700">
        <div
          className={`h-full transition-all duration-75 ${
            progressPct > 40 ? 'bg-amber-400' : 'bg-rose-500'
          }`}
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Action Buttons: STRIKE vs BALL */}
      <div className="flex items-center gap-6">
        {/* BALL Button */}
        <button
          onClick={() => onCall('BALL')}
          className="group relative flex flex-col items-center justify-center w-36 sm:w-44 h-20 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-black rounded-2xl shadow-[0_8px_25px_rgba(37,99,235,0.45)] border-2 border-blue-400/60 transition-all cursor-pointer"
        >
          <span className="text-xl sm:text-2xl tracking-wider">ボール</span>
          <span className="text-[11px] font-mono text-blue-200 mt-0.5 bg-blue-800/80 px-2 py-0.5 rounded">
            [B] または [←]
          </span>
        </button>

        {/* STRIKE Button */}
        <button
          onClick={() => onCall('STRIKE')}
          className="group relative flex flex-col items-center justify-center w-36 sm:w-44 h-20 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-black rounded-2xl shadow-[0_8px_25px_rgba(225,29,72,0.5)] border-2 border-rose-400/60 transition-all cursor-pointer"
        >
          <span className="text-xl sm:text-2xl tracking-wider">
            {isTwoStrikes ? 'ストライク (卍)' : 'ストライク'}
          </span>
          <span className="text-[11px] font-mono text-rose-200 mt-0.5 bg-rose-800/80 px-2 py-0.5 rounded">
            [S] または [→]
          </span>
        </button>
      </div>

      <div className="text-slate-400 text-xs mt-3 font-medium select-none">
        捕球の瞬間を見極めて直感でコール！
      </div>
    </div>
  );
};
