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
    <div className="min-h-[calc(100vh-50px)] bg-slate-100 py-4 px-3 sm:px-6">
      <div className="max-w-3xl w-full mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                SoundEffects.playClick();
                onBack();
              }}
              className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="font-extrabold text-base text-slate-900">Old Game Logs & Scorecards</h2>
              <p className="text-[11px] text-slate-500">{games.length} total sessions recorded</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by game title or player name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-2xs"
            />
          </div>

          <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs text-xs font-bold">
            {(['all', 'active', 'completed'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg capitalize transition-colors ${
                  statusFilter === st ? 'bg-red-600 text-white' : 'text-slate-600 hover:bg-slate-100'
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
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:border-slate-300 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-sm text-slate-900">{game.title}</h3>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          game.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {game.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
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
                    <span className="text-[10px] text-slate-400 block">Leader / Winner</span>
                    <span className="font-extrabold text-xs text-amber-600 flex items-center justify-end gap-1">
                      <Trophy className="w-3.5 h-3.5" />
                      {leaderName} ({highestPts > 0 ? `+${highestPts}` : highestPts})
                    </span>
                  </div>
                </div>

                {/* Player tags */}
                <div className="flex flex-wrap items-center gap-1 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl">
                  <span className="font-bold text-slate-400 mr-1 flex items-center gap-0.5">
                    <Users className="w-3 h-3" /> Roster:
                  </span>
                  {game.players.map((p) => (
                    <span key={p.id} className="bg-white px-2 py-0.5 rounded-md border border-slate-200 font-medium">
                      {p.displayName}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownloadCSV(game)}
                      className="px-2.5 py-1 text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1 hover:bg-slate-100 rounded-lg transition-colors text-[11px]"
                    >
                      <Download className="w-3.5 h-3.5" /> CSV
                    </button>
                    <button
                      onClick={() => onRematchGame(game)}
                      className="px-2.5 py-1 text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1 hover:bg-slate-100 rounded-lg transition-colors text-[11px]"
                      title="Start a new game reusing this table setup"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Rematch Table
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(game.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      title="Delete game record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      SoundEffects.playClick();
                      onOpenGame(game);
                    }}
                    className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-lg flex items-center gap-1 shadow-2xs active:scale-95 transition-all text-xs"
                  >
                    <span>Open Scoreboard</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredGames.length === 0 && (
            <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-bold text-slate-700">No game logs found.</p>
              <p className="text-xs text-slate-400">Try adjusting your search query or start a new game.</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-3 text-xs shadow-xl">
            <h3 className="font-extrabold text-sm text-slate-900">Delete Game Record?</h3>
            <p className="text-slate-600">
              This action permanently deletes this game and its round logs. This cannot be undone.
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-3 py-1.5 text-slate-600 font-bold hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="px-4 py-1.5 bg-rose-600 text-white font-bold rounded-lg shadow-sm"
              >
                Delete Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
