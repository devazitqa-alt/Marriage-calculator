import { GamePlayer, LedgerEntry, RoundCalculationResult, RoundInput, RulesProfile } from '../types/marriage';

export function calculateRound(
  roundId: string,
  inputs: RoundInput[],
  players: GamePlayer[],
  profile: RulesProfile,
  pointRate: number
): RoundCalculationResult {
  const ledger: LedgerEntry[] = [];
  const netPoints: Record<string, number> = {};
  const explanations: Record<string, string[]> = {};

  // Initialize net points & explanation lists for all players
  players.forEach((p) => {
    netPoints[p.id] = 0;
    explanations[p.id] = [];
  });

  // Filter out sitting out players
  const sittingOutMap = new Map(players.map((p) => [p.id, p.isSittingOut]));
  const activeInputs = inputs.filter((inp) => !sittingOutMap.get(inp.gamePlayerId));
  const activePlayerMap = new Map(players.map((p) => [p.id, p]));

  // Find winner
  const winnerInput = activeInputs.find((inp) => inp.isWinner);
  const isDubleeWin = winnerInput?.isDublee || false;
  const dubleeMultiplier = isDubleeWin ? Math.max(1, profile.dubleeMultiplier) : 1;

  // Separate seen and unseen players
  const seenInputs = activeInputs.filter((inp) => inp.seenStatus === 'seen');
  const unseenInputs = activeInputs.filter((inp) => inp.seenStatus === 'unseen');

  // 1. Maal Exchange among all active players
  // In standard Marriage, all active players (including unseen) pay Maal to players who showed Maal.
  // Between two seen players, they exchange the difference (p1Maal - p2Maal).
  // An unseen player has 0 effective maal, so they pay each seen player's full maal amount.
  for (let i = 0; i < activeInputs.length; i++) {
    for (let j = i + 1; j < activeInputs.length; j++) {
      const p1 = activeInputs[i];
      const p2 = activeInputs[j];

      // Effective maal is 0 if player is unseen
      const p1Maal = p1.seenStatus === 'seen' ? Math.max(0, p1.maal || 0) : 0;
      const p2Maal = p2.seenStatus === 'seen' ? Math.max(0, p2.maal || 0) : 0;

      if (p1Maal > p2Maal) {
        const diff = p1Maal - p2Maal;
        ledger.push({
          id: `${roundId}-maal-${p2.gamePlayerId}-${p1.gamePlayerId}`,
          roundId,
          payerId: p2.gamePlayerId,
          receiverId: p1.gamePlayerId,
          amount: diff,
          reasonCode: 'MAAL_EXCHANGE',
          reasonDescription: `Maal difference: ${activePlayerMap.get(p1.gamePlayerId)?.displayName} (${p1Maal}) vs ${activePlayerMap.get(p2.gamePlayerId)?.displayName} (${p2Maal})`,
        });
      } else if (p2Maal > p1Maal) {
        const diff = p2Maal - p1Maal;
        ledger.push({
          id: `${roundId}-maal-${p1.gamePlayerId}-${p2.gamePlayerId}`,
          roundId,
          payerId: p1.gamePlayerId,
          receiverId: p2.gamePlayerId,
          amount: diff,
          reasonCode: 'MAAL_EXCHANGE',
          reasonDescription: `Maal difference: ${activePlayerMap.get(p2.gamePlayerId)?.displayName} (${p2Maal}) vs ${activePlayerMap.get(p1.gamePlayerId)?.displayName} (${p1Maal})`,
        });
      }
    }
  }

  // 2. Winner Base Collection (From non-winner seen players)
  if (winnerInput) {
    const baseWinAmount = profile.baseGamePoints * dubleeMultiplier;
    const nonWinnerSeen = seenInputs.filter((inp) => inp.gamePlayerId !== winnerInput.gamePlayerId);

    nonWinnerSeen.forEach((opp) => {
      if (baseWinAmount > 0) {
        ledger.push({
          id: `${roundId}-base-${opp.gamePlayerId}-${winnerInput.gamePlayerId}`,
          roundId,
          payerId: opp.gamePlayerId,
          receiverId: winnerInput.gamePlayerId,
          amount: baseWinAmount,
          reasonCode: isDubleeWin ? 'DUBLEE_BONUS' : 'WINNER_BASE',
          reasonDescription: isDubleeWin
            ? `Dublee winner base collection (${profile.baseGamePoints} × ${dubleeMultiplier})`
            : `Winner base game collection (${profile.baseGamePoints} pts)`,
        });
      }
    });

    // 3. Unseen Player Penalties
    const unseenPenaltyAmount = profile.unseenPenalty * dubleeMultiplier;
    unseenInputs.forEach((unseen) => {
      if (unseenPenaltyAmount > 0) {
        ledger.push({
          id: `${roundId}-unseen-${unseen.gamePlayerId}-${winnerInput.gamePlayerId}`,
          roundId,
          payerId: unseen.gamePlayerId,
          receiverId: winnerInput.gamePlayerId,
          amount: unseenPenaltyAmount,
          reasonCode: 'UNSEEN_PENALTY',
          reasonDescription: `Unseen (blind) penalty${isDubleeWin ? ' (Dublee x' + dubleeMultiplier + ')' : ''}`,
        });
      }

      // Kidnap / Murder Rule: Unseen player's raw maal is captured by winner!
      if (profile.kidnapUnseenMaal && (unseen.maal || 0) > 0) {
        ledger.push({
          id: `${roundId}-kidnap-${unseen.gamePlayerId}-${winnerInput.gamePlayerId}`,
          roundId,
          payerId: unseen.gamePlayerId,
          receiverId: winnerInput.gamePlayerId,
          amount: unseen.maal,
          reasonCode: 'KIDNAP_MAAL',
          reasonDescription: `Kidnapped/Murdered Maal confiscated by winner`,
        });
      }
    });
  }

  // 4. Foul / Penalty Check
  activeInputs.forEach((inp) => {
    if (inp.isFoul && profile.foulPenalty > 0) {
      if (profile.foulRecipient === 'winner' && winnerInput && winnerInput.gamePlayerId !== inp.gamePlayerId) {
        ledger.push({
          id: `${roundId}-foul-${inp.gamePlayerId}-${winnerInput.gamePlayerId}`,
          roundId,
          payerId: inp.gamePlayerId,
          receiverId: winnerInput.gamePlayerId,
          amount: profile.foulPenalty,
          reasonCode: 'FOUL_PENALTY',
          reasonDescription: `Foul penalty (${inp.foulReason || 'Misdeal / Wrong Show'})`,
        });
      } else {
        // Split evenly among all other active non-foul players
        const eligibleReceivers = activeInputs.filter(
          (other) => other.gamePlayerId !== inp.gamePlayerId && !other.isFoul
        );
        if (eligibleReceivers.length > 0) {
          const splitAmount = Math.round((profile.foulPenalty / eligibleReceivers.length) * 10) / 10;
          eligibleReceivers.forEach((rec) => {
            ledger.push({
              id: `${roundId}-foul-${inp.gamePlayerId}-${rec.gamePlayerId}`,
              roundId,
              payerId: inp.gamePlayerId,
              receiverId: rec.gamePlayerId,
              amount: splitAmount,
              reasonCode: 'FOUL_PENALTY',
              reasonDescription: `Foul penalty split table share`,
            });
          });
        }
      }
    }
  });

  // Calculate Net Points from ledger
  ledger.forEach((tx) => {
    netPoints[tx.receiverId] = (netPoints[tx.receiverId] || 0) + tx.amount;
    netPoints[tx.payerId] = (netPoints[tx.payerId] || 0) - tx.amount;
  });

  // Generate Explanations per player
  players.forEach((p) => {
    if (p.isSittingOut) {
      explanations[p.id].push('Sitting out — no points transferred.');
      return;
    }

    const inp = activeInputs.find((i) => i.gamePlayerId === p.id);
    if (!inp) return;

    const pReceived = ledger.filter((l) => l.receiverId === p.id);
    const pPaid = ledger.filter((l) => l.payerId === p.id);

    if (inp.isWinner) {
      explanations[p.id].push(`Winner declared${inp.isDublee ? ' (Dublee Win)' : ''}`);
    }
    explanations[p.id].push(`Status: ${inp.seenStatus.toUpperCase()} (Maal: ${inp.maal || 0})`);

    const maalDiff = pReceived
      .filter((l) => l.reasonCode === 'MAAL_EXCHANGE')
      .reduce((sum, l) => sum + l.amount, 0) -
      pPaid
        .filter((l) => l.reasonCode === 'MAAL_EXCHANGE')
        .reduce((sum, l) => sum + l.amount, 0);
    if (maalDiff !== 0) {
      explanations[p.id].push(`Maal exchange: ${maalDiff > 0 ? '+' : ''}${maalDiff} pts`);
    }

    const baseDiff = pReceived
      .filter((l) => l.reasonCode === 'WINNER_BASE' || l.reasonCode === 'DUBLEE_BONUS')
      .reduce((sum, l) => sum + l.amount, 0) -
      pPaid
        .filter((l) => l.reasonCode === 'WINNER_BASE' || l.reasonCode === 'DUBLEE_BONUS')
        .reduce((sum, l) => sum + l.amount, 0);
    if (baseDiff !== 0) {
      explanations[p.id].push(`Base game bonus/payment: ${baseDiff > 0 ? '+' : ''}${baseDiff} pts`);
    }

    const unseenDiff = pReceived
      .filter((l) => l.reasonCode === 'UNSEEN_PENALTY')
      .reduce((sum, l) => sum + l.amount, 0) -
      pPaid
        .filter((l) => l.reasonCode === 'UNSEEN_PENALTY')
        .reduce((sum, l) => sum + l.amount, 0);
    if (unseenDiff !== 0) {
      explanations[p.id].push(`Unseen penalty: ${unseenDiff > 0 ? '+' : ''}${unseenDiff} pts`);
    }

    const kidnapDiff = pReceived
      .filter((l) => l.reasonCode === 'KIDNAP_MAAL')
      .reduce((sum, l) => sum + l.amount, 0) -
      pPaid
        .filter((l) => l.reasonCode === 'KIDNAP_MAAL')
        .reduce((sum, l) => sum + l.amount, 0);
    if (kidnapDiff !== 0) {
      explanations[p.id].push(`Kidnap maal: ${kidnapDiff > 0 ? '+' : ''}${kidnapDiff} pts`);
    }

    const foulDiff = pReceived
      .filter((l) => l.reasonCode === 'FOUL_PENALTY')
      .reduce((sum, l) => sum + l.amount, 0) -
      pPaid
        .filter((l) => l.reasonCode === 'FOUL_PENALTY')
        .reduce((sum, l) => sum + l.amount, 0);
    if (foulDiff !== 0) {
      explanations[p.id].push(`Foul penalty: ${foulDiff > 0 ? '+' : ''}${foulDiff} pts`);
    }
  });

  // Calculate Net Money
  const netMoney: Record<string, number> = {};
  players.forEach((p) => {
    const rawMoney = (netPoints[p.id] || 0) * pointRate;
    netMoney[p.id] = Math.round(rawMoney * 100) / 100;
  });

  // Conservation check (Sum of net points must equal 0)
  const totalSum = Object.values(netPoints).reduce((acc, v) => acc + v, 0);
  const isConserved = Math.abs(totalSum) < 0.001;

  return {
    roundId,
    netPoints,
    netMoney,
    ledger,
    explanations,
    isConserved,
  };
}

export function validateRoundInputs(
  inputs: RoundInput[],
  players: GamePlayer[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const sittingOutMap = new Map(players.map((p) => [p.id, p.isSittingOut]));
  const activeInputs = inputs.filter((i) => !sittingOutMap.get(i.gamePlayerId));

  if (activeInputs.length < 2) {
    errors.push('At least 2 active players must be in the round.');
  }

  const winners = activeInputs.filter((i) => i.isWinner);
  if (winners.length > 1) {
    errors.push('Only 1 winner can be selected per round.');
  }

  // Negative maal check
  activeInputs.forEach((i) => {
    if (i.maal < 0) {
      const p = players.find((pl) => pl.id === i.gamePlayerId);
      errors.push(`${p?.displayName || 'Player'} cannot have negative Maal.`);
    }
  });

  // Winner must have status seen
  winners.forEach((w) => {
    if (w.seenStatus !== 'seen') {
      const p = players.find((pl) => pl.id === w.gamePlayerId);
      errors.push(`Winner (${p?.displayName}) must have Seen status.`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
