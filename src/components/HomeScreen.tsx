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
  Settings,
  Moon,
  Sun
} from 'lucide-react';
import { Game } from '../types/marriage';
import { SoundEffects } from '../utils/audio';

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
  onOpenSettings: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
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
  onOpenSettings,
  isDarkMode,
  onToggleDarkMode,
}) => {
  return (
    <div className="min-h-[calc(100vh-50px)] bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-[#070b14] dark:via-[#0c1220] dark:to-[#070b14] text-slate-900 dark:text-slate-100 flex flex-col justify-between py-6 px-4 transition-colors">
      <div className="max-w-md w-full mx-auto space-y-4">
        {/* Logo and Hero Banner */}
        <div className="text-center pt-2 pb-1 space-y-2">
          <div className="inline-flex items-center justify-center relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-red-700 to-rose-500 dark:from-red-800 dark:to-rose-600 shadow-xl shadow-red-500/20 dark:shadow-red-950/50 flex items-center justify-center border-2 border-white dark:border-slate-800 ring-4 ring-red-100 dark:ring-red-950/40 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
              <div className="grid grid-cols-2 gap-1 text-lg">
                <span className="text-white">♠</span>
                <span className="text-amber-300">♥</span>
                <span className="text-amber-300">♦</span>
                <span className="text-white">♣</span>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-amber-400 text-slate-900 font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-md border border-white dark:border-slate-900">
              21 CARDS
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              MARRIAGE
            </h2>
            <p className="text-xs font-bold text-red-600 dark:text-rose-400 uppercase tracking-widest">
              POINT CALCULATOR & COMPANION
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Zero manual arithmetic • Instant auditable ledger
            </p>
          </div>
        </div>

        {/* Night Session Mode Quick Banner */}
        <div className="bg-slate-100 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs transition-colors">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-amber-400/20 text-amber-300' : 'bg-red-100 text-red-600'}`}>
              {isDarkMode ? <Moon className="w-3.5 h-3.5 fill-current" /> : <Sun className="w-3.5 h-3.5" />}
            </div>
            <div>
              <span className="font-extrabold text-slate-800 dark:text-white text-xs block leading-tight">
                {isDarkMode ? 'High-Contrast Night Theme' : 'Daylight High Visibility'}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                {isDarkMode ? 'Optimized for low-light evening play' : 'Crisp standard contrast'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                SoundEffects.playClick();
                onToggleDarkMode();
              }}
              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white dark:bg-[#1e293b] text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-[#28354f] border border-slate-200 dark:border-slate-700 shadow-2xs active:scale-95 transition-all"
            >
              {isDarkMode ? 'Light' : 'Night'}
            </button>
            <button
              onClick={() => {
                SoundEffects.playClick();
                onOpenSettings();
              }}
              className="p-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Active Game Quick Resume Banner (if any) */}
        {activeGame && (
          <div className="bg-gradient-to-r from-red-600 to-rose-600 dark:from-red-900 dark:to-rose-900 rounded-xl p-3.5 text-white shadow-lg shadow-red-600/15 dark:shadow-red-950/40 flex items-center justify-between border border-red-500 dark:border-red-800">
            <div className="space-y-0.5 pr-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-red-100 dark:text-rose-200">Active Game in Progress</span>
              </div>
              <p className="text-sm font-bold truncate max-w-[210px]">{activeGame.title}</p>
              <p className="text-xs text-red-100/90 dark:text-rose-200/90">
                {activeGame.players.length} Players • {activeGame.rounds.length} Rounds recorded
              </p>
            </div>
            <button
              onClick={() => {
                SoundEffects.playClick();
                onContinueGame();
              }}
              className="px-3 py-2 bg-white dark:bg-[#1a0f12] text-red-700 dark:text-rose-300 hover:bg-red-50 dark:hover:bg-[#25151a] active:scale-95 text-xs font-extrabold rounded-lg shadow-sm border border-transparent dark:border-rose-900/40 transition-all flex items-center gap-1 flex-shrink-0"
            >
              Resume
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Primary Action Buttons */}
        <div className="space-y-2.5">
          {/* 1. New Game Button */}
          <button
            onClick={() => {
              SoundEffects.playClick();
              onNewGame();
            }}
            className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 dark:from-red-800 dark:to-rose-800 dark:hover:from-red-700 dark:hover:to-rose-700 active:scale-[0.99] text-white font-extrabold py-3.5 px-4 rounded-xl shadow-md shadow-red-600/20 dark:shadow-red-950/40 transition-all flex items-center justify-between group border border-red-700 dark:border-red-900"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/20 dark:bg-white/10 flex items-center justify-center text-white">
                <Play className="w-5 h-5 fill-current" />
              </div>
              <div className="text-left">
                <div className="text-sm tracking-wide">NEW GAME</div>
                <div className="text-[11px] text-red-100 dark:text-rose-200 font-normal">Start new table with players & rules</div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-red-200 dark:text-rose-300 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* 2. Continue Previous Game Button */}
          <button
            onClick={() => {
              SoundEffects.playClick();
              onContinueGame();
            }}
            disabled={!activeGame}
            className={`w-full py-3.5 px-4 rounded-xl font-extrabold transition-all flex items-center justify-between group border ${
              activeGame
                ? 'bg-white hover:bg-slate-50 dark:bg-[#111827] dark:hover:bg-[#1a253f] text-slate-800 dark:text-white border-slate-200 dark:border-slate-800 shadow-sm active:scale-[0.99]'
                : 'bg-slate-100 dark:bg-[#0b101c] text-slate-400 dark:text-slate-600 border-slate-200/60 dark:border-slate-900/60 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                activeGame 
                  ? 'bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-rose-400' 
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600'
              }`}>
                <RotateCcw className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-sm tracking-wide">CONTINUE PREVIOUS GAME</div>
                <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                  {activeGame ? `Resume "${activeGame.title}"` : 'No active game in session'}
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* 3. Old Game Logs */}
          <button
            onClick={() => {
              SoundEffects.playClick();
              onViewLogs();
            }}
            className="w-full bg-white hover:bg-slate-50 dark:bg-[#111827] dark:hover:bg-[#1a253f] active:scale-[0.99] text-slate-800 dark:text-white font-extrabold py-3.5 px-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-[#1e293b] flex items-center justify-center text-slate-700 dark:text-slate-300">
                <History className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-sm tracking-wide">OLD GAME LOGS</div>
                <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400">Past scorecards, export & audit trails</div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* 4. Marriage Rules & House Presets */}
          <button
            onClick={() => {
              SoundEffects.playClick();
              onViewRules();
            }}
            className="w-full bg-white hover:bg-slate-50 dark:bg-[#111827] dark:hover:bg-[#1a253f] active:scale-[0.99] text-slate-800 dark:text-white font-extrabold py-3.5 px-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-950/50 flex items-center justify-center text-red-600 dark:text-rose-400">
                <Settings2 className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-sm tracking-wide">MARRIAGE RULES & INFO</div>
                <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400">Kathmandu standard, Kidnap/Murder, Dublee</div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* 5. Watch Tutorial / Interactive Guide */}
          <button
            onClick={() => {
              SoundEffects.playClick();
              onViewTutorial();
            }}
            className="w-full bg-white hover:bg-slate-50 dark:bg-[#111827] dark:hover:bg-[#1a253f] active:scale-[0.99] text-slate-800 dark:text-white font-extrabold py-3.5 px-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-sm tracking-wide">WATCH TUTORIAL</div>
                <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400">Interactive Tiplu, Poplu, Alter & Maal calculator</div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* 6. Transfer Game to this Device / Backup */}
          <button
            onClick={() => {
              SoundEffects.playClick();
              onViewTransfer();
            }}
            className="w-full bg-white hover:bg-slate-50 dark:bg-[#111827] dark:hover:bg-[#1a253f] active:scale-[0.99] text-slate-800 dark:text-white font-extrabold py-3.5 px-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <ArrowLeftRight className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-sm tracking-wide">TRANSFER GAME TO THIS DEVICE</div>
                <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400">Secure JSON backup, restore & sync</div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Complementary Table Tools: Callbreak & Players */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={() => {
                SoundEffects.playClick();
                onOpenCallbreak();
              }}
              className="bg-slate-900 hover:bg-black dark:bg-[#111827] dark:hover:bg-[#1c2438] active:scale-[0.98] text-white p-3 rounded-xl shadow-xs border border-transparent dark:border-slate-800 transition-all text-left flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <Spade className="w-4 h-4 text-amber-400" />
                <span className="text-[10px] font-bold bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded">5 Rounds</span>
              </div>
              <div>
                <div className="text-xs font-bold text-white">Callbreak Calculator</div>
                <div className="text-[10px] text-slate-400">Quick 4-player points</div>
              </div>
            </button>

            <button
              onClick={() => {
                SoundEffects.playClick();
                onViewPlayers();
              }}
              className="bg-white hover:bg-slate-50 dark:bg-[#111827] dark:hover:bg-[#1c2438] active:scale-[0.98] text-slate-800 dark:text-white p-3 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800 transition-all text-left flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <Award className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <div className="text-xs font-bold">Players & Stats</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Lifetime records & groups</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="text-center pt-4 text-[11px] text-slate-400 dark:text-slate-500 space-y-0.5 max-w-md mx-auto w-full">
        <p>Offline Ready • Pure Ledger Math • Free from Ads</p>
        <p className="text-[10px] text-slate-400/80 dark:text-slate-600">Marriage Point Calculator v1.0 • Kathmandu</p>
      </div>
    </div>
  );
};
