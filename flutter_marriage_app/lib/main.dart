import 'package:flutter/material.dart';
import 'models/marriage_models.dart';
import 'engine/marriage_engine.dart';
import 'screens/round_entry_dialog.dart';

void main() {
  runApp(const MarriageCalculatorApp());
}

class MarriageCalculatorApp extends StatelessWidget {
  const MarriageCalculatorApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Marriage Point Calculator',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFFD32F2F),
          primary: const Color(0xFFD32F2F),
        ),
        scaffoldBackgroundColor: const Color(0xFFF4F5F7),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFFD32F2F),
          foregroundColor: Colors.white,
          elevation: 2,
        ),
      ),
      home: const ScoreboardScreen(),
    );
  }
}

class ScoreboardScreen extends StatefulWidget {
  const ScoreboardScreen({super.key});

  @override
  State<ScoreboardScreen> createState() => _ScoreboardScreenState();
}

class _ScoreboardScreenState extends State<ScoreboardScreen> {
  final List<Player> players = [
    Player(id: '1', displayName: 'Ram'),
    Player(id: '2', displayName: 'Shya.'),
    Player(id: '3', displayName: 'Hari'),
    Player(id: '4', displayName: 'Gopa.'),
    Player(id: '5', displayName: 'Moha.'),
  ];

  final double pointRate = 5.0;
  final String currency = '\$';
  final List<MarriageRound> rounds = [];

  @override
  void initState() {
    super.initState();
    _seedDefaultRounds();
  }

  void _seedDefaultRounds() {
    // Round 1
    rounds.add(MarriageEngine.calculateRound(
      roundNumber: 1,
      players: players,
      pointRate: pointRate,
      inputs: [
        RoundInput(playerId: '1', maal: 4, isSeen: true, isWinner: true),
        RoundInput(playerId: '2', maal: 0, isSeen: false),
        RoundInput(playerId: '3', maal: 0, isSeen: false),
        RoundInput(playerId: '4', maal: 0, isSeen: false),
        RoundInput(playerId: '5', maal: 0, isSeen: false),
      ],
    ));

    // Round 2
    rounds.add(MarriageEngine.calculateRound(
      roundNumber: 2,
      players: players,
      pointRate: pointRate,
      inputs: [
        RoundInput(playerId: '1', maal: 3, isSeen: true, isWinner: true),
        RoundInput(playerId: '2', maal: 6, isSeen: true),
        RoundInput(playerId: '3', maal: 0, isSeen: false),
        RoundInput(playerId: '4', maal: 0, isSeen: false),
        RoundInput(playerId: '5', maal: 0, isSeen: false),
      ],
    ));

    // Round 3
    players[4].isSittingOut = true;
    rounds.add(MarriageEngine.calculateRound(
      roundNumber: 3,
      players: players,
      pointRate: pointRate,
      inputs: [
        RoundInput(playerId: '1', maal: 0, isSeen: true, isWinner: true),
        RoundInput(playerId: '2', maal: 4, isSeen: true, isDublee: true),
        RoundInput(playerId: '3', maal: 0, isSeen: true, isFoul: true),
        RoundInput(playerId: '4', maal: 0, isSeen: false),
        RoundInput(playerId: '5', maal: 0, isSeen: false),
      ],
    ));
  }

  MarriageRound get latestRound => rounds.last;

  int get latestTotalMaal {
    return latestRound.inputs.fold(0, (sum, i) => sum + i.maal);
  }

  Map<String, int> get cumulativePoints {
    final map = <String, int>{};
    for (var p in players) {
      map[p.id] = 0;
    }
    for (var r in rounds) {
      r.netPoints.forEach((k, v) {
        map[k] = (map[k] ?? 0) + v;
      });
    }
    return map;
  }

  Map<String, double> get cumulativeMoney {
    final map = <String, double>{};
    for (var p in players) {
      map[p.id] = 0.0;
    }
    for (var r in rounds) {
      r.netMoney.forEach((k, v) {
        map[k] = (map[k] ?? 0.0) + v;
      });
    }
    return map;
  }

  String _getStatusBadge(RoundInput? input, bool isSittingOut) {
    if (isSittingOut) return '⏳';
    if (input == null) return '';
    if (input.isWinner) return '👑';
    if (input.isDublee) return '🎴';
    if (input.isFoul) return '🚩';
    if (!input.isSeen) return '👁️‍🗨️';
    return '👁️';
  }

