import React from 'react';
import { 
  Play, 
  RotateCcw, 
  History, 
  BookOpen, 
  ArrowLeftRight, 
  Settings2, 
  Users, 
  Spade,
  Award,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Game } from '../types/marriage';
import { SoundEffects } from '../utils/audio';
import { PWAInstallBanner } from './PWAInstallBanner';

interface HomeScreenProps {
  activeGame?: Game;
  onNewGame: () => void;
  onContinueGame: () => void;
  onViewLogs: () => void;
  onViewTutorial: () => void;
  onViewTransfer: () => void;
  onViewRules: () => void;
  onViewPlayers: () => void;
  onOpenCallbreak: () => void;
  onOpenAndroidInstall: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  activeGame,
  onNewGame,
  onContinueGame,
  onViewLogs,
  onViewTutorial,
  onViewTransfer,
  onViewRules,
  onViewPlayers,
  onOpenCallbreak,
  onOpenAndroidInstall,
}) => {
  return (
    <div className="min-h-[calc(100vh-50px)] bg-gradient-to-b from-slate-50 via-white to-slate-100 flex flex-col justify-between py-6 px-4">
      <div className="max-w-md w-full mx-auto space-y-5">
        {/* Logo and Hero Banner */}
        <div className="text-center pt-2 pb-1 space-y-2">
          <div className="inline-flex items-center justify-center relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-red-700 to-rose-500 shadow-xl shadow-red-500/20 flex items-center justify-center border-2 border-white ring-4 ring-red-100 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
              <div className="grid grid-cols-2 gap-1 text-lg">
                <span className="text-white">♠</span>
                <span className="text-amber-300">♥</span>
                <span className="text-amber-300">♦</span>
                <span className="text-white">♣</span>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-amber-400 text-slate-900 font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-md border border-white">
              21 CARDS
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              MARRIAGE
            </h2>
            <p className="text-xs font-bold text-red-600 uppercase tracking-widest">
              POINT CALCULATOR & COMPANION
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Zero manual arithmetic • Instant auditable ledger
            </p>
          </div>
        </div>

        {/* Active Game Quick Resume Banner (if any) */}
        {activeGame && (
          <div className="bg-gradient-to-r from-red-600 to-rose-600 rounded-xl p-3.5 text-white shadow-lg shadow-red-600/15 flex items-center justify-between border border-red-500">
            <div className="space-y-0.5 pr-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-red-100">Active Game in Progress</span>
              </div>
              <p className="text-sm font-bold truncate max-w-[210px]">{activeGame.title}</p>
              <p className="text-xs text-red-100/90">
                {activeGame.players.length} Players • {activeGame.rounds.length} Rounds recorded
              </p>
            </div>
            <button
              onClick={() => {
                SoundEffects.playClick();
                onContinueGame();
              }}
              className="px-3 py-2 bg-white text-red-700 hover:bg-red-50 active:scale-95 text-xs font-extrabold rounded-lg shadow transition-all flex items-center gap-1 flex-shrink-0"
            >
              Resume
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Prominent PWA Native Install Banner */}
        <PWAInstallBanner onOpenDetailedModal={onOpenAndroidInstall} />

        {/* Primary Action Buttons (Red and White Design Direction) */}
        <div className="space-y-2.5">
          {/* New Game Button */}
          <button
            onClick={() => {
              SoundEffects.playClick();
              onNewGame();
            }}
            className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 active:scale-[0.99] text-white font-extrabold py-3.5 px-4 rounded-xl shadow-md shadow-red-600/20 transition-all flex items-center justify-between group border border-red-700"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center text-white">
                <Play className="w-5 h-5 fill-current" />
              </div>
              <div className="text-left">
                <div className="text-sm tracking-wide">NEW GAME</div>
                <div className="text-[11px] text-red-100 font-normal">Start new table with players & rules</div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-red-200 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Continue Previous Game Button */}
          <button
            onClick={() => {
              SoundEffects.playClick();
              onContinueGame();
            }}
            disabled={!activeGame}
            className={`w-full py-3.5 px-4 rounded-xl font-extrabold transition-all flex items-center justify-between group border ${
              activeGame
                ? 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-sm active:scale-[0.99]'
                : 'bg-slate-100 text-slate-400 border-slate-200/60 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${activeGame ? 'bg-red-50 text-red-600' : 'bg-slate-200 text-slate-400'}`}>
                <RotateCcw className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-sm tracking-wide">CONTINUE PREVIOUS GAME</div>
                <div className="text-[11px] font-normal text-slate-500">
                  {activeGame ? `Resume "${activeGame.title}"` : 'No active game in session'}
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Old Game Logs */}
          <button
            onClick={() => {
              SoundEffects.playClick();
              onViewLogs();
            }}
            className="w-full bg-white hover:bg-slate-50 active:scale-[0.99] text-slate-800 font-extrabold py-3.5 px-4 rounded-xl shadow-sm border border-slate-200 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                <History className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-sm tracking-wide">OLD GAME LOGS</div>
                <div className="text-[11px] font-normal text-slate-500">Past scorecards, export & audit trails</div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Quick Dual Action: Callbreak & Player Stats */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => {
                SoundEffects.playClick();
                onOpenCallbreak();
              }}
              className="bg-slate-900 hover:bg-black active:scale-[0.98] text-white p-3 rounded-xl shadow-sm transition-all text-left flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <Spade className="w-5 h-5 text-amber-400" />
                <span className="text-[10px] font-bold bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded">5 Rounds</span>
              </div>
              <div>
                <div className="text-xs font-bold">Callbreak Score</div>
                <div className="text-[10px] text-slate-400">Quick 4-player points</div>
              </div>
            </button>

            <button
              onClick={() => {
                SoundEffects.playClick();
                onViewPlayers();
              }}
              className="bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-800 p-3 rounded-xl shadow-sm border border-slate-200 transition-all text-left flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <Users className="w-5 h-5 text-blue-600" />
                <Award className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <div className="text-xs font-bold">Players & Stats</div>
                <div className="text-[10px] text-slate-500">Lifetime wins & groups</div>
              </div>
            </button>
          </div>

          {/* Marriage Rules & House Presets */}
          <button
            onClick={() => {
              SoundEffects.playClick();
              onViewRules();
            }}
            className="w-full bg-white hover:bg-slate-50 active:scale-[0.99] text-slate-800 font-extrabold py-3 px-4 rounded-xl shadow-sm border border-slate-200 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                <Settings2 className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold">Marriage Rules & House Presets</div>
                <div className="text-[10px] font-normal text-slate-500">Kathmandu standard, Kidnap/Murder, Dublee</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Watch Tutorial / Interactive Guide */}
          <button
            onClick={() => {
              SoundEffects.playClick();
              onViewTutorial();
            }}
            className="w-full bg-white hover:bg-slate-50 active:scale-[0.99] text-slate-800 font-extrabold py-3 px-4 rounded-xl shadow-sm border border-slate-200 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold">Watch Tutorial & Interactive Maal Calc</div>
                <div className="text-[10px] font-normal text-slate-500">How to score Tiplu, Poplu, Alter & Marriage</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Transfer Game to this Device / Backup */}
          <button
            onClick={() => {
              SoundEffects.playClick();
              onViewTransfer();
            }}
            className="w-full bg-white hover:bg-slate-50 active:scale-[0.99] text-slate-700 font-semibold py-2.5 px-4 rounded-xl border border-dashed border-slate-300 transition-all flex items-center justify-between group text-xs"
          >
            <div className="flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-slate-500" />
              <span>Transfer Game / Backup & Restore</span>
            </div>
            <span className="text-[10px] text-slate-400">JSON Sync</span>
          </button>

          {/* Install Mobile App / APK Options */}
          <button
            onClick={() => {
              SoundEffects.playClick();
              onOpenAndroidInstall();
            }}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-[0.99] text-white font-extrabold py-3 px-4 rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-between group border border-emerald-700 text-xs"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base">📲</span>
              <div className="text-left">
                <div className="text-xs font-bold">Install Android App & APK</div>
                <div className="text-[10px] text-emerald-100 font-normal">1-tap home screen install or download Flutter source</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-emerald-200 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="text-center pt-4 text-[11px] text-slate-400 space-y-0.5 max-w-md mx-auto w-full">
        <p>Offline Ready • Pure Ledger Math • Free from Ads</p>
        <p className="text-[10px] text-slate-400/80">Marriage Point Calculator v1.0 • Kathmandu</p>
      </div>
    </div>
  );
};
