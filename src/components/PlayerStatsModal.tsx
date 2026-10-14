import React, { useState, useMemo } from 'react';
import { X, Users, Award, Trophy, Plus, Trash2, ArrowUpRight, TrendingUp } from 'lucide-react';
import { Game, Player, PlayerGroup } from '../types/marriage';
import { StorageService } from '../services/storageService';
import { SoundEffects } from '../utils/audio';

interface PlayerStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  games: Game[];
  players: Player[];
  groups: PlayerGroup[];
  onDataChanged: () => void;
}

export const PlayerStatsModal: React.FC<PlayerStatsModalProps> = ({
  isOpen,
  onClose,
  games,
  players,
  groups,
  onDataChanged,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'stats' | 'groups' | 'players'>('stats');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedGroupPlayerIds, setSelectedGroupPlayerIds] = useState<string[]>([]);

  // Compute lifetime metrics per player across all games
  const lifetimeStats = useMemo(() => {
    return players.map((player) => {
      let gamesPlayed = 0;
      let totalRoundsPlayed = 0;
      let roundsWon = 0;
      let lifetimeNetPoints = 0;
      let lifetimeNetMoney = 0;
      let bestRoundPoints = -Infinity;

      games.forEach((g) => {
        const gamePlayer = g.players.find(
          (gp) => gp.playerId === player.id || gp.displayName.toLowerCase() === player.displayName.toLowerCase()
        );
        if (gamePlayer) {
          gamesPlayed++;
          g.rounds.forEach((r) => {
            totalRoundsPlayed++;
            const pts = r.netPoints[gamePlayer.id] || 0;
            const money = r.netMoney[gamePlayer.id] || 0;
            lifetimeNetPoints += pts;
            lifetimeNetMoney += money;
            if (pts > bestRoundPoints) {
              bestRoundPoints = pts;
            }
            if (r.winnerGamePlayerId === gamePlayer.id) {
              roundsWon++;
            }
          });
        }
      });

      return {
        player,
        gamesPlayed,
        totalRoundsPlayed,
        roundsWon,
        winRate: totalRoundsPlayed > 0 ? Math.round((roundsWon / totalRoundsPlayed) * 100) : 0,
        lifetimeNetPoints,
        lifetimeNetMoney: Math.round(lifetimeNetMoney * 100) / 100,
        bestRoundPoints: bestRoundPoints === -Infinity ? 0 : bestRoundPoints,
      };
    }).sort((a, b) => b.lifetimeNetPoints - a.lifetimeNetPoints);
  }, [players, games]);

  const handleAddPlayer = () => {
    if (!newPlayerName.trim()) return;
    SoundEffects.playClick();
    StorageService.addPlayer(newPlayerName.trim());
    setNewPlayerName('');
    onDataChanged();
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim() || selectedGroupPlayerIds.length < 2) return;
    SoundEffects.playCardSlide();

    const newGroup: PlayerGroup = {
      id: `group-${Date.now()}`,
      name: newGroupName.trim(),
      playerIds: selectedGroupPlayerIds,
      createdAt: new Date().toISOString(),
    };

    const currentGroups = StorageService.getGroups();
    StorageService.saveGroups([...currentGroups, newGroup]);
    setNewGroupName('');
    setSelectedGroupPlayerIds([]);
    onDataChanged();
  };

  const handleDeleteGroup = (id: string) => {
    SoundEffects.playClick();
    const updated = groups.filter((g) => g.id !== id);
    StorageService.saveGroups(updated);
    onDataChanged();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-rose-600 px-5 py-3.5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-300" />
            <div>
              <h3 className="font-extrabold text-sm sm:text-base tracking-tight">Player Stats & Roster</h3>
              <p className="text-[11px] text-red-100">Lifetime Leaderboard & Saved Table Circles</p>
            </div>
          </div>
          <button
            onClick={() => {
              SoundEffects.playClick();
              onClose();
            }}
            className="p-1 rounded-lg hover:bg-white/20 active:scale-95 transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-600">
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${
              activeTab === 'stats' ? 'border-red-600 text-red-600 bg-white' : 'border-transparent'
            }`}
          >
            Lifetime Stats
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${
              activeTab === 'groups' ? 'border-red-600 text-red-600 bg-white' : 'border-transparent'
            }`}
          >
            Saved Groups ({groups.length})
          </button>
          <button
            onClick={() => setActiveTab('players')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${
              activeTab === 'players' ? 'border-red-600 text-red-600 bg-white' : 'border-transparent'
            }`}
          >
            Player Roster ({players.length})
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {activeTab === 'stats' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-slate-500">
                <span className="font-semibold">All-Time Standings</span>
                <span className="text-[10px]">{games.length} games analyzed</span>
              </div>

              <div className="space-y-2">
                {lifetimeStats.map((stat, idx) => (
                  <div
                    key={stat.player.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-5 h-5 rounded-full font-bold text-[10px] flex items-center justify-center ${
                            idx === 0
                              ? 'bg-amber-400 text-slate-900'
                              : idx === 1
                              ? 'bg-slate-300 text-slate-800'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                          {stat.player.displayName}
                        </span>
                      </div>

                      <div className="text-right">
                        <span
                          className={`font-mono-numbers font-black text-xs sm:text-sm ${
                            stat.lifetimeNetPoints > 0
                              ? 'text-emerald-700'
                              : stat.lifetimeNetPoints < 0
                              ? 'text-rose-600'
                              : 'text-slate-600'
                          }`}
                        >
                          {stat.lifetimeNetPoints > 0 ? `+${stat.lifetimeNetPoints}` : stat.lifetimeNetPoints} pts
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-slate-200/60 text-[10px] text-slate-600">
                      <div className="bg-white p-1 rounded border border-slate-200/80">
                        Games: <strong>{stat.gamesPlayed}</strong>
                      </div>
                      <div className="bg-white p-1 rounded border border-slate-200/80">
                        Win Rate: <strong>{stat.winRate}%</strong> ({stat.roundsWon} wins)
                      </div>
                      <div className="bg-white p-1 rounded border border-slate-200/80">
                        Best Round: <strong>+{stat.bestRoundPoints} pts</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'groups' && (
            <div className="space-y-4">
              {/* Existing groups */}
              <div className="space-y-2">
                {groups.map((group) => {
                  const memberNames = group.playerIds
                    .map((id) => players.find((p) => p.id === id)?.displayName)
                    .filter(Boolean);

                  return (
                    <div
                      key={group.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-xs">{group.name}</h4>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {memberNames.join(', ')} ({group.playerIds.length} players)
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteGroup(group.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Create new group */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                <h4 className="font-bold text-slate-800 text-xs">Create New Table Circle</h4>
                <input
                  type="text"
                  placeholder="Group name (e.g. Festival Regulars)..."
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                />

                <div>
                  <span className="block text-[11px] text-slate-500 mb-1">Select members (at least 2):</span>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                    {players.map((p) => {
                      const isSelected = selectedGroupPlayerIds.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedGroupPlayerIds(selectedGroupPlayerIds.filter((id) => id !== p.id));
                            } else {
                              setSelectedGroupPlayerIds([...selectedGroupPlayerIds, p.id]);
                            }
                          }}
                          className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                            isSelected
                              ? 'bg-red-600 text-white border-red-600 shadow-2xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {p.displayName}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!newGroupName.trim() || selectedGroupPlayerIds.length < 2}
                  onClick={handleCreateGroup}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-40 text-white font-bold rounded-lg text-xs transition-colors"
                >
                  Save Table Circle
                </button>
              </div>
            </div>
          )}

          {activeTab === 'players' && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="New player name..."
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
                  className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddPlayer}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs"
                >
                  Add
                </button>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                {players.map((p) => (
                  <div key={p.id} className="p-2.5 bg-white flex items-center justify-between">
                    <span className="font-bold text-slate-800">{p.displayName}</span>
                    <span className="text-[10px] text-slate-400">
                      Added {new Date(p.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={() => {
              SoundEffects.playClick();
              onClose();
            }}
            className="px-4 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
