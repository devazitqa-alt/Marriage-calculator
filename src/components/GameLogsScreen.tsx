import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Trash2, 
  Play, 
  FileText, 
  Trophy, 
  Calendar, 
  Users, 
  ChevronRight,
  RotateCcw,
  Download
} from 'lucide-react';
import { Game } from '../types/marriage';
import { StorageService } from '../services/storageService';
import { SoundEffects } from '../utils/audio';

interface GameLogsScreenProps {
  onBack: () => void;
  onOpenGame: (game: Game) => void;
  onRematchGame: (game: Game) => void;
}

export const GameLogsScreen: React.FC<GameLogsScreenProps> = ({
  onBack,
  onOpenGame,
  onRematchGame,
}) => {
  const [games, setGames] = useState<Game[]>(() => StorageService.getGames());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredGames = games.filter((g) => {
    const matchesStatus = statusFilter === 'all' || g.status === statusFilter;
    const matchesSearch =
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.players.some((p) => p.displayName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const handleDelete = (id: string) => {
    SoundEffects.playClick();
    StorageService.deleteGame(id);
    setGames(StorageService.getGames());
    setConfirmDeleteId(null);
  };

  const handleDownloadCSV = (game: Game) => {
    SoundEffects.playClick();
    let csv = `Round,${game.players.map((p) => p.displayName).join(',')}\n`;
    game.rounds.forEach((r) => {
      const row = [r.roundNumber, ...game.players.map((p) => r.netPoints[p.id] || 0)];
      csv += `${row.join(',')}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${game.title.replace(/\s+/g, '_')}_scorecard.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-[calc(100vh-50px)] bg-slate-100 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 py-4 px-3 sm:px-6 transition-colors">
      <div className="max-w-3xl w-full mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                SoundEffects.playClick();
                onBack();
              }}
              className="p-1.5 rounded-lg bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#1c2438] text-slate-700 dark:text-slate-200 shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white">Old Game Logs & Scorecards</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{games.length} total sessions recorded</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search by game title or player name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 shadow-2xs"
            />
          </div>

          <div className="flex gap-1 bg-white dark:bg-[#111827] p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs text-xs font-bold">
            {(['all', 'active', 'completed'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg capitalize transition-colors ${
                  statusFilter === st 
                    ? 'bg-red-600 dark:bg-rose-600 text-white' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1c2438]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Game List */}
        <div className="space-y-2.5">
          {filteredGames.map((game) => {
            // Find game leader
            let highestPts = -Infinity;
            let leaderName = 'None';
            game.players.forEach((p) => {
              let pts = 0;
              game.rounds.forEach((r) => (pts += r.netPoints[p.id] || 0));
              if (pts > highestPts) {
                highestPts = pts;
                leaderName = p.displayName;
              }
            });

            return (
              <div
                key={game.id}
                className="bg-white dark:bg-[#111827] rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{game.title}</h3>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          game.status === 'active'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {game.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(game.startedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span>•</span>
                      <span>{game.rulesProfile.name}</span>
                      <span>•</span>
                      <span>{game.rounds.length} Rounds</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Leader / Winner</span>
                    <span className="font-extrabold text-xs text-amber-600 dark:text-amber-400 flex items-center justify-end gap-1">
                      <Trophy className="w-3.5 h-3.5" />
                      {leaderName} ({highestPts > 0 ? `+${highestPts}` : highestPts})
                    </span>
                  </div>
                </div>

                {/* Player tags */}
                <div className="flex flex-wrap items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#0c1220] p-2 rounded-xl">
                  <span className="font-bold text-slate-400 dark:text-slate-500 mr-1 flex items-center gap-0.5">
                    <Users className="w-3 h-3" /> Roster:
                  </span>
                  {game.players.map((p) => (
                    <span key={p.id} className="bg-white dark:bg-[#1a253f] px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700/80 font-medium text-slate-800 dark:text-slate-200">
                      {p.displayName}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownloadCSV(game)}
                      className="px-2.5 py-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-[#1a253f] rounded-lg transition-colors text-[11px]"
                    >
                      <Download className="w-3.5 h-3.5" /> CSV
                    </button>
                    <button
                      onClick={() => onRematchGame(game)}
                      className="px-2.5 py-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-[#1a253f] rounded-lg transition-colors text-[11px]"
                      title="Start a new game reusing this table setup"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Rematch Table
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(game.id)}
                      className="px-2.5 py-1 text-red-500 hover:text-red-700 dark:text-rose-400 dark:hover:text-rose-300 font-bold flex items-center gap-1 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors text-[11px]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => onOpenGame(game)}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 dark:bg-rose-600 dark:hover:bg-rose-700 text-white font-extrabold rounded-lg flex items-center gap-1 shadow-2xs active:scale-95 transition-all text-xs"
                  >
                    <span>View Scoreboard</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Delete confirmation alert */}
                {confirmDeleteId === game.id && (
                  <div className="bg-red-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-red-200 dark:border-rose-900 flex items-center justify-between text-xs animate-in fade-in duration-100">
                    <span className="font-bold text-red-800 dark:text-rose-300">Permanently delete this game record?</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2.5 py-1 bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 rounded font-bold hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDelete(game.id)}
                        className="px-2.5 py-1 bg-red-600 text-white rounded font-bold hover:bg-red-700 shadow-2xs"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filteredGames.length === 0 && (
            <div className="bg-white dark:bg-[#111827] rounded-2xl p-8 text-center text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800 space-y-2">
              <FileText className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="font-bold text-sm text-slate-600 dark:text-slate-400">No game sessions found</p>
              <p className="text-xs">Start a New Game on the home screen to build your table history!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
