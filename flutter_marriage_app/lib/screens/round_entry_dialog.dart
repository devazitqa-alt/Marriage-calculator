import 'package:flutter/material.dart';
import '../models/marriage_models.dart';
import '../engine/marriage_engine.dart';

class RoundEntryDialog extends StatefulWidget {
  final List<Player> players;
  final int roundNumber;
  final double pointRate;
  final Function(MarriageRound) onSave;

  const RoundEntryDialog({
    super.key,
    required this.players,
    required this.roundNumber,
    required this.pointRate,
    required this.onSave,
  });

  @override
  State<RoundEntryDialog> createState() => _RoundEntryDialogState();
}

class _RoundEntryDialogState extends State<RoundEntryDialog> {
  late List<RoundInput> inputs;

  @override
  void initState() {
    super.initState();
    inputs = widget.players.map((p) {
      final isFirst = widget.players.indexOf(p) == 0;
      return RoundInput(
        playerId: p.id,
        maal: 0,
        isSeen: true,
        isWinner: isFirst,
        isDublee: false,
        isFoul: false,
      );
    }).toList();
  }

  void _setWinner(String playerId) {
    setState(() {
      for (var i in inputs) {
        if (i.playerId == playerId) {
          i.isWinner = true;
          i.isSeen = true;
        } else {
          i.isWinner = false;
          i.isDublee = false;
        }
      }
    });
  }

  MarriageRound get previewRound {
    return MarriageEngine.calculateRound(
      roundNumber: widget.roundNumber,
      players: widget.players,
      inputs: inputs,
      pointRate: widget.pointRate,
    );
  }

  @override
  Widget build(BuildContext context) {
    final preview = previewRound;

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Container(
        padding: const EdgeInsets.all(16),
        constraints: const BoxConstraints(maxWidth: 480, maxHeight: 600),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Record Round #${widget.roundNumber}',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),
            const Divider(),
            Expanded(
              child: ListView.separated(
                itemCount: widget.players.length,
                separatorBuilder: (_, __) => const SizedBox(height: 8),
                itemBuilder: (context, index) {
                  final player = widget.players[index];
                  final input = inputs.firstWhere((i) => i.playerId == player.id);
                  final netPts = preview.netPoints[player.id] ?? 0;

                  if (player.isSittingOut) {
                    return ListTile(
                      title: Text(player.displayName),
                      subtitle: const Text('Sitting out (No scoring)', style: TextStyle(fontStyle: FontStyle.italic)),
                    );
                  }

                  return Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: input.isWinner ? Colors.amber.shade50 : Colors.grey.shade50,
                      border: Border.all(
                        color: input.isWinner ? Colors.amber.shade400 : Colors.grey.shade300,
                        width: input.isWinner ? 2 : 1,
                      ),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                IconButton(
                                  icon: Icon(
                                    input.isWinner ? Icons.emoji_events : Icons.emoji_events_outlined,
                                    color: input.isWinner ? Colors.amber.shade700 : Colors.grey,
                                  ),
                                  onPressed: () => _setWinner(player.id),
                                ),
                                Text(
                                  player.displayName,
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                ),
                              ],
                            ),
                            Row(
                              children: [
                                ActionChip(
                                  label: Text(input.isSeen ? 'SEEN' : 'UNSEEN', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                                  backgroundColor: input.isSeen ? Colors.green.shade100 : Colors.grey.shade200,
                                  onPressed: input.isWinner
                                      ? null
                                      : () {
                                          setState(() {
                                            input.isSeen = !input.isSeen;
                                          });
                                        },
                                ),
                                const SizedBox(width: 6),
                                Text(
                                  '${netPts > 0 ? '+' : ''}$netPts pts',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: netPts > 0 ? Colors.green.shade800 : (netPts < 0 ? Colors.red.shade800 : Colors.black),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                const Text('Maal: ', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                IconButton(
                                  icon: const Icon(Icons.remove, size: 16),
                                  onPressed: () {
                                    setState(() {
                                      if (input.maal > 0) input.maal--;
                                    });
                                  },
                                ),
                                Text('${input.maal}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                                IconButton(
                                  icon: const Icon(Icons.add, size: 16),
                                  onPressed: () {
                                    setState(() {
                                      input.maal++;
                                    });
                                  },
                                ),
                              ],
                            ),
                            Wrap(
                              spacing: 4,
                              children: [
                                for (var step in [2, 3, 5, 10])
                                  InkWell(
                                    onTap: () {
                                      setState(() {
                                        input.maal += step;
                                      });
                                    },
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: Colors.white,
                                        border: Border.all(color: Colors.grey.shade300),
                                        borderRadius: BorderRadius.circular(4),
                                      ),
                                      child: Text('+$step', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                                    ),
                                  ),
                              ],
                            ),
                          ],
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 10),
            ElevatedButton(
              onPressed: () {
                widget.onSave(preview);
                Navigator.of(context).pop();
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFD32F2F),
                foregroundColor: Colors.white,
                minimumSize: const Size.fromHeight(44),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              child: const Text('Save Round', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }
}
