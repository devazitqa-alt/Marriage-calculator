import { AuditEvent, CallbreakGame, Game, Player, PlayerGroup, RulesProfile } from '../types/marriage';

const STORAGE_KEYS = {
  GAMES: 'mpc_games_v1',
  PLAYERS: 'mpc_players_v1',
  GROUPS: 'mpc_groups_v1',
  RULES: 'mpc_rules_v1',
  ACTIVE_GAME_ID: 'mpc_active_game_id_v1',
  CALLBREAK_GAMES: 'mpc_callbreak_games_v1',
  SOUND_ENABLED: 'mpc_sound_enabled_v1',
  DARK_MODE: 'mpc_dark_mode_v1',
};

export const PRESET_RULES: RulesProfile[] = [
  {
    id: 'preset-murder-kidnap',
    name: 'Murder',
    version: 1,
    description: 'Classic Nepali Murder table: 10 pts unseen penalty, unseen players pay hand maal to all who held maal.',
    isPreset: true,
    baseGamePoints: 0,
    unseenPenalty: 10,
    dubleeMultiplier: 2,
    kidnapUnseenMaal: true,
    foulPenalty: 15,
    foulRecipient: 'winner',
    sittingOutParticipates: false,
  },
  {
    id: 'preset-ktm-standard',
    name: 'Kathmandu Standard',
    version: 1,
    description: '3 pts winner base, 10 pts unseen penalty, standard maal exchange.',
    isPreset: true,
    baseGamePoints: 3,
    unseenPenalty: 10,
    dubleeMultiplier: 2,
    kidnapUnseenMaal: false,
    foulPenalty: 15,
    foulRecipient: 'winner',
    sittingOutParticipates: false,
  },
  {
    id: 'preset-high-stakes',
    name: 'High Stakes Dublee',
    version: 1,
    description: '5 pts base, 15 unseen penalty, 3x dublee bonus, 25 pts misdeal penalty.',
    isPreset: true,
    baseGamePoints: 5,
    unseenPenalty: 15,
    dubleeMultiplier: 3,
    kidnapUnseenMaal: true,
    foulPenalty: 25,
    foulRecipient: 'split_table',
    sittingOutParticipates: false,
  },
  {
    id: 'preset-gentle',
    name: 'Gentle / Family Table',
    version: 1,
    description: 'Relaxed stakes: 2 pts base, 5 pts unseen penalty, no kidnap.',
    isPreset: true,
    baseGamePoints: 2,
    unseenPenalty: 5,
    dubleeMultiplier: 1.5,
    kidnapUnseenMaal: false,
    foulPenalty: 10,
    foulRecipient: 'winner',
    sittingOutParticipates: false,
  },
];