  void _openRoundEntry() {
    showDialog(
      context: context,
      builder: (ctx) => RoundEntryDialog(
        players: players,
        roundNumber: rounds.length + 1,
        pointRate: pointRate,
        onSave: (newRound) {
          setState(() {
            rounds.add(newRound);
          });
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final totals = cumulativePoints;
    final totalAmts = cumulativeMoney;

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Score Board',
          style: TextStyle(fontWeight: FontWeight.bold, fontFamily: 'serif'),
        ),
        centerTitle: true,
        leading: Padding(
          padding: const EdgeInsets.only(left: 8.0, top: 10.0, bottom: 10.0),
          child: ElevatedButton(
            onPressed: () {},
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.white,
              foregroundColor: const Color(0xFFD32F2F),
              padding: const EdgeInsets.symmetric(horizontal: 8),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
            ),
            child: const Text('Stream', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
          ),
        ),
        actions: [
          IconButton(icon: const Icon(Icons.info_outline), onPressed: () {}),
          IconButton(icon: const Icon(Icons.home), onPressed: () {}),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          children: [
            // Current Round Card
            Card(
              elevation: 1,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              clipBehavior: Clip.antiAlias,
              child: Column(
                children: [
                  Container(
                    color: const Color(0xFFD32F2F),
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Round - ${latestRound.roundNumber}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                        Text('Total Maal: $latestTotalMaal', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                  Table(
                    border: TableBorder.all(color: Colors.grey.shade300),
                    children: [
                      // Header Row
                      TableRow(
                        decoration: const BoxDecoration(color: Color(0xFFD32F2F)),
                        children: [
                          const TableCell(child: Padding(padding: EdgeInsets.all(6.0), child: Text('Names', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11)))),
                          ...players.map((p) => TableCell(child: Padding(padding: const EdgeInsets.all(6.0), child: Text(p.displayName, textAlign: TextAlign.center, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11))))),
                        ],
                      ),
                      // Maal Row
                      TableRow(
                        children: [
                          const TableCell(child: Padding(padding: EdgeInsets.all(6.0), child: Text('Maal', style: TextStyle(fontSize: 11)))),
                          ...players.map((p) {
                            final inp = latestRound.inputs.firstWhere((i) => i.playerId == p.id);
                            final badge = _getStatusBadge(inp, p.isSittingOut);
                            return TableCell(
                              child: Padding(
                                padding: const EdgeInsets.all(6.0),
                                child: Text('${inp.maal} $badge', textAlign: TextAlign.center, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                              ),
                            );
                          }),
                        ],
                      ),
                      // Total Points Row
                      TableRow(
                        children: [
                          const TableCell(child: Padding(padding: EdgeInsets.all(6.0), child: Text('Total Points', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)))),
                          ...players.map((p) {
                            final pts = latestRound.netPoints[p.id] ?? 0;
                            final color = pts > 0 ? Colors.green.shade800 : (pts < 0 ? Colors.red.shade800 : Colors.black);
                            return TableCell(
                              child: Padding(
                                padding: const EdgeInsets.all(6.0),
                                child: Text('$pts', textAlign: TextAlign.center, style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: color)),
                              ),
                            );
                          }),
                        ],
                      ),
                      // Total Amt Row (Light mint green)
                      TableRow(
                        decoration: BoxDecoration(color: Colors.green.shade50),
                        children: [
                          TableCell(child: Padding(padding: const EdgeInsets.all(6.0), child: Text('$currency ${pointRate.toInt()}/pt\nTotal Amt', style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold)))),
                          ...players.map((p) {
                            final amt = latestRound.netMoney[p.id] ?? 0.0;
                            final color = amt > 0 ? Colors.green.shade800 : (amt < 0 ? Colors.red.shade800 : Colors.black);
                            return TableCell(
                              child: Padding(
                                padding: const EdgeInsets.all(6.0),
                                child: Text('${amt.toInt()}', textAlign: TextAlign.center, style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: color)),
                              ),
                            );
                          }),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 12),

            // Middle Action Buttons
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.sync_alt, size: 14, color: Color(0xFFD32F2F)),
                    label: const Text('Transfer Host', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFFD32F2F))),
                    style: OutlinedButton.styleFrom(side: const BorderSide(color: Color(0xFFD32F2F))),
                  ),
                ),
                const SizedBox(width: 6),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.person_add, size: 14, color: Color(0xFFD32F2F)),
                    label: const Text('Add Player', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFFD32F2F))),
                    style: OutlinedButton.styleFrom(side: const BorderSide(color: Color(0xFFD32F2F))),
                  ),
                ),
                const SizedBox(width: 6),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.share, size: 14, color: Color(0xFFD32F2F)),
                    label: const Text('Share Score', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFFD32F2F))),
                    style: OutlinedButton.styleFrom(side: const BorderSide(color: Color(0xFFD32F2F))),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 12),

            // All Games Card
            Card(
              elevation: 1,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              clipBehavior: Clip.antiAlias,
              child: Column(
                children: [
                  Container(
                    color: const Color(0xFFD32F2F),
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('All Games', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                        Text('🔪 Murder', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11)),
                      ],
                    ),
                  ),
                  Table(
                    border: TableBorder.all(color: Colors.grey.shade300),
                    children: [
                      TableRow(
                        decoration: const BoxDecoration(color: Color(0xFFD32F2F)),
                        children: [
                          const TableCell(child: Padding(padding: EdgeInsets.all(6.0), child: Text('Round', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11)))),
                          ...players.map((p) => TableCell(child: Padding(padding: const EdgeInsets.all(6.0), child: Text(p.displayName, textAlign: TextAlign.center, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11))))),
                        ],
                      ),
                      ...rounds.map((r) {
                        return TableRow(
                          children: [
                            TableCell(child: Padding(padding: const EdgeInsets.all(6.0), child: Row(children: [const Icon(Icons.edit, size: 11), const SizedBox(width: 2), Text('${r.roundNumber}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold))]))),
                            ...players.map((p) {
                              final pts = r.netPoints[p.id] ?? 0;
                              final inp = r.inputs.firstWhere((i) => i.playerId == p.id);
                              final badge = _getStatusBadge(inp, p.isSittingOut && r.roundNumber == 3);
                              final color = pts > 0 ? Colors.green.shade800 : (pts < 0 ? Colors.red.shade800 : Colors.black);
                              return TableCell(
                                child: Padding(
                                  padding: const EdgeInsets.all(6.0),
                                  child: Text('$pts $badge', textAlign: TextAlign.center, style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: color)),
                                ),
                              );
                            }),
                          ],
                        );
                      }),
                      // Cumulative Total Points
                      TableRow(
                        children: [
                          const TableCell(child: Padding(padding: EdgeInsets.all(6.0), child: Text('Total Points', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)))),
                          ...players.map((p) {
                            final pts = totals[p.id] ?? 0;
                            final color = pts > 0 ? Colors.green.shade800 : (pts < 0 ? Colors.red.shade800 : Colors.black);
                            return TableCell(child: Padding(padding: const EdgeInsets.all(6.0), child: Text('$pts', textAlign: TextAlign.center, style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: color))));
                          }),
                        ],
                      ),
                      // Cumulative Total Amt
                      TableRow(
                        decoration: BoxDecoration(color: Colors.green.shade50),
                        children: [
                          TableCell(child: Padding(padding: const EdgeInsets.all(6.0), child: Text('$currency ${pointRate.toInt()}/pt\nTotal Amt', style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold)))),
                          ...players.map((p) {
                            final amt = totalAmts[p.id] ?? 0.0;
                            final color = amt > 0 ? Colors.green.shade800 : (amt < 0 ? Colors.red.shade800 : Colors.black);
                            return TableCell(child: Padding(padding: const EdgeInsets.all(6.0), child: Text('${amt.toInt()}', textAlign: TextAlign.center, style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: color))));
                          }),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Bottom Buttons
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: _openRoundEntry,
                    icon: const Icon(Icons.chevron_left, color: Colors.white),
                    label: const Text('Edit Previous', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                    style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFD32F2F), padding: const EdgeInsets.symmetric(vertical: 12)),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: _openRoundEntry,
                    label: const Text('Next Game', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                    icon: const Icon(Icons.chevron_right, color: Colors.white),
                    style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFD32F2F), padding: const EdgeInsets.symmetric(vertical: 12)),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
