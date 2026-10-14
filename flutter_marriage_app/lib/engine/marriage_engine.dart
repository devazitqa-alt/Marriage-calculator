import '../models/marriage_models.dart';

class MarriageEngine {
  static MarriageRound calculateRound({
    required int roundNumber,
    required List<Player> players,
    required List<RoundInput> inputs,
    double pointRate = 5.0,
    int unseenPenalty = 10,
    int baseGamePoints = 0,
  }) {
    final Map<String, int> netPoints = {};
    for (var p in players) {
      netPoints[p.id] = 0;
    }

    final activePlayers = players.where((p) => !p.isSittingOut).toList();
    final activeInputs = inputs.where((i) {
      final p = players.firstWhere((pl) => pl.id == i.playerId);
      return !p.isSittingOut;
    }).toList();

    RoundInput? winnerInput;
    for (var i in activeInputs) {
      if (i.isWinner) {
        winnerInput = i;
        break;
      }
    }

    // 1. Maal exchange: active players exchange hand Maal
    for (int i = 0; i < activeInputs.length; i++) {
      for (int j = i + 1; j < activeInputs.length; j++) {
        final p1 = activeInputs[i];
        final p2 = activeInputs[j];

        final p1Maal = p1.isSeen ? p1.maal : 0;
        final p2Maal = p2.isSeen ? p2.maal : 0;

        if (p1Maal > p2Maal) {
          final diff = p1Maal - p2Maal;
          netPoints[p1.playerId] = (netPoints[p1.playerId] ?? 0) + diff;
          netPoints[p2.playerId] = (netPoints[p2.playerId] ?? 0) - diff;
        } else if (p2Maal > p1Maal) {
          final diff = p2Maal - p1Maal;
          netPoints[p2.playerId] = (netPoints[p2.playerId] ?? 0) + diff;
          netPoints[p1.playerId] = (netPoints[p1.playerId] ?? 0) - diff;
        }
      }
    }

    // 2. Unseen penalty (default 10 to winner)
    if (winnerInput != null) {
      final unseenInputs = activeInputs.where((i) => !i.isSeen).toList();
      for (var u in unseenInputs) {
        netPoints[u.playerId] = (netPoints[u.playerId] ?? 0) - unseenPenalty;
        netPoints[winnerInput.playerId] = (netPoints[winnerInput.playerId] ?? 0) + unseenPenalty;
      }

      // Base points from seen players
      if (baseGamePoints > 0) {
        final seenNonWinners = activeInputs.where((i) => i.isSeen && !i.isWinner).toList();
        for (var snw in seenNonWinners) {
          netPoints[snw.playerId] = (netPoints[snw.playerId] ?? 0) - baseGamePoints;
          netPoints[winnerInput.playerId] = (netPoints[winnerInput.playerId] ?? 0) + baseGamePoints;
        }
      }
    }

    final Map<String, double> netMoney = {};
    for (var p in players) {
      final pts = netPoints[p.id] ?? 0;
      netMoney[p.id] = (pts * pointRate).roundToDouble();
    }

    return MarriageRound(
      roundNumber: roundNumber,
      inputs: inputs,
      netPoints: netPoints,
      netMoney: netMoney,
    );
  }
}
