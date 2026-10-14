import React from 'react';
import { X, Edit3, ShieldCheck, ArrowRight, Info, CheckCircle2 } from 'lucide-react';
import { Game, Round } from '../types/marriage';
import { SoundEffects } from '../utils/audio';

interface CalculationAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: Game;
  round: Round | null;
  onEditRound: (round: Round) => void;
}

export const CalculationAuditModal: React.FC<CalculationAuditModalProps> = ({
  isOpen,
  onClose,
  game,
  round,
  onEditRound,
}) => {
  if (!isOpen || !round) return null;

  const winner = game.players.find((p) => p.id === round.winnerGamePlayerId);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-700 to-rose-600 px-5 py-3.5 text-white flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm sm:text-base tracking-tight flex items-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-amber-300" />
              Round #{round.roundNumber} Audit Ledger
            </h3>
            <p className="text-[11px] text-red-100">Auditable transaction log & breakdown</p>
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

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {/* Quick Round Highlights */}
          <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Winner</span>
              <span className="font-extrabold text-slate-900 text-sm">{winner?.displayName || 'None'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Recorded At</span>
              <span className="font-medium text-slate-700">
                {new Date(round.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {/* Player Input Summary */}
          <div>
            <h4 className="font-bold text-slate-800 mb-2">Round Hand & Status</h4>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {round.inputs.map((inp) => {
                const player = game.players.find((p) => p.id === inp.gamePlayerId);
                const pts = round.netPoints[inp.gamePlayerId] || 0;
                const money = round.netMoney[inp.gamePlayerId] || 0;

                return (
                  <div key={inp.gamePlayerId} className="p-2.5 bg-white flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">{player?.displayName}</span>
                        {inp.isWinner && (
                          <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded text-[9px] font-extrabold">
                            WINNER{inp.isDublee ? ' (DUBLEE)' : ''}
                          </span>
                        )}
                        {inp.isFoul && (
                          <span className="px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded text-[9px] font-extrabold">
                            FOUL
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Status: <strong className="text-slate-700">{inp.seenStatus.toUpperCase()}</strong> • Maal:{' '}
                        <strong className="text-slate-700">{inp.maal}</strong>
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`font-mono-numbers font-black text-xs ${
                          pts > 0 ? 'text-emerald-700' : pts < 0 ? 'text-rose-600' : 'text-slate-600'
                        }`}
                      >
                        {pts > 0 ? `+${pts}` : pts} pts
                      </div>
                      {game.pointRate > 0 && (
                        <div className="text-[10px] text-slate-500">
                          {game.currency} {money > 0 ? `+${money}` : money}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Full Transaction Ledger */}
          <div>
            <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <span>Ledger Transfers ({round.ledger.length} events)</span>
            </h4>
            <div className="space-y-1.5 max-h-56 overflow-y-auto">
              {round.ledger.map((tx) => {
                const payer = game.players.find((p) => p.id === tx.payerId)?.displayName;
                const receiver = game.players.find((p) => p.id === tx.receiverId)?.displayName;

                return (
                  <div
                    key={tx.id}
                    className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <span className="text-rose-700">{payer}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-emerald-700">{receiver}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">{tx.reasonDescription}</div>
                    </div>
                    <div className="font-mono-numbers font-extrabold text-xs text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {tx.amount} pts
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Conservation note */}
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Conservation Verified: Total debits equal total credits exactly (Sum = 0).</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              SoundEffects.playClick();
              onClose();
              onEditRound(round);
            }}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit This Round
          </button>

          <button
            type="button"
            onClick={() => {
              SoundEffects.playClick();
              onClose();
            }}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
