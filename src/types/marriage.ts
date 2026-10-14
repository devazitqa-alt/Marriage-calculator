export type Currency = 'Rs' | '₹' | '$' | '€' | '£';

export interface Player {
  id: string;
  displayName: string;
  avatarIcon?: string;
  createdAt: string;
  archivedAt?: string;
}

export interface PlayerGroup {
  id: string;
  name: string;
  playerIds: string[];
  createdAt: string;
}

export interface RulesProfile {
  id: string;
  name: string;
  version: number;
  description: string;
  isPreset: boolean;
  baseGamePoints: number;        // Points paid by each eligible seen opponent to winner (default: 3)
  unseenPenalty: number;         // Points paid by unseen player to winner (default: 10)
  dubleeMultiplier: number;      // Multiplier when winner wins with Dublee (default: 2)
  kidnapUnseenMaal: boolean;     // Whether unseen player's raw maal is credited to the winner (Kidnap/Murder rule)
  foulPenalty: number;           // Penalty paid on foul/misdeal (default: 15)
  foulRecipient: 'winner' | 'split_table'; // Who receives foul penalty
  sittingOutParticipates: boolean; // Usually false
}

export interface GamePlayer {
  id: string;           // Unique seat ID in game
  playerId: string;     // Reference to global Player ID
  displayName: string;
  seatOrder: number;
  isSittingOut: boolean;
}

export interface RoundInput {
  gamePlayerId: string;
  maal: number;
  seenStatus: 'seen' | 'unseen';
  isWinner: boolean;
  isDublee: boolean;
  isFoul: boolean;
  foulReason?: string;
}

export interface LedgerEntry {
  id: string;
  roundId: string;
  payerId: string;
  receiverId: string;
  amount: number;
  reasonCode: 'MAAL_EXCHANGE' | 'WINNER_BASE' | 'UNSEEN_PENALTY' | 'DUBLEE_BONUS' | 'KIDNAP_MAAL' | 'FOUL_PENALTY';
  reasonDescription: string;
}

export interface RoundCalculationResult {
  roundId: string;
  netPoints: Record<string, number>;
  netMoney: Record<string, number>;
  ledger: LedgerEntry[];
  explanations: Record<string, string[]>;
  isConserved: boolean;
}

export interface Round {
  id: string;
  gameId: string;
  roundNumber: number;
  createdAt: string;
  savedAt: string;
  winnerGamePlayerId: string | null;
  inputs: RoundInput[];
  ledger: LedgerEntry[];
  netPoints: Record<string, number>;
  netMoney: Record<string, number>;
  calculationNotes: string[];
}

export interface AuditEvent {
  id: string;
  gameId: string;
  roundId?: string;
  action: 'CREATE_GAME' | 'ADD_ROUND' | 'EDIT_ROUND' | 'UNDO_ROUND' | 'END_GAME' | 'RESTORE_BACKUP';
  description: string;
  timestamp: string;
}

export interface Game {
  id: string;
  title: string;
  startedAt: string;
  endedAt?: string;
  status: 'active' | 'completed' | 'archived';
  rulesProfile: RulesProfile;
  currency: Currency;
  pointRate: number;              // Money per point (e.g. 1.0, 2.5, 5.0, or 0)
  players: GamePlayer[];
  rounds: Round[];
  auditEvents: AuditEvent[];
}

export interface SettlementTransfer {
  fromPlayerId: string;
  fromPlayerName: string;
  toPlayerId: string;
  toPlayerName: string;
  amount: number;
  currency: Currency;
}

// Callbreak Mode types
export interface CallbreakRound {
  roundNumber: number;
  bids: Record<string, number>;   // player ID -> bid (1..13)
  tricks: Record<string, number>; // player ID -> tricks won (0..13)
  scores: Record<string, number>; // player ID -> score for this round
}

export interface CallbreakGame {
  id: string;
  title: string;
  startedAt: string;
  endedAt?: string;
  status: 'active' | 'completed';
  players: { id: string; name: string }[];
  rounds: CallbreakRound[];
}