export const StorageService = {
  getGames(): Game[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GAMES);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveGames(games: Game[]): void {
    localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(games));
  },

  getGame(id: string): Game | undefined {
    return this.getGames().find((g) => g.id === id);
  },

  saveGame(game: Game): void {
    const games = this.getGames();
    const idx = games.findIndex((g) => g.id === game.id);
    if (idx >= 0) {
      games[idx] = game;
    } else {
      games.unshift(game);
    }
    this.saveGames(games);
    if (game.status === 'active') {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_GAME_ID, game.id);
    }
  },

  deleteGame(id: string): void {
    const games = this.getGames().filter((g) => g.id !== id);
    this.saveGames(games);
    if (localStorage.getItem(STORAGE_KEYS.ACTIVE_GAME_ID) === id) {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_GAME_ID);
    }
  },

  getActiveGame(): Game | undefined {
    const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_GAME_ID);
    if (!activeId) {
      // Find latest active game
      return this.getGames().find((g) => g.status === 'active');
    }
    const game = this.getGame(activeId);
    if (game && game.status === 'active') return game;
    return this.getGames().find((g) => g.status === 'active');
  },

  setActiveGameId(id: string | null): void {
    if (id) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_GAME_ID, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_GAME_ID);
    }
  },

  // Players
  getPlayers(): Player[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PLAYERS);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  savePlayers(players: Player[]): void {
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
  },

  addPlayer(displayName: string): Player {
    const players = this.getPlayers();
    const newPlayer: Player = {
      id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      displayName: displayName.trim(),
      createdAt: new Date().toISOString(),
    };
    players.push(newPlayer);
    this.savePlayers(players);
    return newPlayer;
  },

  // Groups
  getGroups(): PlayerGroup[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GROUPS);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveGroups(groups: PlayerGroup[]): void {
    localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
  },

  // Rules profiles
  getRulesProfiles(): RulesProfile[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RULES);
      if (!data) return PRESET_RULES;
      const custom = JSON.parse(data) as RulesProfile[];
      return [...PRESET_RULES, ...custom];
    } catch {
      return PRESET_RULES;
    }
  },

  saveCustomRule(profile: RulesProfile): void {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RULES);
      const custom: RulesProfile[] = data ? JSON.parse(data) : [];
      const idx = custom.findIndex((r) => r.id === profile.id);
      if (idx >= 0) {
        custom[idx] = profile;
      } else {
        custom.push(profile);
      }
      localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(custom));
    } catch (e) {
      console.error(e);
    }
  },

  deleteCustomRule(id: string): void {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RULES);
      if (!data) return;
      const custom: RulesProfile[] = JSON.parse(data);
      const filtered = custom.filter((r) => r.id !== id);
      localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(filtered));
    } catch (e) {
      console.error(e);
    }
  },

  // Callbreak Games
  getCallbreakGames(): CallbreakGame[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CALLBREAK_GAMES);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveCallbreakGame(game: CallbreakGame): void {
    const list = this.getCallbreakGames();
    const idx = list.findIndex((g) => g.id === game.id);
    if (idx >= 0) {
      list[idx] = game;
    } else {
      list.unshift(game);
    }
    localStorage.setItem(STORAGE_KEYS.CALLBREAK_GAMES, JSON.stringify(list));
  },

  // Full Backup and Transfer
  exportAllData(): string {
    const backup = {
      app: 'MarriagePointCalculator',
      version: 1,
      exportedAt: new Date().toISOString(),
      games: this.getGames(),
      players: this.getPlayers(),
      groups: this.getGroups(),
      customRules: (() => {
        try {
          return JSON.parse(localStorage.getItem(STORAGE_KEYS.RULES) || '[]');
        } catch {
          return [];
        }
      })(),
      callbreakGames: this.getCallbreakGames(),
    };
    return JSON.stringify(backup, null, 2);
  },

  importData(jsonString: string, mode: 'merge' | 'replace'): { success: boolean; message: string; stats?: any } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.app || parsed.app !== 'MarriagePointCalculator') {
        return { success: false, message: 'Invalid backup file: Unrecognized application identifier.' };
      }

      if (mode === 'replace') {
        if (Array.isArray(parsed.games)) this.saveGames(parsed.games);
        if (Array.isArray(parsed.players)) this.savePlayers(parsed.players);
        if (Array.isArray(parsed.groups)) this.saveGroups(parsed.groups);
        if (Array.isArray(parsed.customRules)) localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(parsed.customRules));
        if (Array.isArray(parsed.callbreakGames)) localStorage.setItem(STORAGE_KEYS.CALLBREAK_GAMES, JSON.stringify(parsed.callbreakGames));
      } else {
        // Merge mode
        const existingGames = this.getGames();
        const incomingGames: Game[] = parsed.games || [];
        const gameMap = new Map(existingGames.map((g) => [g.id, g]));
        incomingGames.forEach((g) => gameMap.set(g.id, g));
        this.saveGames(Array.from(gameMap.values()));

        const existingPlayers = this.getPlayers();
        const incomingPlayers: Player[] = parsed.players || [];
        const playerMap = new Map(existingPlayers.map((p) => [p.id, p]));
        incomingPlayers.forEach((p) => playerMap.set(p.id, p));
        this.savePlayers(Array.from(playerMap.values()));

        const existingGroups = this.getGroups();
        const incomingGroups: PlayerGroup[] = parsed.groups || [];
        const groupMap = new Map(existingGroups.map((g) => [g.id, g]));
        incomingGroups.forEach((g) => groupMap.set(g.id, g));
        this.saveGroups(Array.from(groupMap.values()));
      }

      return {
        success: true,
        message: 'Data successfully restored!',
        stats: {
          games: parsed.games?.length || 0,
          players: parsed.players?.length || 0,
        },
      };
    } catch (e: any) {
      return { success: false, message: `Failed to parse backup: ${e.message}` };
    }
  },

  initializeDefaultsIfEmpty(): void {
    if (this.getPlayers().length === 0 || this.getGames().length === 0) {
      const defaultPlayers: Player[] = [
        { id: 'p-ram', displayName: 'Ram', createdAt: new Date().toISOString() },
        { id: 'p-shya', displayName: 'Shya.', createdAt: new Date().toISOString() },
        { id: 'p-hari', displayName: 'Hari', createdAt: new Date().toISOString() },
        { id: 'p-gopa', displayName: 'Gopa.', createdAt: new Date().toISOString() },
        { id: 'p-moha', displayName: 'Moha.', createdAt: new Date().toISOString() },
      ];
      this.savePlayers(defaultPlayers);

      const defaultGroup: PlayerGroup = {
        id: 'group-regulars',
        name: 'Regular Table',
        playerIds: ['p-ram', 'p-shya', 'p-hari', 'p-gopa', 'p-moha'],
        createdAt: new Date().toISOString(),
      };
      this.saveGroups([defaultGroup]);

      // Seed the exact game from the reference screenshot
      const sampleGame: Game = {
        id: 'game-sample-screenshot',
        title: 'Marriage Score Board',
        startedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        status: 'active',
        rulesProfile: PRESET_RULES[0], // Murder
        currency: '$',
        pointRate: 5.0,
        players: [
          { id: 'gp-1', playerId: 'p-ram', displayName: 'Ram', seatOrder: 0, isSittingOut: false },
          { id: 'gp-2', playerId: 'p-shya', displayName: 'Shya.', seatOrder: 1, isSittingOut: false },
          { id: 'gp-3', playerId: 'p-hari', displayName: 'Hari', seatOrder: 2, isSittingOut: false },
          { id: 'gp-4', playerId: 'p-gopa', displayName: 'Gopa.', seatOrder: 3, isSittingOut: false },
          { id: 'gp-5', playerId: 'p-moha', displayName: 'Moha.', seatOrder: 4, isSittingOut: false },
        ],
        rounds: [
          {
            id: 'r-screenshot-1',
            gameId: 'game-sample-screenshot',
            roundNumber: 1,
            createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
            savedAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
            winnerGamePlayerId: 'gp-1',
            inputs: [
              { gamePlayerId: 'gp-1', maal: 4, seenStatus: 'seen', isWinner: true, isDublee: false, isFoul: false },
              { gamePlayerId: 'gp-2', maal: 0, seenStatus: 'unseen', isWinner: false, isDublee: false, isFoul: false },
              { gamePlayerId: 'gp-3', maal: 0, seenStatus: 'unseen', isWinner: false, isDublee: false, isFoul: false },
              { gamePlayerId: 'gp-4', maal: 0, seenStatus: 'unseen', isWinner: false, isDublee: false, isFoul: false },
              { gamePlayerId: 'gp-5', maal: 0, seenStatus: 'unseen', isWinner: false, isDublee: false, isFoul: false },
            ],
            ledger: [
              { id: 'l1', roundId: 'r-screenshot-1', payerId: 'gp-2', receiverId: 'gp-1', amount: 14, reasonCode: 'UNSEEN_PENALTY', reasonDescription: '10 unseen penalty + 4 maal' },
              { id: 'l2', roundId: 'r-screenshot-1', payerId: 'gp-3', receiverId: 'gp-1', amount: 14, reasonCode: 'UNSEEN_PENALTY', reasonDescription: '10 unseen penalty + 4 maal' },
              { id: 'l3', roundId: 'r-screenshot-1', payerId: 'gp-4', receiverId: 'gp-1', amount: 14, reasonCode: 'UNSEEN_PENALTY', reasonDescription: '10 unseen penalty + 4 maal' },
              { id: 'l4', roundId: 'r-screenshot-1', payerId: 'gp-5', receiverId: 'gp-1', amount: 14, reasonCode: 'UNSEEN_PENALTY', reasonDescription: '10 unseen penalty + 4 maal' },
            ],
            netPoints: { 'gp-1': 56, 'gp-2': -14, 'gp-3': -14, 'gp-4': -14, 'gp-5': -14 },
            netMoney: { 'gp-1': 280, 'gp-2': -70, 'gp-3': -70, 'gp-4': -70, 'gp-5': -70 },
            calculationNotes: ['Conservation verified (Sum = 0)'],
          },
          {
            id: 'r-screenshot-2',
            gameId: 'game-sample-screenshot',
            roundNumber: 2,
            createdAt: new Date(Date.now() - 3600000 * 1.0).toISOString(),
            savedAt: new Date(Date.now() - 3600000 * 1.0).toISOString(),
            winnerGamePlayerId: 'gp-1',
            inputs: [
              { gamePlayerId: 'gp-1', maal: 3, seenStatus: 'seen', isWinner: true, isDublee: false, isFoul: false },
              { gamePlayerId: 'gp-2', maal: 6, seenStatus: 'seen', isWinner: false, isDublee: false, isFoul: false },
              { gamePlayerId: 'gp-3', maal: 0, seenStatus: 'unseen', isWinner: false, isDublee: false, isFoul: false },
              { gamePlayerId: 'gp-4', maal: 0, seenStatus: 'unseen', isWinner: false, isDublee: false, isFoul: false },
              { gamePlayerId: 'gp-5', maal: 0, seenStatus: 'unseen', isWinner: false, isDublee: false, isFoul: false },
            ],
            ledger: [
              { id: 'l5', roundId: 'r-screenshot-2', payerId: 'gp-1', receiverId: 'gp-2', amount: 3, reasonCode: 'MAAL_EXCHANGE', reasonDescription: 'Maal diff 6 vs 3' },
              { id: 'l6', roundId: 'r-screenshot-2', payerId: 'gp-3', receiverId: 'gp-1', amount: 13, reasonCode: 'UNSEEN_PENALTY', reasonDescription: '10 unseen + 3 maal' },
              { id: 'l7', roundId: 'r-screenshot-2', payerId: 'gp-3', receiverId: 'gp-2', amount: 6, reasonCode: 'MAAL_EXCHANGE', reasonDescription: '6 maal to Shya' },
              { id: 'l8', roundId: 'r-screenshot-2', payerId: 'gp-4', receiverId: 'gp-1', amount: 13, reasonCode: 'UNSEEN_PENALTY', reasonDescription: '10 unseen + 3 maal' },
              { id: 'l9', roundId: 'r-screenshot-2', payerId: 'gp-4', receiverId: 'gp-2', amount: 6, reasonCode: 'MAAL_EXCHANGE', reasonDescription: '6 maal to Shya' },
              { id: 'l10', roundId: 'r-screenshot-2', payerId: 'gp-5', receiverId: 'gp-1', amount: 13, reasonCode: 'UNSEEN_PENALTY', reasonDescription: '10 unseen + 3 maal' },
              { id: 'l11', roundId: 'r-screenshot-2', payerId: 'gp-5', receiverId: 'gp-2', amount: 6, reasonCode: 'MAAL_EXCHANGE', reasonDescription: '6 maal to Shya' },
            ],
            netPoints: { 'gp-1': 44, 'gp-2': 13, 'gp-3': -19, 'gp-4': -19, 'gp-5': -19 },
            netMoney: { 'gp-1': 220, 'gp-2': 65, 'gp-3': -95, 'gp-4': -95, 'gp-5': -95 },
            calculationNotes: ['Conservation verified (Sum = 0)'],
          },
          {
            id: 'r-screenshot-3',
            gameId: 'game-sample-screenshot',
            roundNumber: 3,
            createdAt: new Date(Date.now() - 3600000 * 0.5).toISOString(),
            savedAt: new Date(Date.now() - 3600000 * 0.5).toISOString(),
            winnerGamePlayerId: 'gp-1',
            inputs: [
              { gamePlayerId: 'gp-1', maal: 0, seenStatus: 'seen', isWinner: true, isDublee: false, isFoul: false },
              { gamePlayerId: 'gp-2', maal: 4, seenStatus: 'seen', isWinner: false, isDublee: true, isFoul: false },
              { gamePlayerId: 'gp-3', maal: 0, seenStatus: 'seen', isWinner: false, isDublee: false, isFoul: true, foulReason: 'Flag' },
              { gamePlayerId: 'gp-4', maal: 0, seenStatus: 'unseen', isWinner: false, isDublee: false, isFoul: false },
              { gamePlayerId: 'gp-5', maal: 0, seenStatus: 'unseen', isWinner: false, isDublee: false, isFoul: false },
            ],
            ledger: [
              { id: 'l12', roundId: 'r-screenshot-3', payerId: 'gp-1', receiverId: 'gp-2', amount: 4, reasonCode: 'MAAL_EXCHANGE', reasonDescription: '4 maal to Shya' },
              { id: 'l13', roundId: 'r-screenshot-3', payerId: 'gp-3', receiverId: 'gp-2', amount: 4, reasonCode: 'MAAL_EXCHANGE', reasonDescription: '4 maal to Shya' },
              { id: 'l14', roundId: 'r-screenshot-3', payerId: 'gp-4', receiverId: 'gp-2', amount: 4, reasonCode: 'MAAL_EXCHANGE', reasonDescription: '4 maal to Shya' },
              { id: 'l15', roundId: 'r-screenshot-3', payerId: 'gp-4', receiverId: 'gp-1', amount: 10, reasonCode: 'UNSEEN_PENALTY', reasonDescription: '10 unseen penalty to winner' },
            ],
            netPoints: { 'gp-1': 6, 'gp-2': 12, 'gp-3': -4, 'gp-4': -14, 'gp-5': 0 },
            netMoney: { 'gp-1': 30, 'gp-2': 60, 'gp-3': -20, 'gp-4': -70, 'gp-5': 0 },
            calculationNotes: ['Conservation verified (Sum = 0)'],
          },
        ],
        auditEvents: [
          {
            id: 'ae-1',
            gameId: 'game-sample-screenshot',
            action: 'CREATE_GAME',
            description: 'Game started with 5 players at $ 5/pt under Murder rule',
            timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
          },
        ],
      };

      this.saveGames([sampleGame]);
      this.setActiveGameId(sampleGame.id);
    }
  },

  isDarkMode(): boolean {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
      if (stored !== null) {
        return stored === 'true';
      }
      // If no preference stored, check system preference
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      return false;
    } catch {
      return false;
    }
  },

  setDarkMode(enabled: boolean): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DARK_MODE, enabled ? 'true' : 'false');
      this.applyTheme(enabled);
    } catch (e) {
      console.error('Failed to save dark mode setting:', e);
    }
  },

  toggleDarkMode(): boolean {
    const next = !this.isDarkMode();
    this.setDarkMode(next);
    return next;
  },

  applyTheme(enabled: boolean): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (enabled) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
  },

  initTheme(): boolean {
    const isDark = this.isDarkMode();
    this.applyTheme(isDark);
    return isDark;
  },
};
