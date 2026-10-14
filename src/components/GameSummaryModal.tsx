import React, { useEffect, useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, 
  Trophy, 
  ArrowRight, 
  Share2, 
  Copy, 
  Check, 
  Download, 
  RotateCcw,
  Sparkles,
  Coins
} from 'lucide-react';
import { Game } from '../types/marriage';
import { calculateSettlement } from '../engine/settlementOptimizer';
import { SoundEffects } from '../utils/audio';

interface GameSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: Game;
  onReopenGame?: () => void;
}

export const GameSummaryModal: React.FC<GameSummaryModalProps> = ({
  isOpen,
  onClose,
  game,
  onReopenGame,
}) => {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);

  // Trigger celebration confetti
  useEffect(() => {
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignored if confetti not supported
    }
  }, []);

  // Compute player totals
  const playerResults = useMemo(() => {
    return game.players.map((p) => {
      let totalPoints = 0;
      let totalMoney = 0;
      let wins = 0;

      game.rounds.forEach((r) => {
        totalPoints += r.netPoints[p.id] || 0;
        totalMoney += r.netMoney[p.id] || 0;
        if (r.winnerGamePlayerId === p.id) {
          wins++;
        }
      });

      return {
        playerId: p.id,
        playerName: p.displayName,
        totalPoints,
        totalMoney: Math.round(totalMoney * 100) / 100,
        wins,
        isSittingOut: p.isSittingOut,
      };
    }).sort((a, b) => b.totalPoints - a.totalPoints);
  }, [game]);

  // Compute minimum cash settlement transfers
  const settlements = useMemo(() => {
    if (game.pointRate <= 0) return [];
    return calculateSettlement(
      playerResults.map((p) => ({
        playerId: p.playerId,
        playerName: p.playerName,
        balance: p.totalMoney,
      })),
      game.currency
    );
  }, [playerResults, game]);

  const generateShareText = () => {
    let text = `🎴 Marriage Point Calculator — Final Scorecard\n`;
    text += `Game: ${game.title}\n`;
    text += `Rounds: ${game.rounds.length} | Rule: ${game.rulesProfile.name}\n`;
    if (game.pointRate > 0) {
      text += `Stake: ${game.currency} ${game.pointRate}/point\n`;
    }
    text += `\n🏆 Leaderboard:\n`;
    playerResults.forEach((p, idx) => {
      const sign = p.totalPoints > 0 ? '+' : '';
      const moneyStr = game.pointRate > 0 ? ` (${game.currency} ${p.totalMoney > 0 ? '+' : ''}${p.totalMoney})` : '';
      text += `${idx + 1}. ${p.playerName}: ${sign}${p.totalPoints} pts${moneyStr} [${p.wins} wins]\n`;
    });

    if (settlements.length > 0) {
      text += `\n💰 Settlement (Who Pays Whom):\n`;
      settlements.forEach((s) => {
        text += `• ${s.fromPlayerName} ➔ ${s.toPlayerName}: ${s.currency} ${s.amount}\n`;
      });
    }
    return text;
  };

  const handleCopy = () => {
    SoundEffects.playClick();
    navigator.clipboard.writeText(generateShareText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCSV = () => {
    SoundEffects.playClick();
    let csv = `Round,${game.players.map((p) => p.displayName).join(',')}\n`;
    game.rounds.forEach((r) => {
      const row = [r.roundNumber, ...game.players.map((p) => r.netPoints[p.id] || 0)];
      csv += `${row.join(',')}\n`;
    });
    csv += `TOTAL POINTS,${game.players.map((p) => playerResults.find((pr) => pr.playerId === p.id)?.totalPoints || 0).join(',')}\n`;
    if (game.pointRate > 0) {
      csv += `TOTAL MONEY (${game.currency}),${game.players.map((p) => playerResults.find((pr) => pr.playerId === p.id)?.totalMoney || 0).join(',')}\n`;
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${game.title.replace(/\s+/g, '_')}_scorecard.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const winner = playerResults[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-rose-600 px-5 py-4 text-white text-center relative">
          <button
            onClick={() => {
              SoundEffects.playClick();
              onClose();
            }}
            className="absolute top-3.5 right-3.5 p-1 rounded-lg hover:bg-white/20 active:scale-95 transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 mx-auto rounded-full bg-amber-400 text-slate-900 flex items-center justify-center shadow-lg mb-2">
            <Trophy className="w-6 h-6 fill-current" />
          </div>
          <h3 className="font-black text-lg tracking-tight">Game Completed & Settlement</h3>
          <p className="text-xs text-red-100 mt-0.5">
            {game.title} • {game.rounds.length} Rounds Played
          </p>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {/* Winner Banner */}
          {winner && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800">
                  Champion of the Table
                </span>
                <h4 className="text-base font-black text-slate-900">{winner.playerName}</h4>
                <p className="text-xs text-slate-600">
                  {winner.wins} round wins • Final score:{' '}
                  <strong className="text-emerald-700">+{winner.totalPoints} pts</strong>
                </p>
              </div>
              <div className="text-3xl">👑</div>
            </div>
          )}

          {/* Leaderboard Table */}
          <div>
            <h4 className="font-extrabold text-slate-800 mb-2">Final Standings</h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
              {playerResults.map((p, idx) => (
                <div key={p.playerId} className="p-2.5 bg-white flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-6 h-6 rounded-full font-black text-[11px] flex items-center justify-center ${
                        idx === 0
                          ? 'bg-amber-400 text-slate-900'
                          : idx === 1
                          ? 'bg-slate-300 text-slate-800'
                          : idx === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-extrabold text-slate-900 text-xs">{p.playerName}</span>
                      <div className="text-[10px] text-slate-400">{p.wins} wins</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`font-mono-numbers font-black text-xs ${
                        p.totalPoints > 0
                          ? 'text-emerald-700'
                          : p.totalPoints < 0
                          ? 'text-rose-600'
                          : 'text-slate-600'
                      }`}
                    >
                      {p.totalPoints > 0 ? `+${p.totalPoints}` : p.totalPoints} pts
                    </span>
                    {game.pointRate > 0 && (
                      <div className="text-[10px] text-slate-500 font-semibold font-mono-numbers">
                        {game.currency} {p.totalMoney > 0 ? `+${p.totalMoney}` : p.totalMoney}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Settlement Optimizer (Who Pays Whom) */}
          {game.pointRate > 0 && (
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-500" />
                  Cash Settlement Optimizer
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Fewest cash transfers</span>
              </div>

              {settlements.length === 0 ? (
                <p className="text-slate-500 italic text-[11px]">All balances are even! No transfers needed.</p>
              ) : (
                <div className="space-y-1.5">
                  {settlements.map((s, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between shadow-2xs"
                    >
                      <div className="flex items-center gap-2 font-bold text-slate-800">
                        <span className="text-rose-700 font-extrabold">{s.fromPlayerName}</span>
                        <span className="text-slate-400 text-xs">pays</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-emerald-700 font-extrabold">{s.toPlayerName}</span>
                      </div>
                      <div className="font-mono-numbers font-black text-slate-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-xs">
                        {s.currency} {s.amount}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadCSV}
              className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              SoundEffects.playClick();
              onClose();
            }}
            className="px-5 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl text-xs font-extrabold shadow-sm active:scale-95 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
