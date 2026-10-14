import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  UserCheck, 
  Users, 
  Sparkles, 
  Check, 
  HelpCircle,
  Coins
} from 'lucide-react';
import { Currency, Game, GamePlayer, Player, PlayerGroup, RulesProfile } from '../types/marriage';
import { StorageService } from '../services/storageService';
import { SoundEffects } from '../utils/audio';

interface NewGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartGame: (game: Game) => void;
  savedPlayers: Player[];
  savedGroups: PlayerGroup[];
  rulesProfiles: RulesProfile[];
}

export const NewGameModal: React.FC<NewGameModalProps> = ({
  isOpen,
  onClose,
  onStartGame,
  savedPlayers,
  savedGroups,
  rulesProfiles,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState(`Marriage Game #${Math.floor(1000 + Math.random() * 9000)}`);
  const [selectedProfileId, setSelectedProfileId] = useState(rulesProfiles[0]?.id || 'preset-ktm-standard');
  const [currency, setCurrency] = useState<Currency>('Rs');
  const [pointRate, setPointRate] = useState<number>(2.0);
  const [pointsOnly, setPointsOnly] = useState<boolean>(false);

  // Player draft seats
  const [seats, setSeats] = useState<{ id: string; name: string; isSittingOut: boolean }[]>([
    { id: '1', name: savedPlayers[0]?.displayName || 'Aarav', isSittingOut: false },
    { id: '2', name: savedPlayers[1]?.displayName || 'Bina', isSittingOut: false },
    { id: '3', name: savedPlayers[2]?.displayName || 'Chirag', isSittingOut: false },
    { id: '4', name: savedPlayers[3]?.displayName || 'Deepak', isSittingOut: false },
  ]);

  const [newPlayerName, setNewPlayerName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const selectedProfile = rulesProfiles.find((r) => r.id === selectedProfileId) || rulesProfiles[0];

  const handleAddPlayer = () => {
    if (!newPlayerName.trim()) return;
    if (seats.length >= 8) {
      setError('Maximum 8 players per table supported.');
      return;
    }
    SoundEffects.playClick();
    setSeats([...seats, { id: `seat-${Date.now()}`, name: newPlayerName.trim(), isSittingOut: false }]);
    setNewPlayerName('');
    setError(null);
  };

  const handleRemoveSeat = (index: number) => {
    if (seats.length <= 2) {
      setError('At least 2 players are required for a game.');
      return;
    }
    SoundEffects.playClick();
    const updated = [...seats];
    updated.splice(index, 1);
    setSeats(updated);
    setError(null);
  };

  const handleMoveSeat = (index: number, direction: 'up' | 'down') => {
    SoundEffects.playClick();
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= seats.length) return;
    const updated = [...seats];
    const temp = updated[index];
    updated[index] = updated[target];
    updated[target] = temp;
    setSeats(updated);
  };

  const handleToggleSittingOut = (index: number) => {
    SoundEffects.playClick();
    const updated = [...seats];
    updated[index].isSittingOut = !updated[index].isSittingOut;
    setSeats(updated);
  };

  const handleLoadGroup = (group: PlayerGroup) => {
    SoundEffects.playCardSlide();
    const loadedSeats = group.playerIds.map((pid, idx) => {
      const p = savedPlayers.find((sp) => sp.id === pid);
      return {
        id: `seat-${idx}-${Date.now()}`,
        name: p?.displayName || `Player ${idx + 1}`,
        isSittingOut: false,
      };
    });
    if (loadedSeats.length >= 2) {
      setSeats(loadedSeats);
      setError(null);
    }
  };

  const handleStart = () => {
    if (seats.length < 2) {
      setError('Please add at least 2 players.');
      return;
    }
    const emptyName = seats.some((s) => !s.name.trim());
    if (emptyName) {
      setError('All player seats must have a valid name.');
      return;
    }

    const gamePlayers: GamePlayer[] = seats.map((s, idx) => {
      let matched = savedPlayers.find((p) => p.displayName.toLowerCase() === s.name.trim().toLowerCase());
      if (!matched) {
        matched = {
          id: `player-${Date.now()}-${idx}`,
          displayName: s.name.trim(),
          createdAt: new Date().toISOString(),
        };
        StorageService.savePlayer(matched);
      }
      return {
        id: `gp-${idx + 1}-${Date.now()}`,
        playerId: matched.id,
        displayName: s.name.trim(),
        seatOrder: idx,
        isSittingOut: s.isSittingOut,
      };
    });

    const newGame: Game = {
      id: `game-${Date.now()}`,
      title: title.trim() || 'Marriage Card Game',
      startedAt: new Date().toISOString(),
      status: 'active',
      rulesProfile: selectedProfile,
      currency,
      pointRate: pointsOnly ? 0 : Number(pointRate) || 0,
      players: gamePlayers,
      rounds: [],
      auditEvents: [
        {
          id: `ae-${Date.now()}`,
          gameId: `game-${Date.now()}`,
          action: 'CREATE_GAME',
          description: `Game created with ${gamePlayers.length} players. Rule profile: ${selectedProfile.name}. Stake: ${pointsOnly ? 'Points only' : currency + ' ' + pointRate + '/pt'}`,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    SoundEffects.playWin();
    StorageService.saveGame(newGame);
    onStartGame(newGame);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 rounded-2xl shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 transition-colors">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-rose-600 dark:from-[#1b1016] dark:via-[#7f1d1d] dark:to-[#450a0a] px-5 py-3.5 text-white flex items-center justify-between border-b border-red-800 dark:border-rose-950/80">
          <div>
            <h3 className="font-extrabold text-base tracking-tight flex items-center gap-1.5">
              <span>🎴</span> Setup New Game
            </h3>
            <p className="text-[11px] text-red-100 dark:text-rose-200">Set table players, rules profile, and point stake</p>
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

        {/* Form Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {error && (
            <div className="p-2.5 rounded-lg bg-red-50 dark:bg-rose-950/50 text-red-700 dark:text-rose-300 border border-red-200 dark:border-rose-900 text-xs font-semibold">
              ⚠️ {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Game Title / Session Name</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-medium text-xs text-slate-900 dark:text-white"
              placeholder="e.g. Saturday Night Marriage"
            />
          </div>

          {/* Rules Profile Selection */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center justify-between">
              <span>Scoring Rules Profile</span>
              <span className="text-[10px] text-red-600 dark:text-rose-400 font-medium">{selectedProfile.name}</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {rulesProfiles.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    SoundEffects.playClick();
                    setSelectedProfileId(p.id);
                  }}
                  className={`p-2 rounded-lg text-left border transition-all ${
                    selectedProfileId === p.id
                      ? 'border-red-600 dark:border-rose-500 bg-red-50/70 dark:bg-rose-950/40 text-red-950 dark:text-rose-200 font-bold shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-[#131b2e]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{p.name}</span>
                    {selectedProfileId === p.id && <Check className="w-3.5 h-3.5 text-red-600 dark:text-rose-400" />}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{p.description}</div>
                </button>
              ))}
            </div>

            {/* Profile Summary Badge */}
            <div className="mt-2 p-2 bg-slate-50 dark:bg-[#131b2e] rounded-lg border border-slate-200 dark:border-slate-800 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-600 dark:text-slate-300">
              <span>
                Base Win: <strong className="text-slate-900 dark:text-white">{selectedProfile.baseGamePoints} pts</strong>
              </span>
              <span>
                Unseen Penalty: <strong className="text-slate-900 dark:text-white">{selectedProfile.unseenPenalty} pts</strong>
              </span>
              <span>
                Dublee:{' '}
                <strong className="text-slate-900 dark:text-white">{selectedProfile.dubleeMultiplier}x</strong>
              </span>
              <span>
                Kidnap Maal:{' '}
                <strong className={selectedProfile.kidnapUnseenMaal ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}>
                  {selectedProfile.kidnapUnseenMaal ? 'Enabled (Murder)' : 'Disabled'}
                </strong>
              </span>
            </div>
          </div>

          {/* Stake & Currency */}
          <div className="bg-slate-50 dark:bg-[#131b2e] p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-500" /> Stake & Settlement Mode
              </span>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={pointsOnly}
                  onChange={(e) => setPointsOnly(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <span className="text-[11px] font-semibold">Points Only (No Cash)</span>
              </label>
            </div>

            {!pointsOnly && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-semibold mb-1">Currency Symbol</label>
                  <div className="flex gap-1">
                    {(['Rs', '₹', '$', '€', '£'] as Currency[]).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCurrency(c)}
                        className={`flex-1 py-1 rounded text-xs font-bold border ${
                          currency === c
                            ? 'bg-red-600 dark:bg-rose-600 text-white border-red-600 dark:border-rose-600 shadow-xs'
                            : 'bg-white dark:bg-[#1e293b] text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-[#28354f]'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Rate per Point ({currency})
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step="0.5"
                      min="0.1"
                      value={pointRate}
                      onChange={(e) => setPointRate(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1 bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded text-xs font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-red-500"
                    />
                    <div className="flex gap-1">
                      {[1, 2, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setPointRate(val)}
                          className="px-1.5 py-1 text-[10px] font-bold bg-white dark:bg-[#1e293b] hover:bg-slate-100 dark:hover:bg-[#28354f] border border-slate-300 dark:border-slate-700 rounded text-slate-700 dark:text-slate-200"
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Group Preset Loader */}
          {savedGroups.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
              <span className="text-slate-500 dark:text-slate-400 flex-shrink-0 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> Saved Groups:
              </span>
              {savedGroups.map((grp) => (
                <button
                  key={grp.id}
                  type="button"
                  onClick={() => handleLoadGroup(grp)}
                  className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-red-100 dark:hover:bg-red-950/60 hover:text-red-700 dark:hover:text-rose-400 text-slate-700 dark:text-slate-300 text-[10px] font-bold flex-shrink-0 transition-colors"
                >
                  {grp.name} ({grp.playerIds.length})
                </button>
              ))}
            </div>
          )}

          {/* Players Table / Seats */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-700 dark:text-slate-300 font-bold">
                Table Seating ({seats.length} Players, {seats.filter((s) => !s.isSittingOut).length} Active)
              </label>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Card table sequence clockwise</span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl p-2 bg-slate-50 dark:bg-[#0b101c]">
              {seats.map((seat, index) => (
                <div
                  key={seat.id}
                  className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                    seat.isSittingOut
                      ? 'bg-slate-100/70 dark:bg-[#131b2e]/60 border-slate-200 dark:border-slate-800 opacity-60 text-slate-500 dark:text-slate-400'
                      : 'bg-white dark:bg-[#131b2e] border-slate-200 dark:border-slate-800 shadow-2xs text-slate-900 dark:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono-numbers font-bold text-[10px] flex items-center justify-center">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      value={seat.name}
                      onChange={(e) => {
                        const updated = [...seats];
                        updated[index].name = e.target.value;
                        setSeats(updated);
                      }}
                      className="font-bold text-xs bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-red-500 focus:outline-none px-1 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleToggleSittingOut(index)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
                        seat.isSittingOut
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                          : 'bg-slate-100 dark:bg-[#1e293b] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#28354f]'
                      }`}
                      title="Sitting out players receive/pay zero points this game"
                    >
                      {seat.isSittingOut ? 'Sitting Out' : 'Active'}
                    </button>

                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveSeat(index, 'up')}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === seats.length - 1}
                      onClick={() => handleMoveSeat(index, 'down')}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveSeat(index)}
                      className="p-1 rounded text-red-500 dark:text-rose-400 hover:bg-red-50 dark:hover:bg-red-950/40 ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Player Input */}
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                placeholder="Enter player name..."
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
                className="flex-1 px-3 py-1.5 bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
              />
              <button
                type="button"
                onClick={handleAddPlayer}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 dark:bg-slate-200 dark:hover:bg-white text-white dark:text-slate-900 rounded-lg font-bold text-xs flex items-center gap-1 active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Add Seat
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-[#0c1220] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between transition-colors">
          <button
            type="button"
            onClick={() => {
              SoundEffects.playClick();
              onClose();
            }}
            className="px-4 py-2 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleStart}
            className="px-6 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-extrabold rounded-xl shadow-md shadow-red-600/20 active:scale-95 transition-all flex items-center gap-1.5"
          >
            Start Table Game
          </button>
        </div>
      </div>
    </div>
  );
};
