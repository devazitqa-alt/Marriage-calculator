import React, { useState } from 'react';
import { Volume2, VolumeX, BookOpen, RotateCcw, Home, Spade, Check } from 'lucide-react';
import { SoundEffects } from '../utils/audio';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  activeGameTitle?: string;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  activeGameTitle,
  soundEnabled,
  onToggleSound,
}) => {
  const [streamCopied, setStreamCopied] = useState(false);

  const handleStreamClick = () => {
    SoundEffects.playClick();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
    setStreamCopied(true);
    setTimeout(() => setStreamCopied(false), 2500);
  };

  if (currentView === 'scoreboard') {
    return (
      <header className="sticky top-0 z-40 bg-[#d32f2f] text-white shadow-md">
        <div className="max-w-md mx-auto px-4 py-2.5 flex items-center justify-between">
          {/* Stream button */}
          <button
            onClick={handleStreamClick}
            className="px-3 py-1 bg-white text-[#d32f2f] hover:bg-red-50 active:scale-95 text-xs font-bold rounded-md shadow-xs flex items-center gap-1.5 transition-all"
            title="Copy spectator link"
          >
            {streamCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <span className="text-[13px]">📶</span>
                <span>Stream</span>
              </>
            )}
          </button>

          {/* Centered Score Board title */}
          <h1 className="text-xl font-bold tracking-tight text-white font-serif text-center flex-1 mx-2">
            Score Board
          </h1>

          {/* Right action icons: Info, Sound, Home */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                SoundEffects.playClick();
                onToggleSound();
              }}
              className="p-1 rounded-lg hover:bg-white/20 active:scale-95 text-white transition-colors"
              title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-200" />}
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

        {/* Header Right Action icons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              SoundEffects.playClick();
              onToggleSound();
            }}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white"
            title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-200" />}
          </button>

          {currentView === 'home' && (
            <button
              onClick={() => {
                SoundEffects.playClick();
                onNavigate('tutorial');
              }}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white flex items-center gap-1 text-xs font-semibold"
              title="How to Play"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Guide</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
