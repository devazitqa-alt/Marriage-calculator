import 'package:flutter/material.dart';
import '../models/marriage_models.dart';

class NewGameDialog extends StatefulWidget {
  final List<Player> currentPlayers;
  final Function(List<Player>, double) onStart;

  const NewGameDialog({
    super.key,
    required this.currentPlayers,
    required this.onStart,
  });

  @override
  State<NewGameDialog> createState() => _NewGameDialogState();
}

class _NewGameDialogState extends State<NewGameDialog> {
  late List<Player> players;
  final TextEditingController nameController = TextEditingController();
  double pointRate = 5.0;

  @override
  void initState() {
    super.initState();
    players = List.from(widget.currentPlayers);
  }

  void _addPlayer() {
    if (nameController.text.trim().isEmpty) return;
    setState(() {
      players.add(Player(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        displayName: nameController.text.trim(),
      ));
      nameController.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Container(
        padding: const EdgeInsets.all(16),
        constraints: const BoxConstraints(maxWidth: 400),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'New Table Setup',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: nameController,
                    decoration: const InputDecoration(
                      labelText: 'Player Name',
                      border: OutlineInputBorder(),
                      contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: _addPlayer,
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFD32F2F), foregroundColor: Colors.white),
                  child: const Text('Add'),
                ),
              ],
            ),
            const SizedBox(height: 12),
            SizedBox(
              height: 160,
              child: ListView.builder(
                itemCount: players.length,
                itemBuilder: (context, i) {
                  final p = players[i];
                  return ListTile(
                    dense: true,
                    title: Text(p.displayName, style: const TextStyle(fontWeight: FontWeight.bold)),
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        TextButton(
                          onPressed: () {
                            setState(() {
                              p.isSittingOut = !p.isSittingOut;
                            });
                          },
                          child: Text(p.isSittingOut ? 'Sitting Out' : 'Active'),
                        ),
                        if (players.length > 2)
                          IconButton(
                            icon: const Icon(Icons.delete, size: 16, color: Colors.red),
                            onPressed: () {
                              setState(() {
                                players.removeAt(i);
                              });
                            },
                          ),
                      ],
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 12),
            ElevatedButton(
              onPressed: () {
                widget.onStart(players, pointRate);
                Navigator.of(context).pop();
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFD32F2F),
                foregroundColor: Colors.white,
                minimumSize: const Size.fromHeight(42),
              ),
              child: const Text('Start Game', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }
}
