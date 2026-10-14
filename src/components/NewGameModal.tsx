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
    const groupPlayers = group.playerIds
      .map((id) => savedPlayers.find((p) => p.id === id))
      .filter(Boolean) as Player[];

    if (groupPlayers.length >= 2) {
      setSeats(
        groupPlayers.map((p, idx) => ({
          id: `seat-${idx}-${Date.now()}`,
          name: p.displayName,
          isSittingOut: false,
        }))
      );
      setError(null);
    }
  };

  const handleStart = () => {
    const activeSeats = seats.filter((s) => !s.isSittingOut);
    if (activeSeats.length < 2) {
      setError('At least 2 active players (not sitting out) are required to start.');
      return;
    }

    // Ensure players exist in global roster
    const allRoster = StorageService.getPlayers();
    const gamePlayers: GamePlayer[] = seats.map((s, idx) => {
      let matched = allRoster.find((p) => p.displayName.toLowerCase() === s.name.trim().toLowerCase());
      if (!matched) {
        matched = StorageService.addPlayer(s.name.trim());
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-700 to-rose-600 px-5 py-3.5 text-white flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base tracking-tight flex items-center gap-1.5">
              <span>🎴</span> Setup New Game
            </h3>
            <p className="text-[11px] text-red-100">Set table players, rules profile, and point stake</p>
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
            <div className="p-2.5 rounded-lg bg-red-50 text-red-700 border border-red-200 text-xs font-semibold">
              ⚠️ {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Game Title / Session Name</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-medium text-xs text-slate-900"
              placeholder="e.g. Saturday Night Marriage"
            />
          </div>

          {/* Rules Profile Selection */}
          <div>
            <label className="block text-slate-700 font-bold mb-1 flex items-center justify-between">
              <span>Scoring Rules Profile</span>
              <span className="text-[10px] text-red-600 font-medium">{selectedProfile.name}</span>
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
                      ? 'border-red-600 bg-red-50/70 text-red-950 font-bold shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{p.name}</span>
                    {selectedProfileId === p.id && <Check className="w-3.5 h-3.5 text-red-600" />}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{p.description}</div>
                </button>
              ))}
            </div>

            {/* Profile Summary Badge */}
            <div className="mt-2 p-2 bg-slate-50 rounded-lg border border-slate-200 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-600">
              <span>
                Base Win: <strong className="text-slate-900">{selectedProfile.baseGamePoints} pts</strong>
              </span>
              <span>
                Unseen Penalty: <strong className="text-slate-900">{selectedProfile.unseenPenalty} pts</strong>
              </span>
              <span>
                Dublee:{' '}
                <strong className="text-slate-900">{selectedProfile.dubleeMultiplier}x</strong>
              </span>
              <span>
                Kidnap Maal:{' '}
                <strong className={selectedProfile.kidnapUnseenMaal ? 'text-emerald-700' : 'text-slate-500'}>
                  {selectedProfile.kidnapUnseenMaal ? 'Enabled (Murder)' : 'Disabled'}
                </strong>
              </span>
            </div>
          </div>

          {/* Stake & Currency */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-500" /> Stake & Settlement Mode
              </span>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-600">
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
                  <label className="block text-[11px] text-slate-600 font-semibold mb-1">Currency Symbol</label>
                  <div className="flex gap-1">
                    {(['Rs', '₹', '$', '€', '£'] as Currency[]).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCurrency(c)}
                        className={`flex-1 py-1 rounded text-xs font-bold border ${
                          currency === c
                            ? 'bg-red-600 text-white border-red-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-600 font-semibold mb-1">
                    Rate per Point ({currency})
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step="0.5"
                      min="0.1"
                      value={pointRate}
                      onChange={(e) => setPointRate(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded text-xs font-bold text-slate-900 focus:ring-1 focus:ring-red-500"
                    />
                    <div className="flex gap-1">
                      {[1, 2, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setPointRate(val)}
                          className="px-1.5 py-1 text-[10px] font-bold bg-white hover:bg-slate-100 border border-slate-300 rounded text-slate-700"
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
              <span className="text-slate-500 flex-shrink-0 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> Saved Groups:
              </span>
              {savedGroups.map((grp) => (
                <button
                  key={grp.id}
                  type="button"
                  onClick={() => handleLoadGroup(grp)}
                  className="px-2 py-0.5 rounded-full bg-slate-200 hover:bg-red-100 hover:text-red-700 text-slate-700 text-[10px] font-bold flex-shrink-0 transition-colors"
                >
                  {grp.name} ({grp.playerIds.length})
                </button>
              ))}
            </div>
          )}

          {/* Players Table / Seats */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-700 font-bold">
                Table Seating ({seats.length} Players, {seats.filter((s) => !s.isSittingOut).length} Active)
              </label>
              <span className="text-[10px] text-slate-500">Card table sequence clockwise</span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-2 bg-slate-50">
              {seats.map((seat, index) => (
                <div
                  key={seat.id}
                  className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                    seat.isSittingOut
                      ? 'bg-slate-100/70 border-slate-200 opacity-60 text-slate-500'
                      : 'bg-white border-slate-200 shadow-2xs text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-mono-numbers font-bold text-[10px] flex items-center justify-center">
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
                      className="font-bold text-xs bg-transparent border-b border-transparent hover:border-slate-300 focus:border-red-500 focus:outline-none px-1"
                    />
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleToggleSittingOut(index)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
                        seat.isSittingOut
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                      title="Sitting out players receive/pay zero points this game"
                    >
                      {seat.isSittingOut ? 'Sitting Out' : 'Active'}
                    </button>

                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveSeat(index, 'up')}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === seats.length - 1}
                      onClick={() => handleMoveSeat(index, 'down')}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveSeat(index)}
                      className="p-1 rounded text-red-500 hover:bg-red-50 ml-1"
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
                className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
              />
              <button
                type="button"
                onClick={handleAddPlayer}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold text-xs flex items-center gap-1 active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Add Seat
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              SoundEffects.playClick();
              onClose();
            }}
            className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleStart}
            className="px-6 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 active:scale-95 text-white font-extrabold rounded-xl shadow-md shadow-red-600/20 transition-all flex items-center gap-1.5"
          >
            Start Table Game
          </button>
        </div>
      </div>
    </div>
  );
};
