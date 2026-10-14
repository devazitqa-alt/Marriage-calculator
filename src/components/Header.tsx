import React from 'react';
import { Volume2, VolumeX, BookOpen, RotateCcw, Home, Spade } from 'lucide-react';
import { SoundEffects } from '../utils/audio';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  activeGameTitle?: string;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenAndroidInstall: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  activeGameTitle,
  soundEnabled,
  onToggleSound,
  onOpenAndroidInstall,
}) => {
  if (currentView === 'scoreboard') {
    return (
      <header className="sticky top-0 z-40 bg-[#d32f2f] text-white shadow-md">
        <div className="max-w-md mx-auto px-4 py-2.5 flex items-center justify-between">
          {/* Stream button */}
          <button
            onClick={() => {
              SoundEffects.playClick();
              alert('Stream / Live Table Screen: Share link copied to clipboard for table spectators!');
            }}
            className="px-3 py-1 bg-white text-[#d32f2f] hover:bg-red-50 active:scale-95 text-xs font-bold rounded-md shadow-xs flex items-center gap-1.5 transition-all"
          >
            <span className="text-[13px]">📶</span>
            <span>Stream</span>
          </button>

          {/* Centered Score Board title */}
          <h1 className="text-xl font-bold tracking-tight text-white font-serif text-center flex-1 mx-2">
            Score Board
          </h1>

          {/* Right action icons: Install, Info, Home */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                SoundEffects.playClick();
                onOpenAndroidInstall();
              }}
              className="p-1 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-colors text-xs font-bold flex items-center gap-1"
              title="Install Android App / APK"
            >
              <span>📲</span>
            </button>
            <button
              onClick={() => {
                SoundEffects.playClick();
                onNavigate('tutorial');
              }}
              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/20 active:scale-95 text-white transition-colors"
              title="Marriage Rules & Info"
            >
              <span className="text-base font-bold bg-white text-[#d32f2f] rounded-full w-5 h-5 flex items-center justify-center text-xs">
                i
              </span>
            </button>
            <button
              onClick={() => {
                SoundEffects.playClick();
                onNavigate('home');
              }}
              className="p-1 rounded-lg hover:bg-white/20 active:scale-95 text-white transition-colors"
              title="Home"
            >
              <Home className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 bg-[#d32f2f] text-white shadow-md border-b border-red-800">
      <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {currentView !== 'home' ? (
            <button
              onClick={() => {
                SoundEffects.playClick();
                onNavigate('home');
              }}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white flex items-center gap-1.5 text-xs font-semibold"
              title="Return Home"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white text-red-700 font-extrabold flex items-center justify-center text-lg shadow-sm border border-red-100">
                🎴
              </div>
              <div>
                <h1 className="text-base font-extrabold tracking-tight leading-tight flex items-center gap-1.5">
                  MARRIAGE <span className="text-red-200 text-xs font-normal">Point Calculator</span>
                </h1>
                <p className="text-[10px] text-red-100/90 font-medium leading-none">Nepali Card Game Scorekeeper</p>
              </div>
            </div>
          )}

          {currentView !== 'home' && (
            <div className="ml-2 flex items-center gap-1.5">
              <span className="text-xs font-bold text-white tracking-wide truncate max-w-[140px] sm:max-w-xs">
                {activeGameTitle || currentView.toUpperCase()}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {currentView !== 'callbreak' && (
            <button
              onClick={() => {
                SoundEffects.playClick();
                onNavigate('callbreak');
              }}
              className="px-2 py-1 rounded-md bg-black/25 hover:bg-black/35 text-[11px] font-bold text-white flex items-center gap-1 transition-all"
              title="Callbreak Calculator"
            >
              <Spade className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden xs:inline">Callbreak</span>
            </button>
          )}

          <button
            onClick={() => {
              SoundEffects.playClick();
              onNavigate('tutorial');
            }}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white"
            title="Marriage Rules & Tutorial"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              onToggleSound();
              SoundEffects.playClick();
            }}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white"
            title={soundEnabled ? 'Mute Sounds' : 'Enable Sounds'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 opacity-75" />}
          </button>
        </div>
      </div>
    </header>
  );
};
