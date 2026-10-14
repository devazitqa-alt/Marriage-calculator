import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  Moon, 
  Sun, 
  Volume2, 
  VolumeX, 
  Eye, 
  Smartphone, 
  BookOpen, 
  Settings2, 
  ArrowLeftRight, 
  Check, 
  Sparkles,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';
import { StorageService } from '../services/storageService';
import { SoundEffects } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenRules: () => void;
  onOpenTransfer: () => void;
  onOpenTutorial: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  onToggleDarkMode,
  soundEnabled,
  onToggleSound,
  onOpenRules,
  onOpenTransfer,
  onOpenTutorial,
}) => {
  if (!isOpen) return null;

  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [wakeLockSupported, setWakeLockSupported] = useState(false);
  const [wakeLockSentinel, setWakeLockSentinel] = useState<any>(null);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
      setWakeLockSupported(true);
    }
  }, []);

  const handleToggleWakeLock = async () => {
    SoundEffects.playClick();
    if (!wakeLockSupported) return;

    if (wakeLockActive && wakeLockSentinel) {
      try {
        await wakeLockSentinel.release();
        setWakeLockSentinel(null);
        setWakeLockActive(false);
      } catch (err) {
        console.error('WakeLock release error:', err);
      }
    } else {
      try {
        const sentinel = await (navigator as any).wakeLock.request('screen');
        sentinel.addEventListener('release', () => {
          setWakeLockActive(false);
          setWakeLockSentinel(null);
        });
        setWakeLockSentinel(sentinel);
        setWakeLockActive(true);
      } catch (err) {
        console.error('WakeLock request error:', err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 rounded-2xl shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 transition-colors">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-rose-600 dark:from-[#1e131d] dark:via-[#7f1d1d] dark:to-[#450a0a] px-5 py-3.5 text-white flex items-center justify-between border-b border-red-800 dark:border-red-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 dark:bg-white/10 flex items-center justify-center backdrop-blur-xs">
              <Settings className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base tracking-tight">App Settings & Preferences</h3>
              <p className="text-[11px] text-red-100 dark:text-red-200">Night session display, sound & house presets</p>
            </div>
          </div>
          <button
            onClick={() => {
              SoundEffects.playClick();
              onClose();
            }}
            className="p-1 rounded-lg hover:bg-white/20 active:scale-95 transition-colors text-white"
            title="Close Settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          
          {/* FEATURED: High-Contrast Dark Mode Toggle */}
          <div className="bg-slate-50 dark:bg-[#131b2e] rounded-xl p-4 border border-slate-200 dark:border-slate-700/80 space-y-3.5 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-amber-400/20 text-amber-300' : 'bg-red-100 text-red-600'}`}>
                    {isDarkMode ? <Moon className="w-4 h-4 fill-current" /> : <Sun className="w-4 h-4" />}
                  </div>
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                    High-Contrast Dark Theme
                  </span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isDarkMode 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                      : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {isDarkMode ? 'Night Active' : 'Off'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Tailored for dim-lit evening and late-night sessions. Deep obsidian surfaces with luminous high-contrast cards eliminate screen glare around the table.
                </p>
              </div>

              {/* Master Switch */}
              <button
                type="button"
                onClick={() => {
                  SoundEffects.playClick();
                  onToggleDarkMode();
                }}
                className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  isDarkMode ? 'bg-red-600 dark:bg-red-500' : 'bg-slate-300'
                }`}
                role="switch"
                aria-checked={isDarkMode}
                title="Toggle Dark Mode"
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out flex items-center justify-center text-[11px] ${
                    isDarkMode ? 'translate-x-6' : 'translate-x-0'
                  }`}
                >
                  {isDarkMode ? '🌙' : '☀️'}
                </span>
              </button>
            </div>

            {/* High-Contrast Night Live Preview Card */}
            <div className="bg-white dark:bg-[#0a0f1d] rounded-lg p-3 border border-slate-200 dark:border-slate-800 shadow-inner">
              <div className="flex items-center justify-between text-[11px] mb-2 font-bold text-slate-500 dark:text-slate-400">
                <span>Scoreboard Night Preview</span>
                <span className="text-[10px] uppercase font-mono tracking-wider text-amber-500 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> 21 Cards Ready
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
                <div className="bg-slate-50 dark:bg-[#162035] p-2 rounded-md border border-slate-100 dark:border-slate-700/60">
                  <div className="font-bold text-slate-700 dark:text-slate-200 text-[11px]">Dealer</div>
                  <div className="text-amber-500 font-extrabold text-sm">👑 R1</div>
                </div>
                <div className="bg-slate-50 dark:bg-[#162035] p-2 rounded-md border border-slate-100 dark:border-slate-700/60">
                  <div className="font-bold text-slate-700 dark:text-slate-200 text-[11px]">Tiplu</div>
                  <div className="text-rose-500 font-black text-sm">♥ 10</div>
                </div>
                <div className="bg-slate-50 dark:bg-[#162035] p-2 rounded-md border border-slate-100 dark:border-slate-700/60">
                  <div className="font-bold text-slate-700 dark:text-slate-200 text-[11px]">Winner</div>
                  <div className="text-emerald-600 dark:text-emerald-400 font-black font-mono text-sm">+42</div>
                </div>
                <div className="bg-slate-50 dark:bg-[#162035] p-2 rounded-md border border-slate-100 dark:border-slate-700/60">
                  <div className="font-bold text-slate-700 dark:text-slate-200 text-[11px]">Unseen</div>
                  <div className="text-red-600 dark:text-rose-400 font-black font-mono text-sm">-19</div>
                </div>
              </div>
            </div>

            {/* Quick Note */}
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
              <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              <span>Theme preference is saved persistently across browser refreshes and sessions.</span>
            </div>
          </div>

          {/* Night Session: Screen Wake Lock */}
          {wakeLockSupported && (
            <div className="bg-slate-50 dark:bg-[#131b2e] rounded-xl p-3.5 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                  <Smartphone className="w-4 h-4 text-indigo-500" />
                  <span>Keep Screen Awake (Night Table)</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Prevents device screen from dimming/sleeping while cards are being dealt.
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggleWakeLock}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                  wakeLockActive 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs' 
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300'
                }`}
              >
                {wakeLockActive ? 'Awake Active' : 'Enable'}
              </button>
            </div>
          )}

          {/* Audio & Haptic Feedback */}
          <div className="bg-slate-50 dark:bg-[#131b2e] rounded-xl p-3.5 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-400" />
                )}
                <span>Sound & Card Effects</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Audio cues for card dealing, round saves, point calculation & wins.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                SoundEffects.playClick();
                onToggleSound();
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                soundEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
              role="switch"
              aria-checked={soundEnabled}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  soundEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Table Presets & Rules Hub */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-3 space-y-2">
            <span className="font-bold text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Game Rules & Tools
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  SoundEffects.playClick();
                  onClose();
                  onOpenRules();
                }}
                className="p-3 bg-white dark:bg-[#131b2e] hover:bg-slate-100 dark:hover:bg-[#1a253f] border border-slate-200 dark:border-slate-700/80 rounded-xl text-left flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
                    <Settings2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">House Rules & Presets</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Murder, Kathmandu, Dublee</div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  SoundEffects.playClick();
                  onClose();
                  onOpenTutorial();
                }}
                className="p-3 bg-white dark:bg-[#131b2e] hover:bg-slate-100 dark:hover:bg-[#1a253f] border border-slate-200 dark:border-slate-700/80 rounded-xl text-left flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Interactive Card Guide</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Tiplu, Poplu & Maal scoring</div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  SoundEffects.playClick();
                  onClose();
                  onOpenTransfer();
                }}
                className="p-3 bg-white dark:bg-[#131b2e] hover:bg-slate-100 dark:hover:bg-[#1a253f] border border-slate-200 dark:border-slate-700/80 rounded-xl text-left flex items-center justify-between group transition-all sm:col-span-2"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                    <ArrowLeftRight className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Transfer & Backup Database</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Export/import JSON game files between phones</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center pt-2 text-[10px] text-slate-400 dark:text-slate-500 space-y-0.5">
            <p>Marriage Point Calculator v1.0 • Offline Ready</p>
            <p>Clean high-contrast night session theme</p>
          </div>
        </div>

        {/* Modal Bottom Done */}
        <div className="bg-slate-50 dark:bg-[#0c1220] px-4 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={() => {
              SoundEffects.playClick();
              onClose();
            }}
            className="px-4 py-2 bg-slate-900 hover:bg-black dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-extrabold rounded-lg shadow-sm active:scale-95 text-xs transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
