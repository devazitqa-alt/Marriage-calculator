import React, { useState } from 'react';
import { Spade, Plus, Trophy, RotateCcw, Check, ArrowLeft, History } from 'lucide-react';
import { CallbreakGame } from '../types/marriage';
import { addCallbreakRound, createNewCallbreakGame } from '../engine/callbreakEngine';
import { StorageService } from '../services/storageService';
import { SoundEffects } from '../utils/audio';

interface CallbreakScreenProps {
  onBack: () => void;
}

export const CallbreakScreen: React.FC<CallbreakScreenProps> = ({ onBack }) => {
  const [games, setGames] = useState<CallbreakGame[]>(() => StorageService.getCallbreakGames());
  const [activeGame, setActiveGame] = useState<CallbreakGame | null>(() => {
    const list = StorageService.getCallbreakGames();
    return list.find((g) => g.status === 'active') || null;
  });

  // Setup modal state
  const [showNewGame, setShowNewGame] = useState(!activeGame);
  const [playerNames, setPlayerNames] = useState<string[]>(['Aarav', 'Bina', 'Chirag', 'Deepak']);

  // Round input state
  const [showRoundModal, setShowRoundModal] = useState(false);
  const [bids, setBids] = useState<Record<string, number>>({});
  const [tricks, setTricks] = useState<Record<string, number>>({});

  const handleStartNewGame = () => {
    SoundEffects.playCardSlide();
    const newG = createNewCallbreakGame(playerNames);
    StorageService.saveCallbreakGame(newG);
    setGames(StorageService.getCallbreakGames());
    setActiveGame(newG);
    setShowNewGame(false);
  };

  const handleOpenRoundEntry = () => {
    if (!activeGame) return;
    SoundEffects.playClick();
    const defaultBids: Record<string, number> = {};
    const defaultTricks: Record<string, number> = {};
    activeGame.players.forEach((p) => {
      defaultBids[p.id] = 2;
      defaultTricks[p.id] = 2;
    });
    setBids(defaultBids);
    setTricks(defaultTricks);
    setShowRoundModal(true);
  };

  const handleSaveRound = () => {
    if (!activeGame) return;
    SoundEffects.playWin();
    const updated = addCallbreakRound(activeGame, bids, tricks);
    StorageService.saveCallbreakGame(updated);
    setActiveGame(updated);
    setGames(StorageService.getCallbreakGames());
    setShowRoundModal(false);
  };

  // Cumulative scores calculation
  const playerTotals = React.useMemo(() => {
    if (!activeGame) return [];
    return activeGame.players.map((p) => {
      let total = 0;
      activeGame.rounds.forEach((r) => {
        total += r.scores[p.id] || 0;
      });
      return {
        id: p.id,
        name: p.name,
        total: Math.round(total * 10) / 10,
      };
    }).sort((a, b) => b.total - a.total);
  }, [activeGame]);

  return (
    <div className="min-h-[calc(100vh-50px)] bg-slate-900 text-white flex flex-col justify-between py-4 px-3 sm:px-6">
      <div className="max-w-2xl w-full mx-auto space-y-4">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                SoundEffects.playClick();
                onBack();
              }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="font-extrabold text-base flex items-center gap-1.5 text-white">
                <Spade className="w-4 h-4 text-amber-400" /> Callbreak Calculator
              </h2>
              <p className="text-[11px] text-slate-400">Standard 5 Rounds • 4 Players</p>
            </div>
          </div>

          <button
            onClick={() => {
              SoundEffects.playClick();
              setShowNewGame(true);
            }}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> New Callbreak
          </button>
        </div>

        {activeGame ? (
          <div className="space-y-4">
            {/* Status card */}
            <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700/80 shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-extrabold text-sm text-white">{activeGame.title}</h3>
                  <p className="text-xs text-slate-400">
                    Round {activeGame.rounds.length} of 5{' '}
                    {activeGame.status === 'completed' && '• Completed!'}
                  </p>
                </div>
                {activeGame.status === 'completed' && (
                  <span className="bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded text-xs font-bold border border-amber-400/30">
                    🏆 Finished
                  </span>
                )}
              </div>

              {/* Standings */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {playerTotals.map((pt, idx) => (
                  <div
                    key={pt.id}
                    className={`p-2.5 rounded-xl border ${
                      idx === 0
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-200'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {idx === 0 ? '👑 1st' : `${idx + 1}th`}
                    </div>
                    <div className="font-extrabold text-xs truncate mt-0.5">{pt.name}</div>
                    <div className="font-mono-numbers font-black text-sm text-white mt-1">
                      {pt.total > 0 ? `+${pt.total}` : pt.total}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scorecard Table */}
            <div className="bg-slate-800/80 rounded-2xl border border-slate-700/80 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/60 text-slate-400 font-bold border-b border-slate-700">
                    <tr>
                      <th className="py-2.5 px-3">Round</th>
                      {activeGame.players.map((p) => (
                        <th key={p.id} className="py-2.5 px-2 text-center min-w-[70px]">
                          {p.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {activeGame.rounds.map((r) => (
                      <tr key={r.roundNumber} className="hover:bg-slate-700/30">
                        <td className="py-2 px-3 font-bold text-slate-400">R{r.roundNumber}</td>
                        {activeGame.players.map((p) => {
                          const score = r.scores[p.id] || 0;
                          const bid = r.bids[p.id];
                          const trick = r.tricks[p.id];
                          return (
                            <td key={p.id} className="py-2 px-2 text-center font-mono-numbers">
                              <span
                                className={`font-bold ${
                                  score > 0 ? 'text-emerald-400' : 'text-rose-400'
                                }`}
                              >
                                {score > 0 ? `+${score}` : score}
                              </span>
                              <div className="text-[10px] text-slate-500">
                                {trick}/{bid}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {activeGame.rounds.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400">
                  No rounds recorded yet. Record Round 1 bids and tricks!
                </div>
              )}
            </div>

            {/* Action button */}
            {activeGame.status === 'active' && activeGame.rounds.length < 5 && (
              <button
                onClick={handleOpenRoundEntry}
                className="w-full py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 text-white rounded-xl font-extrabold text-sm shadow-lg shadow-red-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>RECORD CALLBREAK ROUND #{activeGame.rounds.length + 1}</span>
              </button>
            )}
          </div>
        ) : (
          <div className="py-16 text-center text-slate-400">
            <Spade className="w-12 h-12 mx-auto text-slate-600 mb-2" />
            <p className="font-bold">No active Callbreak session.</p>
            <button
              onClick={() => setShowNewGame(true)}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold"
            >
              Start New Callbreak Game
            </button>
          </div>
        )}
      </div>

      {/* New Callbreak Modal */}
      {showNewGame && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-sm w-full p-5 space-y-4 text-xs">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
              <Spade className="w-4 h-4 text-amber-400" /> 4 Players for Callbreak
            </h3>
            <div className="space-y-2">
              {playerNames.map((name, i) => (
                <input
                  key={i}
                  type="text"
                  value={name}
                  onChange={(e) => {
                    const arr = [...playerNames];
                    arr[i] = e.target.value;
                    setPlayerNames(arr);
                  }}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-medium focus:ring-1 focus:ring-red-500"
                  placeholder={`Player ${i + 1}`}
                />
              ))}
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setShowNewGame(false)}
                className="px-3 py-1.5 text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleStartNewGame}
                className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg"
              >
                Start Callbreak
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Round Entry Modal */}
      {showRoundModal && activeGame && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-5 space-y-4 text-xs">
            <h3 className="font-extrabold text-sm text-white">
              Round #{activeGame.rounds.length + 1} — Bids & Tricks
            </h3>
            <div className="space-y-3">
              {activeGame.players.map((p) => (
                <div key={p.id} className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{p.name}</span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-400">Bid:</span>
                      <select
                        value={bids[p.id] || 2}
                        onChange={(e) => setBids({ ...bids, [p.id]: parseInt(e.target.value) })}
                        className="bg-slate-800 text-white rounded px-2 py-1 font-bold border border-slate-700"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((v) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-400">Won:</span>
                      <select
                        value={tricks[p.id] || 2}
                        onChange={(e) => setTricks({ ...tricks, [p.id]: parseInt(e.target.value) })}
                        className="bg-slate-800 text-white rounded px-2 py-1 font-bold border border-slate-700"
                      >
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((v) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setShowRoundModal(false)}
                className="px-3 py-1.5 text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRound}
                className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg shadow-md"
              >
                Save Round
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
