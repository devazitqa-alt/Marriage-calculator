import React, { useState } from 'react';
import { X, BookOpen, Sparkles, HelpCircle, Calculator, ChevronRight, Check } from 'lucide-react';
import { SoundEffects } from '../utils/audio';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'rules' | 'calculator' | 'glossary'>('rules');

  // Interactive Maal Calculator state
  const [tipluCount, setTipluCount] = useState<number>(0);
  const [popluCount, setPopluCount] = useState<number>(0);
  const [jharCount, setJharCount] = useState<number>(0);
  const [alterCount, setAlterCount] = useState<number>(0);
  const [pureTunnelCount, setPureTunnelCount] = useState<number>(0);
  const [hasMarriageCombo, setHasMarriageCombo] = useState<boolean>(false);
  const [isDubleeHand, setIsDubleeHand] = useState<boolean>(false);

  // Calculate interactive test Maal
  const calculatedTestMaal = React.useMemo(() => {
    let total = 0;
    total += tipluCount * 3;
    total += popluCount * 2;
    total += jharCount * 2;
    total += alterCount * 5;
    total += pureTunnelCount * 5;
    if (hasMarriageCombo) {
      total += 10; // Marriage combo base +10
    }
    return total;
  }, [tipluCount, popluCount, jharCount, alterCount, pureTunnelCount, hasMarriageCombo]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-rose-600 px-5 py-3.5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-300" />
            <div>
              <h3 className="font-extrabold text-sm sm:text-base tracking-tight">Marriage Rules & Tutorial</h3>
              <p className="text-[11px] text-red-100">Nepali 21-Card Game Rules & Interactive Maal Calc</p>
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
            onClick={() => setActiveTab('rules')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${
              activeTab === 'rules'
                ? 'border-red-600 text-red-600 bg-white'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            How to Play
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-colors flex items-center justify-center gap-1 ${
              activeTab === 'calculator'
                ? 'border-red-600 text-red-600 bg-white'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Interactive Maal Calc</span>
          </button>
          <button
            onClick={() => setActiveTab('glossary')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${
              activeTab === 'glossary'
                ? 'border-red-600 text-red-600 bg-white'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Glossary & Terms
          </button>
        </div>

        {/* Content body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed">
          {activeTab === 'rules' && (
            <div className="space-y-4">
              <div className="bg-red-50 p-3 rounded-xl border border-red-200">
                <h4 className="font-bold text-red-900 mb-1 flex items-center gap-1.5">
                  <span>🎴</span> The Basics of Marriage
                </h4>
                <p>
                  Marriage is played with <strong>3 decks of cards (156 cards)</strong> including printed jokers.
                  Each player is dealt <strong>21 cards</strong>. The objective is to form valid combinations and
                  declare show.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-extrabold text-slate-900 text-sm">Step 1: The Initial Show (Seen Status)</h4>
                <p>
                  Before you can view the wild Jokers (Tiplu), you must build and lay down at least{' '}
                  <strong>3 Pure Sequences</strong> (pure runs, or tunnels).
                </p>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1">
                  <div>
                    • <strong>Pure Sequence:</strong> 3 consecutive cards of same suit (e.g., ♠7 - ♠8 - ♠9).
                  </div>
                  <div>
                    • <strong>Tunnel (Tunella):</strong> 3 cards of the exact same rank AND same suit (e.g., three
                    ♥Jack cards).
                  </div>
                  <div>
                    • <strong>Dublee:</strong> 7 or 8 pairs of identical cards (rank and suit match).
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-extrabold text-slate-900 text-sm">Step 2: Unlocking the Joker (Tiplu)</h4>
                <p>
                  Once you successfully lay down your 3 pure sequences, you become <strong>"SEEN"</strong>! You can
                  now pick from the Joker pile and see the <strong>Tiplu</strong>.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-extrabold text-slate-900 text-sm">Step 3: Maal Points Value</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-900 block">Tiplu (Main Joker)</span>
                    <span className="text-red-600 font-extrabold">+3 Maal each</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-900 block">Poplu (One rank up)</span>
                    <span className="text-red-600 font-extrabold">+2 Maal each</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-900 block">Jhar (One rank down)</span>
                    <span className="text-red-600 font-extrabold">+2 Maal each</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-900 block">Alter (Same rank, opp color)</span>
                    <span className="text-red-600 font-extrabold">+5 Maal each</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-900 block">Tunnel (3 identical cards)</span>
                    <span className="text-red-600 font-extrabold">+5 Maal</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-900 block">Marriage (K-Q-Tiplu)</span>
                    <span className="text-red-600 font-extrabold">+10 Maal bonus</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'calculator' && (
            <div className="space-y-4">
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                <h4 className="font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-amber-700" /> Interactive Hand Maal Calculator
                </h4>
                <p className="text-[11px] text-amber-800">
                  Tap the cards you hold in your hand after declaring seen. The calculator adds up your exact Maal!
                </p>
              </div>

              {/* Total display */}
              <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between shadow-inner">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Calculated Hand Maal
                  </span>
                  <div className="text-2xl font-black font-mono-numbers text-amber-400">
                    {calculatedTestMaal} <span className="text-xs text-white">Points</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    SoundEffects.playClick();
                    setTipluCount(0);
                    setPopluCount(0);
                    setJharCount(0);
                    setAlterCount(0);
                    setPureTunnelCount(0);
                    setHasMarriageCombo(false);
                  }}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[10px] font-bold text-slate-300"
                >
                  Reset
                </button>
              </div>

              {/* Card selectors */}
              <div className="space-y-2">
                {[
                  {
                    name: 'Tiplu (Main Joker Card)',
                    val: 3,
                    count: tipluCount,
                    set: setTipluCount,
                    desc: '+3 pts per card',
                  },
                  {
                    name: 'Poplu (Next consecutive card)',
                    val: 2,
                    count: popluCount,
                    set: setPopluCount,
                    desc: '+2 pts per card',
                  },
                  {
                    name: 'Jhar (Previous consecutive card)',
                    val: 2,
                    count: jharCount,
                    set: setJharCount,
                    desc: '+2 pts per card',
                  },
                  {
                    name: 'Alter (Same rank, opposite suit)',
                    val: 5,
                    count: alterCount,
                    set: setAlterCount,
                    desc: '+5 pts per card',
                  },
                  {
                    name: 'Tunnel (3 identical cards in hand)',
                    val: 5,
                    count: pureTunnelCount,
                    set: setPureTunnelCount,
                    desc: '+5 pts per tunnel',
                  },
                ].map((item) => (
                  <div
                    key={item.name}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900 text-xs">{item.name}</div>
                      <div className="text-[10px] text-slate-500">{item.desc}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          SoundEffects.playClick();
                          item.set(Math.max(0, item.count - 1));
                        }}
                        className="w-7 h-7 bg-white border border-slate-300 rounded font-bold hover:bg-slate-100"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-bold font-mono-numbers">{item.count}</span>
                      <button
                        type="button"
                        onClick={() => {
                          SoundEffects.playClick();
                          item.set(item.count + 1);
                        }}
                        className="w-7 h-7 bg-white border border-slate-300 rounded font-bold hover:bg-slate-100"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}

                {/* Marriage combo toggle */}
                <label className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="font-extrabold text-red-900 text-xs block">
                      Marriage Combination (King + Queen + Tiplu)
                    </span>
                    <span className="text-[10px] text-red-700">Adds special +10 Maal bonus</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={hasMarriageCombo}
                    onChange={(e) => {
                      SoundEffects.playClick();
                      setHasMarriageCombo(e.target.checked);
                    }}
                    className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                  />
                </label>
              </div>
            </div>
          )}

          {activeTab === 'glossary' && (
            <div className="space-y-3">
              {[
                {
                  term: 'Maal',
                  def: 'Points accumulated through special cards (Tiplu, Poplu, Jhar, Alter, Marriage, Tunnel) held in hand when declaring seen.',
                },
                {
                  term: 'Seen',
                  def: 'A player who has made 3 pure sequences before the winner declared, allowing their Maal to be counted.',
                },
                {
                  term: 'Unseen (Blind)',
                  def: 'A player unable to show 3 pure sequences before the game ended. Pays penalty and receives 0 maal.',
                },
                {
                  term: 'Kidnap / Murder Rule',
                  def: 'A thrilling house rule where an unseen player’s gathered Maal is surrendered directly to the winner.',
                },
                {
                  term: 'Dublee',
                  def: 'A winning hand composed of 7 or 8 pairs of identical cards. Usually yields double points.',
                },
                {
                  term: 'Dheri Maal',
                  def: 'The table rule where the player with the highest Maal can earn additional points, or winner takes all.',
                },
              ].map((item) => (
                <div key={item.term} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
                  <div className="font-extrabold text-slate-900 text-xs text-red-700">{item.term}</div>
                  <div className="text-slate-600 text-[11px]">{item.def}</div>
                </div>
              ))}
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
            className="px-5 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
