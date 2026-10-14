import { CallbreakGame, CallbreakRound } from '../types/marriage';

export function calculateCallbreakScore(bid: number, tricks: number): number {
  if (tricks < bid) {
    return -bid;
  }
  const extra = tricks - bid;
  return Math.round((bid + extra * 0.1) * 10) / 10;
}

export function createNewCallbreakGame(playerNames: string[]): CallbreakGame {
  const players = playerNames.slice(0, 4).map((name, index) => ({
    id: `cb-player-${index + 1}-${Date.now()}`,
    name: name.trim() || `Player ${index + 1}`,
  }));

  return {
    id: `cb-game-${Date.now()}`,
    title: 'Callbreak 5 Rounds',
    startedAt: new Date().toISOString(),
    status: 'active',
    players,
    rounds: [],
  };
}

export function addCallbreakRound(
  game: CallbreakGame,
  bids: Record<string, number>,
  tricks: Record<string, number>
): CallbreakGame {
  const roundNumber = game.rounds.length + 1;
  const scores: Record<string, number> = {};

  game.players.forEach((p) => {
    const bid = bids[p.id] ?? 2;
    const trick = tricks[p.id] ?? 2;
    scores[p.id] = calculateCallbreakScore(bid, trick);
  });

  const newRound: CallbreakRound = {
    roundNumber,
    bids,
    tricks,
    scores,
  };

  const updatedRounds = [...game.rounds, newRound];
  const isFinished = updatedRounds.length >= 5;

  return {
    ...game,
    rounds: updatedRounds,
    status: isFinished ? 'completed' : 'active',
    endedAt: isFinished ? new Date().toISOString() : undefined,
  };
}
