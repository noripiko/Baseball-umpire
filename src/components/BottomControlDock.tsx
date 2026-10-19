import React, { useState } from 'react';
import { BatterStance, CameraPreset, GameSettings, PitchType } from '../types';
import { Volume2, VolumeX, Eye, EyeOff, Video, ChevronDown, ChevronUp, User } from 'lucide-react';
import { PITCH_PRESETS } from '../game/physics';

interface BottomControlDockProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  isPitchInProgress: boolean;
  onTriggerPitch?: () => void;
  selectedPitchType?: PitchType;
  onSelectPitchType?: (type: PitchType) => void;
  isTrainingMode?: boolean;
}

export const BottomControlDock: React.FC<BottomControlDockProps> = ({
  settings,
  onUpdateSettings,
  isPitchInProgress,
  onTriggerPitch,
  selectedPitchType,
  onSelectPitchType,
  isTrainingMode = false,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-20 w-[94vw] max-w-4xl pointer-events-auto transition-transform duration-300">
      {/* Collapse/Expand toggle handle */}
      <div className="flex justify-center -mb-px">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/90 border border-slate-700/80 border-b-0 rounded-t-lg text-[11px] font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer shadow-md"
        >
          {isCollapsed ? (
            <>
              <ChevronUp size={14} /> 操作ドックを表示
            </>
          ) : (
            <>
              <ChevronDown size={14} /> ドックを格納 (広角視界)
            </>
          )}
        </button>
      </div>

      {/* Dock Content */}
      {!isCollapsed && (
        <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl p-3 shadow-2xl text-white">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Camera View Preset Pills */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700/50">
              <span className="text-[10px] text-slate-400 font-bold px-1.5 flex items-center gap-1">
                <Video size={13} /> 視点:
              </span>
              {(
                [
                  { id: 'SLOT', label: '球審スロット' },
                  { id: 'CATCHER', label: '捕手目線' },
                  { id: 'WIDE', label: '広角' },
                  { id: 'SIDE', label: '側面' },
                ] as const
              ).map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => onUpdateSettings({ cameraPreset: preset.id as CameraPreset })}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    settings.cameraPreset === preset.id
                      ? 'bg-amber-500 text-slate-950 font-bold shadow'
                      : 'text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Zone Guide Toggle */}
            <button
              onClick={() => onUpdateSettings({ showZoneGuide: !settings.showZoneGuide })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
                settings.showZoneGuide
                  ? 'bg-sky-500/20 border-sky-400 text-sky-300 font-bold'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              {settings.showZoneGuide ? <Eye size={14} /> : <EyeOff size={14} />}
              <span>ゾーン枠: {settings.showZoneGuide ? '常時表示中' : '非表示 (実戦)'}</span>
            </button>

            {/* Batter Stance Toggle */}
            <button
              onClick={() =>
                onUpdateSettings({
                  batterStance: settings.batterStance === 'RIGHT' ? 'LEFT' : 'RIGHT',
                })
              }
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all"
            >
              <User size={14} />
              <span>打者: {settings.batterStance === 'RIGHT' ? '右打席' : '左打席'}</span>
            </button>

            {/* Audio Toggle */}
            <div className="flex items-center gap-2 bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-700/50">
              <button
                onClick={() => onUpdateSettings({ isMuted: !settings.isMuted })}
                className="text-slate-300 hover:text-white transition-colors"
                title={settings.isMuted ? 'ミュート解除' : 'ミュート'}
              >
                {settings.isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.isMuted ? 0 : settings.soundVolume}
                onChange={(e) => {
                  const vol = parseFloat(e.target.value);
                  onUpdateSettings({ soundVolume: vol, isMuted: vol === 0 });
                }}
                className="w-16 h-1 accent-amber-500 rounded bg-slate-700 cursor-pointer"
              />
            </div>

            {/* Practice Pitch Selector in Training Mode */}
            {isTrainingMode && onSelectPitchType && (
              <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700/50">
                <span className="text-[10px] text-amber-400 font-bold px-1">球種指定:</span>
                <select
                  value={selectedPitchType || 'FOUR_SEAM'}
                  onChange={(e) => onSelectPitchType(e.target.value as PitchType)}
                  className="bg-slate-900 text-white rounded px-2 py-0.5 border border-slate-700 outline-none text-xs"
                >
                  {Object.entries(PITCH_PRESETS).map(([key, val]) => (
                    <option key={key} value={key}>
                      {val.nameJa}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Throw Pitch CTA if ready and training */}
            {isTrainingMode && onTriggerPitch && !isPitchInProgress && (
              <button
                onClick={onTriggerPitch}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 font-bold text-white rounded-xl shadow active:scale-95 transition-all"
              >
                投球開始 [Space]
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
