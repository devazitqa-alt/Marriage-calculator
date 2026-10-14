import React, { useState, useMemo } from 'react';
import { 
  X, 
  Crown, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  Plus, 
  Minus, 
  Check, 
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Game, GamePlayer, Round, RoundInput } from '../types/marriage';
import { calculateRound, validateRoundInputs } from '../engine/marriageEngine';
import { SoundEffects } from '../utils/audio';

interface RoundEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: Game;
  onSaveRound: (round: Round) => void;
  editingRound?: Round | null;
}

export const RoundEntryModal: React.FC<RoundEntryModalProps> = ({
  isOpen,
  onClose,
  game,
  onSaveRound,
  editingRound,
}) => {
  if (!isOpen) return null;

  const activePlayers = game.players.filter((p) => !p.isSittingOut);

  // Initialize input state from editingRound or fresh defaults
  const [inputs, setInputs] = useState<RoundInput[]>(() => {
    if (editingRound) {
      return game.players.map((p) => {
        const existing = editingRound.inputs.find((i) => i.gamePlayerId === p.id);
        if (existing) return { ...existing };
        return {
          gamePlayerId: p.id,
          maal: 0,
          seenStatus: 'unseen',
          isWinner: false,
          isDublee: false,
          isFoul: false,
        };
      });
    }

    // Default: first active player marked winner, others seen with 0 maal
    return game.players.map((p, idx) => ({
      gamePlayerId: p.id,
      maal: 0,
      seenStatus: idx === 0 ? 'seen' : 'seen',
      isWinner: idx === 0,
      isDublee: false,
      isFoul: false,
    }));
  });

  const [showFormulaDetails, setShowFormulaDetails] = useState(false);
  const [selectedPlayerForKeypad, setSelectedPlayerForKeypad] = useState<string>(activePlayers[0]?.id || '');

  // Calculate live preview
  const liveCalculation = useMemo(() => {
    const tempRoundId = editingRound ? editingRound.id : `r-temp-${Date.now()}`;
    return calculateRound(tempRoundId, inputs, game.players, game.rulesProfile, game.pointRate);
  }, [inputs, game]);

  const validation = useMemo(() => {
    return validateRoundInputs(inputs, game.players);
  }, [inputs, game.players]);

  const updatePlayerInput = (gamePlayerId: string, updater: (prev: RoundInput) => RoundInput) => {
    setInputs((prev) =>
      prev.map((item) => (item.gamePlayerId === gamePlayerId ? updater(item) : item))
    );
  };

  const setWinner = (gamePlayerId: string) => {
    SoundEffects.playCardSlide();
    setInputs((prev) =>
      prev.map((item) => {
        if (item.gamePlayerId === gamePlayerId) {
          return {
            ...item,
            isWinner: true,
            seenStatus: 'seen', // Winner must be seen
          };
        }
        return {
          ...item,
          isWinner: false,
          isDublee: false,
        };
      })
    );
  };

  const toggleSeen = (gamePlayerId: string) => {
    SoundEffects.playClick();
    updatePlayerInput(gamePlayerId, (prev) => {
      // If winner, cannot be unseen
      if (prev.isWinner) return prev;
      const nextStatus = prev.seenStatus === 'seen' ? 'unseen' : 'seen';
      return {
        ...prev,
        seenStatus: nextStatus,
      };
    });
  };

  const adjustMaal = (gamePlayerId: string, delta: number) => {
    SoundEffects.playClick();
    updatePlayerInput(gamePlayerId, (prev) => {
      const nextVal = Math.max(0, (prev.maal || 0) + delta);
      return { ...prev, maal: nextVal };
    });
  };

  const setMaalExact = (gamePlayerId: string, val: number) => {
    SoundEffects.playClick();
    updatePlayerInput(gamePlayerId, (prev) => ({
      ...prev,
      maal: Math.max(0, val),
    }));
  };

  const handleSave = () => {
    if (!validation.valid) return;

    SoundEffects.playWin();
    const roundNumber = editingRound ? editingRound.roundNumber : game.rounds.length + 1;
    const winner = inputs.find((i) => i.isWinner);

    const savedRound: Round = {
      id: editingRound ? editingRound.id : `round-${Date.now()}`,
      gameId: game.id,
      roundNumber,
      createdAt: editingRound ? editingRound.createdAt : new Date().toISOString(),
      savedAt: new Date().toISOString(),
      winnerGamePlayerId: winner ? winner.gamePlayerId : null,
      inputs,
      ledger: liveCalculation.ledger,
      netPoints: liveCalculation.netPoints,
      netMoney: liveCalculation.netMoney,
      calculationNotes: [
        `Conservation: ${liveCalculation.isConserved ? 'Verified (Sum = 0)' : 'Warning (Imbalance)'}`,
        `Winner: ${game.players.find((p) => p.id === winner?.gamePlayerId)?.displayName || 'None'}`,
      ],
    };

    onSaveRound(savedRound);
  };

  const winnerInput = inputs.find((i) => i.isWinner);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[95vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-rose-600 px-4 py-3 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base">🎴</span>
              <h3 className="font-extrabold text-sm sm:text-base tracking-tight">
                {editingRound ? `Edit Round #${editingRound.roundNumber}` : `Record Round #${game.rounds.length + 1}`}
              </h3>
              <span className="text-[10px] bg-red-800/80 px-2 py-0.5 rounded-full font-bold">
                {game.rulesProfile.name}
              </span>
            </div>
            <p className="text-[11px] text-red-100">Enter Maal, select Winner & Seen/Unseen status</p>
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

        {/* Validation Errors banner */}
        {!validation.valid && (
          <div className="bg-amber-50 px-4 py-2 border-b border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <div className="space-y-0.5">
              {validation.errors.map((err, i) => (
                <div key={i}>{err}</div>
              ))}
            </div>
          </div>
        )}

        {/* Player Input Rows */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-2.5 flex-1 text-xs">
          {game.players.map((player) => {
            if (player.isSittingOut) {
              return (
                <div
                  key={player.id}
                  className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 opacity-60 flex items-center justify-between text-slate-500"
                >
                  <span className="font-bold">{player.displayName}</span>
                  <span className="text-[10px] italic">Sitting out (No scoring)</span>
                </div>
              );
            }

            const input = inputs.find((i) => i.gamePlayerId === player.id) || {
              gamePlayerId: player.id,
              maal: 0,
              seenStatus: 'seen',
              isWinner: false,
              isDublee: false,
              isFoul: false,
            };

            const isWinner = input.isWinner;
            const isSeen = input.seenStatus === 'seen';
            const netPts = liveCalculation.netPoints[player.id] || 0;
            const netCash = liveCalculation.netMoney[player.id] || 0;

            return (
              <div
                key={player.id}
                onClick={() => setSelectedPlayerForKeypad(player.id)}
                className={`p-3 rounded-xl border transition-all ${
                  isWinner
                    ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/50 shadow-sm'
                    : selectedPlayerForKeypad === player.id
                    ? 'bg-red-50/30 border-red-300 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Top line: Player name, winner badge, seen toggle, live net */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    {/* Winner selector button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setWinner(player.id);
                      }}
                      className={`p-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition-all ${
                        isWinner
                          ? 'bg-amber-500 text-slate-900 shadow-sm ring-1 ring-amber-600'
                          : 'bg-slate-100 text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                      }`}
                      title="Declare this player as round winner"
                    >
                      <Crown className={`w-4 h-4 ${isWinner ? 'fill-current' : ''}`} />
                      <span className="text-[10px] hidden xs:inline">{isWinner ? 'WINNER' : 'Win'}</span>
                    </button>

                    <span className="font-extrabold text-slate-900 text-xs sm:text-sm truncate max-w-[120px]">
                      {player.displayName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Seen / Unseen Toggle */}
                    <button
                      type="button"
                      disabled={isWinner}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSeen(player.id);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors ${
                        isSeen
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-200 text-slate-700 border border-slate-300'
                      } ${isWinner ? 'opacity-80 cursor-default' : 'hover:opacity-90 active:scale-95'}`}
                    >
                      {isSeen ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{isSeen ? 'SEEN' : 'UNSEEN'}</span>
                    </button>

                    {/* Live preview points badge */}
                    <div
                      className={`font-mono-numbers font-black px-2 py-0.5 rounded text-xs text-right min-w-[50px] ${
                        netPts > 0
                          ? 'bg-emerald-100 text-emerald-800'
                          : netPts < 0
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {netPts > 0 ? `+${netPts}` : netPts}
                      {game.pointRate > 0 && (
                        <div className="text-[9px] font-normal leading-none opacity-80">
                          {game.currency} {netCash > 0 ? `+${netCash}` : netCash}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom line: Maal Stepper and Modifiers */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-500">Maal:</span>
                    <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          adjustMaal(player.id, -1);
                        }}
                        className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-white rounded active:scale-95 transition-all"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={input.maal}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setMaalExact(player.id, val);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-10 text-center font-mono-numbers font-extrabold text-sm bg-transparent focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          adjustMaal(player.id, 1);
                        }}
                        className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-white rounded active:scale-95 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Quick increment pills */}
                    <div className="flex gap-1">
                      {[2, 3, 5, 10].map((step) => (
                        <button
                          key={step}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            adjustMaal(player.id, step);
                          }}
                          className="px-1.5 py-1 text-[10px] font-bold bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 rounded border border-slate-200 transition-colors"
                        >
                          +{step}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMaalExact(player.id, 0);
                        }}
                        className="px-1.5 py-1 text-[10px] font-medium text-slate-400 hover:text-slate-600"
                      >
                        0
                      </button>
                    </div>
                  </div>

                  {/* Modifiers: Dublee (winner only) or Foul */}
                  <div className="flex items-center gap-2">
                    {isWinner && (
                      <label
                        className="flex items-center gap-1 cursor-pointer bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={input.isDublee}
                          onChange={(e) => {
                            SoundEffects.playClick();
                            updatePlayerInput(player.id, (prev) => ({
                              ...prev,
                              isDublee: e.target.checked,
                            }));
                          }}
                          className="rounded text-amber-600"
                        />
                        <span>Dublee ({game.rulesProfile.dubleeMultiplier}x)</span>
                      </label>
                    )}

                    <label
                      className={`flex items-center gap-1 cursor-pointer px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                        input.isFoul
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : 'text-slate-400 border-transparent hover:text-slate-600'
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={input.isFoul}
                        onChange={(e) => {
                          SoundEffects.playClick();
                          updatePlayerInput(player.id, (prev) => ({
                            ...prev,
                            isFoul: e.target.checked,
                          }));
                        }}
                        className="rounded text-rose-600"
                      />
                      <span>Foul / Misdeal</span>
                    </label>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Quick Hand Maal Combination Shortcuts */}
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-600">
              <span className="font-bold flex items-center gap-1">
                <span>🃏</span> Quick Nepali Maal Shortcuts (Adds to selected):
              </span>
              <span className="font-medium text-slate-900 truncate max-w-[120px]">
                {game.players.find((p) => p.id === selectedPlayerForKeypad)?.displayName || 'Select player'}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'Tiplu', maal: 3, desc: 'Main Super Joker (+3)' },
                { label: 'Poplu', maal: 2, desc: 'Next Joker (+2)' },
                { label: 'Jhar', maal: 2, desc: 'Prev Joker (+2)' },
                { label: 'Alter', maal: 5, desc: 'Opposite Suit (+5)' },
                { label: 'Tunnel', maal: 5, desc: '3 of same (+5)' },
                { label: 'Marriage Run', maal: 10, desc: 'K-Q-Tiplu (+10)' },
              ].map((combo) => (
                <button
                  key={combo.label}
                  type="button"
                  onClick={() => {
                    if (selectedPlayerForKeypad) {
                      adjustMaal(selectedPlayerForKeypad, combo.maal);
                    }
                  }}
                  className="px-2 py-1 bg-white hover:bg-red-50 hover:border-red-300 active:scale-95 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-800 transition-all shadow-2xs"
                  title={combo.desc}
                >
                  {combo.label} <span className="text-red-600">+{combo.maal}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Audit / Formula Explainer toggle */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowFormulaDetails(!showFormulaDetails)}
              className="w-full px-3 py-2 flex items-center justify-between text-[11px] font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-600" />
                Live Arithmetic Audit & Ledger Preview ({liveCalculation.ledger.length} transfers)
              </span>
              {showFormulaDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showFormulaDetails && (
              <div className="p-3 pt-0 border-t border-slate-200/60 space-y-2 text-[11px] text-slate-600 max-h-48 overflow-y-auto">
                <div className="font-semibold text-slate-800">Transfer breakdown for this round:</div>
                {liveCalculation.ledger.length === 0 ? (
                  <p className="italic text-slate-400">No transfers generated yet.</p>
                ) : (
                  <div className="space-y-1">
                    {liveCalculation.ledger.map((tx) => {
                      const payer = game.players.find((p) => p.id === tx.payerId)?.displayName;
                      const receiver = game.players.find((p) => p.id === tx.receiverId)?.displayName;
                      return (
                        <div key={tx.id} className="flex items-center justify-between bg-white p-1.5 rounded border border-slate-200">
                          <div>
                            <span className="font-bold text-slate-800">{payer}</span>
                            <span className="text-slate-400 mx-1">➔</span>
                            <span className="font-bold text-emerald-700">{receiver}</span>
                            <div className="text-[10px] text-slate-500">{tx.reasonDescription}</div>
                          </div>
                          <span className="font-mono-numbers font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                            {tx.amount} pts
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer with Conservation status and Save button */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                liveCalculation.isConserved ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
            <span className="text-[11px] font-semibold text-slate-600">
              {liveCalculation.isConserved ? 'Zero-Sum Conserved' : 'Sum Mismatch'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                SoundEffects.playClick();
                onClose();
              }}
              className="px-3 py-1.5 text-slate-600 font-bold hover:bg-slate-200 rounded-lg text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!validation.valid}
              onClick={handleSave}
              className={`px-5 py-2 font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all ${
                validation.valid
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 text-white shadow-red-600/20 active:scale-95'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{editingRound ? 'Update Round' : 'Save Round'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
