import React, { useState, useMemo } from 'react';
import { 
  Edit3, 
  Share2, 
  UserPlus, 
  ArrowLeftRight, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  EyeOff, 
  Crown, 
  Hourglass, 
  Flag, 
  Layers,
  X,
  Plus
} from 'lucide-react';
import { Game, GamePlayer, Round, RoundInput } from '../types/marriage';
import { StorageService } from '../services/storageService';
import { SoundEffects } from '../utils/audio';

interface LiveScoreboardProps {
  game: Game;
  onAddRound: () => void;
  onUndoLastRound: () => void;
  onViewAuditRound: (round: Round) => void;
  onEndGame: () => void;
  onShareGame: () => void;
  onOpenRules: () => void;
  onOpenTransfer?: () => void;
  onGameUpdated?: (game: Game) => void;
}

export const LiveScoreboard: React.FC<LiveScoreboardProps> = ({
  game,
  onAddRound,
  onUndoLastRound,
  onViewAuditRound,
  onEndGame,
  onShareGame,
  onOpenRules,
  onOpenTransfer,
  onGameUpdated,
}) => {
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');

  // Latest round (or dummy if 0 rounds)
  const latestRound = useMemo(() => {
    if (game.rounds.length === 0) return null;
    return game.rounds[game.rounds.length - 1];
  }, [game.rounds]);

  // Calculate total maal in latest round
  const latestRoundTotalMaal = useMemo(() => {
    if (!latestRound) return 0;
    return latestRound.inputs.reduce((sum, inp) => sum + (inp.maal || 0), 0);
  }, [latestRound]);

  // Cumulative player totals across all rounds
  const playerCumulativeTotals = useMemo(() => {
    return game.players.map((player) => {
      let totalPoints = 0;
      let totalMoney = 0;

      game.rounds.forEach((round) => {
        totalPoints += round.netPoints[player.id] || 0;
        totalMoney += round.netMoney[player.id] || 0;
      });

      return {
        playerId: player.id,
        displayName: player.displayName,
        totalPoints,
        totalMoney: Math.round(totalMoney * 100) / 100,
      };
    });
  }, [game]);

  // Helper to determine status icon for a round input
  const renderStatusBadge = (input?: RoundInput, isSittingOut?: boolean) => {
    if (isSittingOut) {
      return (
        <span className="text-slate-600 dark:text-slate-400 text-[11px] font-bold ml-0.5 inline-block" title="Sitting Out">
          ⏳
        </span>
      );
    }
    if (!input) return null;

    if (input.isWinner) {
      return (
        <span className="text-amber-500 text-[12px] font-bold ml-0.5 inline-block drop-shadow-xs" title="Winner">
          👑
        </span>
      );
    }
    if (input.isDublee) {
      return (
        <span className="text-indigo-600 dark:text-indigo-400 text-[11px] font-bold ml-0.5 inline-block" title="Dublee / Cards">
          🎴
        </span>
      );
    }
    if (input.isFoul) {
      return (
        <span className="text-red-600 dark:text-rose-400 text-[11px] font-bold ml-0.5 inline-block" title="Foul / Flag">
          🚩
        </span>
      );
    }
    if (input.seenStatus === 'unseen') {
      return (
        <span className="text-slate-700 dark:text-slate-400 text-[11px] font-bold ml-0.5 inline-block" title="Unseen / Blind">
          👁️‍🗨️
        </span>
      );
    }
    if (input.seenStatus === 'seen') {
      return (
        <span className="text-emerald-700 dark:text-emerald-400 text-[10px] font-bold ml-0.5 inline-block" title="Seen">
          👁️
        </span>
      );
    }
    return null;
  };

  // Truncate player name nicely if needed (e.g. "Shyam" -> "Shya.")
  const formatHeaderName = (name: string) => {
    if (name.length > 5) {
      return name.slice(0, 4) + '.';
    }
    return name;
  };

  const handleAddNewPlayer = () => {
    if (!newPlayerName.trim()) return;
    SoundEffects.playClick();

    const newGamePlayer: GamePlayer = {
      id: `gp-${Date.now()}`,
      playerId: `p-${Date.now()}`,
      displayName: newPlayerName.trim(),
      seatOrder: game.players.length,
      isSittingOut: false,
    };

    const updatedGame: Game = {
      ...game,
      players: [...game.players, newGamePlayer],
    };

    StorageService.saveGame(updatedGame);
    if (onGameUpdated) onGameUpdated(updatedGame);
    setNewPlayerName('');
    setShowAddPlayerModal(false);
  };

  const handleToggleSittingOut = (playerId: string) => {
    SoundEffects.playClick();
    const updatedPlayers = game.players.map((p) =>
      p.id === playerId ? { ...p, isSittingOut: !p.isSittingOut } : p
    );
    const updatedGame: Game = {
      ...game,
      players: updatedPlayers,
    };
    StorageService.saveGame(updatedGame);
    if (onGameUpdated) onGameUpdated(updatedGame);
  };

  return (
    <div className="min-h-[calc(100vh-50px)] bg-[#f4f5f7] dark:bg-[#070b14] pb-24 text-slate-900 dark:text-slate-100 select-none transition-colors">
      <div className="max-w-md mx-auto p-3 space-y-3">
        {/* =========================================================================
            SECTION 1: CURRENT ROUND CARD (Round - X  |  Total Maal: Y)
           ========================================================================= */}
        <div className="bg-white dark:bg-[#111827] rounded-xl shadow-xs border border-slate-300 dark:border-slate-800 overflow-hidden transition-colors">
          {/* Red Header Bar */}
          <div className="bg-[#d32f2f] dark:bg-[#6b1419] text-white px-3 py-2 flex items-center justify-between font-serif">
            <span className="font-bold text-sm tracking-wide">
              Round - {latestRound ? latestRound.roundNumber : 1}
            </span>
            <span className="font-bold text-sm tracking-wide">
              Total Maal: {latestRoundTotalMaal}
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse text-xs">
              <thead>
                <tr className="bg-[#d32f2f] dark:bg-[#6b1419] text-white font-bold border-b border-red-700 dark:border-rose-900/60">
                  <th className="py-2 px-1 text-left pl-2.5 font-bold text-[11px] w-20 border-r border-red-700/60 dark:border-rose-900/50">
                    Names
                  </th>
                  {game.players.map((player) => (
                    <th
                      key={player.id}
                      className="py-2 px-1 font-bold text-xs border-r border-red-700/60 dark:border-rose-900/50 last:border-r-0 truncate max-w-[65px]"
                    >
                      {formatHeaderName(player.displayName)}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {/* Row 1: Maal with status badges */}
                <tr className="bg-white dark:bg-[#111827] hover:bg-slate-50/50 dark:hover:bg-[#1a253f]/50">
                  <td className="py-2.5 px-2 text-left font-medium text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800">
                    Maal
                  </td>
                  {game.players.map((player) => {
                    const input = latestRound?.inputs.find((i) => i.gamePlayerId === player.id);
                    const maalVal = input?.maal ?? 0;
                    const isWinner = input?.isWinner;
                    const isDublee = input?.isDublee;

                    return (
                      <td
                        key={player.id}
                        className="py-2.5 px-1 border-r border-slate-200 dark:border-slate-800 last:border-r-0 font-medium"
                      >
                        <div className="inline-flex items-center justify-center relative font-mono-numbers text-sm">
                          <span
                            className={
                              isDublee && maalVal > 0
                                ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                                : 'text-slate-800 dark:text-white'
                            }
                          >
                            {maalVal}
                          </span>
                          <span className="text-[11px] leading-none -mt-2.5 -mr-1">
                            {renderStatusBadge(input, player.isSittingOut)}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Row 2: Total Points (Green for positive, Red for negative) */}
                <tr className="bg-white dark:bg-[#111827] font-bold">
                  <td className="py-2.5 px-2 text-left text-slate-800 dark:text-white font-bold border-r border-slate-200 dark:border-slate-800 text-[11px] leading-tight">
                    <div>Total</div>
                    <div>Points</div>
                  </td>
                  {game.players.map((player) => {
                    const pts = latestRound?.netPoints[player.id] ?? 0;
                    const isPositive = pts > 0;
                    const isNegative = pts < 0;

                    return (
                      <td
                        key={player.id}
                        className="py-2.5 px-1 border-r border-slate-200 dark:border-slate-800 last:border-r-0 font-mono-numbers font-bold text-sm"
                      >
                        <span
                          className={
                            isPositive
                              ? 'text-emerald-700 dark:text-emerald-400 font-extrabold'
                              : isNegative
                              ? 'text-red-700 dark:text-rose-400 font-extrabold'
                              : 'text-slate-800 dark:text-slate-300'
                          }
                        >
                          {pts}
                        </span>
                      </td>
                    );
                  })}
                </tr>

                {/* Row 3: Total Amt (Light mint green row in light, deep emerald in dark) */}
                <tr className="bg-[#dcfce7] dark:bg-[#062c1b] font-bold border-t border-emerald-200 dark:border-emerald-800/80">
                  <td className="py-2 px-2 text-left text-slate-800 dark:text-emerald-200 font-bold border-r border-emerald-200/80 dark:border-emerald-800/60 text-[10px] leading-tight">
                    <div>{game.currency} {game.pointRate}/pt</div>
                    <div>Total Amt</div>
                  </td>
                  {game.players.map((player) => {
                    const amt = latestRound?.netMoney[player.id] ?? 0;
                    const isPositive = amt > 0;
                    const isNegative = amt < 0;

                    return (
                      <td
                        key={player.id}
                        className="py-2 px-1 border-r border-emerald-200/80 dark:border-emerald-800/60 last:border-r-0 font-mono-numbers font-bold text-sm"
                      >
                        <span
                          className={
                            isPositive
                              ? 'text-emerald-700 dark:text-emerald-300 font-extrabold'
                              : isNegative
                              ? 'text-red-700 dark:text-rose-300 font-extrabold'
                              : 'text-slate-800 dark:text-emerald-200'
                          }
                        >
                          {amt}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* =========================================================================
            SECTION 2: MIDDLE ACTION PILLS (Transfer Host | Add Player | Share Score)
           ========================================================================= */}
        <div className="grid grid-cols-3 gap-2">
          {/* Transfer Host */}
          <button
            type="button"
            onClick={() => {
              SoundEffects.playClick();
              if (onOpenTransfer) onOpenTransfer();
            }}
            className="py-2 px-2 bg-white hover:bg-red-50 dark:bg-[#111827] dark:hover:bg-[#1c2438] active:scale-95 text-[#d32f2f] dark:text-rose-300 border border-[#d32f2f] dark:border-rose-900/60 rounded-lg font-bold text-[11px] shadow-2xs flex items-center justify-center gap-1 transition-all"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span className="truncate">Transfer Host</span>
          </button>

          {/* Add Player */}
          <button
            type="button"
            onClick={() => {
              SoundEffects.playClick();
              setShowAddPlayerModal(true);
            }}
            className="py-2 px-2 bg-white hover:bg-red-50 dark:bg-[#111827] dark:hover:bg-[#1c2438] active:scale-95 text-[#d32f2f] dark:text-rose-300 border border-[#d32f2f] dark:border-rose-900/60 rounded-lg font-bold text-[11px] shadow-2xs flex items-center justify-center gap-1 transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span className="truncate">Add Player</span>
          </button>

          {/* Share Score */}
          <button
            type="button"
            onClick={() => {
              SoundEffects.playClick();
              onShareGame();
            }}
            className="py-2 px-2 bg-white hover:bg-red-50 dark:bg-[#111827] dark:hover:bg-[#1c2438] active:scale-95 text-[#d32f2f] dark:text-rose-300 border border-[#d32f2f] dark:border-rose-900/60 rounded-lg font-bold text-[11px] shadow-2xs flex items-center justify-center gap-1 transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="truncate">Share Score</span>
          </button>
        </div>

        {/* =========================================================================
            SECTION 3: ALL GAMES CARD (Complete Score History Table)
           ========================================================================= */}
        <div className="bg-white dark:bg-[#111827] rounded-xl shadow-xs border border-slate-300 dark:border-slate-800 overflow-hidden transition-colors">
          {/* Red Header Bar */}
          <div className="bg-[#d32f2f] dark:bg-[#6b1419] text-white px-3 py-2 flex items-center justify-between font-serif">
            <span className="font-bold text-sm tracking-wide">All Games</span>
            <span className="font-bold text-xs flex items-center gap-1 opacity-95">
              <span>🔪</span>
              <span>{game.rulesProfile.name}</span>
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse text-xs">
              <thead>
                <tr className="bg-[#d32f2f] dark:bg-[#6b1419] text-white font-bold border-b border-red-700 dark:border-rose-900/60">
                  <th className="py-2 px-1 text-left pl-2.5 font-bold text-[11px] w-16 border-r border-red-700/60 dark:border-rose-900/50">
                    Round
                  </th>
                  {game.players.map((player) => (
                    <th
                      key={player.id}
                      className="py-2 px-1 font-bold text-xs border-r border-red-700/60 dark:border-rose-900/50 last:border-r-0 truncate max-w-[65px]"
                    >
                      {formatHeaderName(player.displayName)}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {/* Past Rounds */}
                {game.rounds.map((round) => (
                  <tr
                    key={round.id}
                    onClick={() => {
                      SoundEffects.playClick();
                      onViewAuditRound(round);
                    }}
                    className="bg-white dark:bg-[#111827] hover:bg-red-50/40 dark:hover:bg-[#1a253f]/60 cursor-pointer transition-colors"
                  >
                    {/* Round column with edit pencil icon */}
                    <td className="py-2.5 px-2 text-left font-bold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800 flex items-center gap-1">
                      <Edit3 className="w-3 h-3 text-slate-700 dark:text-slate-400 hover:text-red-600 dark:hover:text-rose-400 flex-shrink-0" />
                      <span className="font-mono-numbers">{round.roundNumber}</span>
                    </td>

                    {/* Scores for each player with badges */}
                    {game.players.map((player) => {
                      const input = round.inputs.find((i) => i.gamePlayerId === player.id);
                      const pts = round.netPoints[player.id] ?? 0;
                      const isPositive = pts > 0;
                      const isNegative = pts < 0;

                      return (
                        <td
                          key={player.id}
                          className="py-2.5 px-1 border-r border-slate-200 dark:border-slate-800 last:border-r-0 font-medium"
                        >
                          <div className="inline-flex items-center justify-center relative font-mono-numbers text-sm">
                            <span
                              className={
                                isPositive
                                  ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                                  : isNegative
                                  ? 'text-red-700 dark:text-rose-400 font-bold'
                                  : 'text-slate-800 dark:text-white'
                              }
                            >
                              {pts}
                            </span>
                            <span className="text-[11px] leading-none -mt-2.5 -mr-1">
                              {renderStatusBadge(input, player.isSittingOut)}
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {game.rounds.length === 0 && (
                  <tr>
                    <td
                      colSpan={game.players.length + 1}
                      className="py-8 text-center text-xs text-slate-400 dark:text-slate-500 font-medium italic"
                    >
                      No rounds recorded yet. Tap "Next Game &gt;" to record Round 1.
                    </td>
                  </tr>
                )}

                {/* Summary Row 1: Total Points */}
                <tr className="bg-white dark:bg-[#0c1220] font-bold border-t-2 border-slate-300 dark:border-slate-700">
                  <td className="py-2.5 px-2 text-left text-slate-800 dark:text-white font-bold border-r border-slate-200 dark:border-slate-800 text-[11px] leading-tight">
                    <div>Total</div>
                    <div>Points</div>
                  </td>
                  {game.players.map((player) => {
                    const stat = playerCumulativeTotals.find((s) => s.playerId === player.id);
                    const totalPts = stat?.totalPoints ?? 0;
                    const isPositive = totalPts > 0;
                    const isNegative = totalPts < 0;

                    return (
                      <td
                        key={player.id}
                        className="py-2.5 px-1 border-r border-slate-200 dark:border-slate-800 last:border-r-0 font-mono-numbers font-bold text-sm"
                      >
                        <span
                          className={
                            isPositive
                              ? 'text-emerald-700 dark:text-emerald-400 font-extrabold text-base'
                              : isNegative
                              ? 'text-red-700 dark:text-rose-400 font-extrabold text-base'
                              : 'text-slate-800 dark:text-white'
                          }
                        >
                          {totalPts}
                        </span>
                      </td>
                    );
                  })}
                </tr>

                {/* Summary Row 2: Total Amt (Mint green background in light, emerald deep in dark) */}
                <tr className="bg-[#dcfce7] dark:bg-[#062c1b] font-bold border-t border-emerald-200 dark:border-emerald-800/80">
                  <td className="py-2.5 px-2 text-left text-slate-800 dark:text-emerald-200 font-bold border-r border-emerald-200/80 dark:border-emerald-800/60 text-[10px] leading-tight">
                    <div>{game.currency} {game.pointRate}/pt</div>
                    <div>Total Amt</div>
                  </td>
                  {game.players.map((player) => {
                    const stat = playerCumulativeTotals.find((s) => s.playerId === player.id);
                    const totalAmt = stat?.totalMoney ?? 0;
                    const isPositive = totalAmt > 0;
                    const isNegative = totalAmt < 0;

                    return (
                      <td
                        key={player.id}
                        className="py-2.5 px-1 border-r border-emerald-200/80 dark:border-emerald-800/60 last:border-r-0 font-mono-numbers font-bold text-sm"
                      >
                        <span
                          className={
                            isPositive
                              ? 'text-emerald-700 dark:text-emerald-300 font-extrabold text-base'
                              : isNegative
                              ? 'text-red-700 dark:text-rose-300 font-extrabold text-base'
                              : 'text-slate-800 dark:text-emerald-200'
                          }
                        >
                          {totalAmt}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 4: FIXED BOTTOM NAVIGATION (< Edit Previous  |  Next Game >)
         ========================================================================= */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0a0e1a]/95 backdrop-blur-xs border-t border-slate-200 dark:border-slate-800 p-2.5 shadow-lg transition-colors">
        <div className="max-w-md mx-auto grid grid-cols-2 gap-3">
          {/* Edit Previous */}
          <button
            type="button"
            disabled={!latestRound}
            onClick={() => {
              SoundEffects.playClick();
              if (latestRound) {
                onViewAuditRound(latestRound);
              }
            }}
            className={`py-3 px-3 rounded-lg font-bold text-sm flex items-center justify-center gap-1.5 transition-all ${
              latestRound
                ? 'bg-[#d32f2f] hover:bg-red-700 dark:bg-[#88131e] dark:hover:bg-[#a11824] active:scale-98 text-white shadow-sm'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Edit Previous</span>
          </button>

          {/* Next Game / Record Round */}
          <button
            type="button"
            onClick={() => {
              SoundEffects.playClick();
              onAddRound();
            }}
            className="py-3 px-3 bg-[#d32f2f] hover:bg-red-700 dark:bg-[#88131e] dark:hover:bg-[#a11824] active:scale-98 text-white rounded-lg font-bold text-sm shadow-sm flex items-center justify-center gap-1.5 transition-all"
          >
            <span>Next Game</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          MODAL: ADD PLAYER / SEAT MANAGER
         ========================================================================= */}
      {showAddPlayerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl max-w-sm w-full p-4 space-y-3.5 shadow-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-[#d32f2f] dark:text-rose-400" /> Table Players ({game.players.length})
              </h3>
              <button
                onClick={() => setShowAddPlayerModal(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick add input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="New player name..."
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddNewPlayer()}
                className="flex-1 px-3 py-1.5 bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg font-medium text-xs focus:ring-1 focus:ring-red-500"
              />
              <button
                type="button"
                onClick={handleAddNewPlayer}
                className="px-3 py-1.5 bg-[#d32f2f] dark:bg-rose-700 text-white font-bold rounded-lg text-xs"
              >
                Add
              </button>
            </div>

            {/* Existing Players & Sitting out toggles */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto pt-1">
              {game.players.map((p) => (
                <div
                  key={p.id}
                  className="p-2 rounded-lg bg-slate-50 dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                >
                  <span className="font-bold text-slate-800 dark:text-white">{p.displayName}</span>
                  <button
                    type="button"
                    onClick={() => handleToggleSittingOut(p.id)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                      p.isSittingOut
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                        : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                    }`}
                  >
                    {p.isSittingOut ? '⏳ Sitting Out' : 'Active'}
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setShowAddPlayerModal(false)}
                className="px-4 py-1.5 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 rounded-lg font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
