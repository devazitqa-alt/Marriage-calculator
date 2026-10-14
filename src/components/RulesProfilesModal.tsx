import React, { useState } from 'react';
import { X, Settings2, Plus, Check, Trash2, HelpCircle } from 'lucide-react';
import { RulesProfile } from '../types/marriage';
import { StorageService } from '../services/storageService';
import { SoundEffects } from '../utils/audio';

interface RulesProfilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  rulesProfiles: RulesProfile[];
  onProfilesUpdated: () => void;
}

export const RulesProfilesModal: React.FC<RulesProfilesModalProps> = ({
  isOpen,
  onClose,
  rulesProfiles,
  onProfilesUpdated,
}) => {
  if (!isOpen) return null;

  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [baseGamePoints, setBaseGamePoints] = useState<number>(3);
  const [unseenPenalty, setUnseenPenalty] = useState<number>(10);
  const [dubleeMultiplier, setDubleeMultiplier] = useState<number>(2);
  const [kidnapUnseenMaal, setKidnapUnseenMaal] = useState<boolean>(true);
  const [foulPenalty, setFoulPenalty] = useState<number>(15);
  const [foulRecipient, setFoulRecipient] = useState<'winner' | 'split_table'>('winner');

  const handleSaveCustomProfile = () => {
    if (!name.trim()) return;
    SoundEffects.playCardSlide();

    const newProfile: RulesProfile = {
      id: `custom-rule-${Date.now()}`,
      name: name.trim(),
      version: 1,
      description: description.trim() || 'Custom house rules configuration',
      isPreset: false,
      baseGamePoints,
      unseenPenalty,
      dubleeMultiplier,
      kidnapUnseenMaal,
      foulPenalty,
      foulRecipient,
      sittingOutParticipates: false,
    };

    StorageService.saveCustomRule(newProfile);
    onProfilesUpdated();
    setIsCreating(false);
    setName('');
    setDescription('');
  };

  const handleDeleteProfile = (id: string) => {
    SoundEffects.playClick();
    StorageService.deleteCustomRule(id);
    onProfilesUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 rounded-2xl shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 transition-colors">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-rose-600 dark:from-[#1b1016] dark:via-[#7f1d1d] dark:to-[#450a0a] px-5 py-3.5 text-white flex items-center justify-between border-b border-red-800 dark:border-rose-950/80">
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-amber-300" />
            <div>
              <h3 className="font-extrabold text-sm sm:text-base tracking-tight">Marriage Rules & Profiles</h3>
              <p className="text-[11px] text-red-100 dark:text-rose-200">Configurable House Rules & Point Formulas</p>
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

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {!isCreating ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200">Saved Profiles ({rulesProfiles.length})</span>
                <button
                  onClick={() => setIsCreating(true)}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 dark:bg-rose-600 dark:hover:bg-rose-700 text-white rounded-lg font-bold flex items-center gap-1 shadow-2xs active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" /> New House Rule
                </button>
              </div>

              <div className="space-y-2.5">
                {rulesProfiles.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 bg-slate-50 dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-slate-900 dark:text-white text-xs">{p.name}</h4>
                          {p.isPreset && (
                            <span className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[9px] px-1.5 py-0.2 rounded font-bold">
                              Preset
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{p.description}</p>
                      </div>

                      {!p.isPreset && (
                        <button
                          onClick={() => handleDeleteProfile(p.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          title="Delete custom profile"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px] text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                      <div className="bg-white dark:bg-[#1a253f] p-1 rounded border border-slate-200/80 dark:border-slate-700">
                        Base: <strong className="text-slate-900 dark:text-white">{p.baseGamePoints} pts</strong>
                      </div>
                      <div className="bg-white dark:bg-[#1a253f] p-1 rounded border border-slate-200/80 dark:border-slate-700">
                        Unseen: <strong className="text-slate-900 dark:text-white">{p.unseenPenalty} pts</strong>
                      </div>
                      <div className="bg-white dark:bg-[#1a253f] p-1 rounded border border-slate-200/80 dark:border-slate-700">
                        Dublee: <strong className="text-slate-900 dark:text-white">{p.dubleeMultiplier}x</strong>
                      </div>
                      <div className="bg-white dark:bg-[#1a253f] p-1 rounded border border-slate-200/80 dark:border-slate-700">
                        Kidnap: <strong className="text-slate-900 dark:text-white">{p.kidnapUnseenMaal ? 'Yes' : 'No'}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3 bg-slate-50 dark:bg-[#131b2e] p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <h4 className="font-extrabold text-slate-900 dark:text-white text-xs">Create Custom House Profile</h4>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Profile Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Pokhara Table Rules"
                  className="w-full px-3 py-1.5 bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Description / Notes</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Family house rule with kidnap maal enabled"
                  className="w-full px-3 py-1.5 bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Base Game Points</label>
                  <input
                    type="number"
                    min="0"
                    value={baseGamePoints}
                    onChange={(e) => setBaseGamePoints(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold"
                  />
                  <span className="text-[10px] text-slate-400">Paid by each seen player to winner</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Unseen Penalty</label>
                  <input
                    type="number"
                    min="0"
                    value={unseenPenalty}
                    onChange={(e) => setUnseenPenalty(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold"
                  />
                  <span className="text-[10px] text-slate-400">Paid by unseen player to winner</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Dublee Multiplier</label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    value={dubleeMultiplier}
                    onChange={(e) => setDubleeMultiplier(parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold"
                  />
                  <span className="text-[10px] text-slate-400">Multiplier when winner wins with 7 pairs</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Foul Penalty</label>
                  <input
                    type="number"
                    min="0"
                    value={foulPenalty}
                    onChange={(e) => setFoulPenalty(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold"
                  />
                  <span className="text-[10px] text-slate-400">Penalty for misdeal / wrong show</span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-[#1e293b] p-2.5 rounded-lg border border-slate-300 dark:border-slate-700">
                  <input
                    type="checkbox"
                    checked={kidnapUnseenMaal}
                    onChange={(e) => setKidnapUnseenMaal(e.target.checked)}
                    className="rounded text-red-600 focus:ring-red-500"
                  />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-white block">Kidnap / Murder Unseen Maal</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Unseen player's raw hand Maal is confiscated by the winner as bonus
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1.5 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCustomProfile}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 dark:bg-rose-600 dark:hover:bg-rose-700 text-white font-bold rounded-lg shadow-sm"
                >
                  Save Profile
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-[#0c1220] border-t border-slate-200 dark:border-slate-800 flex justify-end transition-colors">
          <button
            type="button"
            onClick={() => {
              SoundEffects.playClick();
              onClose();
            }}
            className="px-4 py-1.5 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 rounded-xl text-xs font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
