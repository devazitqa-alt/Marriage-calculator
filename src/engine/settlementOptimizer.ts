import { Currency, SettlementTransfer } from '../types/marriage';

/**
 * Optimizes debt settlement so that players can settle money in the fewest transactions possible.
 * Uses a greedy matching algorithm: highest debtor pays highest creditor.
 */
export function calculateSettlement(
  netBalances: { playerId: string; playerName: string; balance: number }[],
  currency: Currency
): SettlementTransfer[] {
  // Separate into debtors (balance < -0.01) and creditors (balance > 0.01)
  const debtors = netBalances
    .filter((p) => p.balance < -0.009)
    .map((p) => ({ ...p, remaining: Math.abs(p.balance) }))
    .sort((a, b) => b.remaining - a.remaining);

  const creditors = netBalances
    .filter((p) => p.balance > 0.009)
    .map((p) => ({ ...p, remaining: p.balance }))
    .sort((a, b) => b.remaining - a.remaining);

  const transfers: SettlementTransfer[] = [];

  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const amount = Math.min(debtor.remaining, creditor.remaining);
    const roundedAmount = Math.round(amount * 100) / 100;

    if (roundedAmount > 0) {
      transfers.push({
        fromPlayerId: debtor.playerId,
        fromPlayerName: debtor.playerName,
        toPlayerId: creditor.playerId,
        toPlayerName: creditor.playerName,
        amount: roundedAmount,
        currency,
      });
    }

    debtor.remaining -= amount;
    creditor.remaining -= amount;

    if (debtor.remaining < 0.009) {
      dIdx++;
    }
    if (creditor.remaining < 0.009) {
      cIdx++;
    }
  }

  return transfers;
}
