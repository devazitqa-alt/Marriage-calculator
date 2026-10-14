class Player {
  final String id;
  final String displayName;
  bool isSittingOut;

  Player({
    required this.id,
    required this.displayName,
    this.isSittingOut = false,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'displayName': displayName,
    'isSittingOut': isSittingOut,
  };

  factory Player.fromJson(Map<String, dynamic> json) => Player(
    id: json['id'],
    displayName: json['displayName'],
    isSittingOut: json['isSittingOut'] ?? false,
  );
}

class RoundInput {
  final String playerId;
  int maal;
  bool isSeen;
  bool isWinner;
  bool isDublee;
  bool isFoul;

  RoundInput({
    required this.playerId,
    this.maal = 0,
    this.isSeen = true,
    this.isWinner = false,
    this.isDublee = false,
    this.isFoul = false,
  });

  Map<String, dynamic> toJson() => {
    'playerId': playerId,
    'maal': maal,
    'isSeen': isSeen,
    'isWinner': isWinner,
    'isDublee': isDublee,
    'isFoul': isFoul,
  };

  factory RoundInput.fromJson(Map<String, dynamic> json) => RoundInput(
    playerId: json['playerId'],
    maal: json['maal'] ?? 0,
    isSeen: json['isSeen'] ?? true,
    isWinner: json['isWinner'] ?? false,
    isDublee: json['isDublee'] ?? false,
    isFoul: json['isFoul'] ?? false,
  );
}

class MarriageRound {
  final int roundNumber;
  final List<RoundInput> inputs;
  final Map<String, int> netPoints;
  final Map<String, double> netMoney;

  MarriageRound({
    required this.roundNumber,
    required this.inputs,
    required this.netPoints,
    required this.netMoney,
  });

  Map<String, dynamic> toJson() => {
    'roundNumber': roundNumber,
    'inputs': inputs.map((i) => i.toJson()).toList(),
    'netPoints': netPoints,
    'netMoney': netMoney,
  };

  factory MarriageRound.fromJson(Map<String, dynamic> json) => MarriageRound(
    roundNumber: json['roundNumber'],
    inputs: (json['inputs'] as List).map((i) => RoundInput.fromJson(i)).toList(),
    netPoints: Map<String, int>.from(json['netPoints']),
    netMoney: Map<String, double>.from(json['netMoney']),
  );
}
