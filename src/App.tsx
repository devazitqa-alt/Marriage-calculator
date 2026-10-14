import React, { useState, useEffect } from 'react';
import { Game, Player, PlayerGroup, RulesProfile, Round } from './types/marriage';
import { StorageService } from './services/storageService';
import { SoundEffects } from './utils/audio';
import { Header } from './components/Header';
import { HomeScreen } from './components/HomeScreen';
import { LiveScoreboard } from './components/LiveScoreboard';
import { NewGameModal } from './components/NewGameModal';
import { RoundEntryModal } from './components/RoundEntryModal';
import { CalculationAuditModal } from './components/CalculationAuditModal';
import { GameSummaryModal } from './components/GameSummaryModal';
import { GameLogsScreen } from './components/GameLogsScreen';
import { CallbreakScreen } from './components/CallbreakScreen';
import { TutorialModal } from './components/TutorialModal';
import { RulesProfilesModal } from './components/RulesProfilesModal';
import { TransferModal } from './components/TransferModal';
import { PlayerStatsModal } from './components/PlayerStatsModal';

export default function App() {
  // Initialize defaults if empty
  useEffect(() => {
    StorageService.initializeDefaultsIfEmpty();
  }, []);

  // Primary navigation view
  const [currentView, setCurrentView] = useState<'home' | 'scoreboard' | 'logs' | 'callbreak' | 'tutorial'>('home');

  // Active game session
  const [activeGame, setActiveGame] = useState<Game | undefined>(() => StorageService.getActiveGame());

  // Global collections
  const [savedPlayers, setSavedPlayers] = useState<Player[]>(() => StorageService.getPlayers());
  const [savedGroups, setSavedGroups] = useState<PlayerGroup[]>(() => StorageService.getGroups());
  const [rulesProfiles, setRulesProfiles] = useState<RulesProfile[]>(() => StorageService.getRulesProfiles());
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Modals state
  const [isNewGameOpen, setIsNewGameOpen] = useState(false);
  const [isRoundEntryOpen, setIsRoundEntryOpen] = useState(false);
  const [editingRound, setEditingRound] = useState<Round | null>(null);
  const [auditRound, setAuditRound] = useState<Round | null>(null);
  const [isGameSummaryOpen, setIsGameSummaryOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isPlayerStatsOpen, setIsPlayerStatsOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  const refreshGlobalData = () => {
    setSavedPlayers(StorageService.getPlayers());
    setSavedGroups(StorageService.getGroups());
    setRulesProfiles(StorageService.getRulesProfiles());
    setActiveGame(StorageService.getActiveGame());
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    SoundEffects.isMuted = !next;
  };

  // Game setup
  const handleStartGame = (game: Game) => {
    setActiveGame(game);
    setIsNewGameOpen(false);
    setCurrentView('scoreboard');
    refreshGlobalData();
  };

  // Record or update round
  const handleSaveRound = (round: Round) => {
    if (!activeGame) return;

    let updatedRounds: Round[];
    const isEdit = activeGame.rounds.some((r) => r.id === round.id);

    if (isEdit) {
      updatedRounds = activeGame.rounds.map((r) => (r.id === round.id ? round : r));
    } else {
      updatedRounds = [...activeGame.rounds, round];
    }

    const updatedGame: Game = {
      ...activeGame,
      rounds: updatedRounds,
      auditEvents: [
        ...activeGame.auditEvents,
        {
          id: `ae-${Date.now()}`,
          gameId: activeGame.id,
          roundId: round.id,
          action: isEdit ? 'EDIT_ROUND' : 'ADD_ROUND',
          description: `${isEdit ? 'Edited' : 'Recorded'} round #${round.roundNumber}`,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    StorageService.saveGame(updatedGame);
    setActiveGame(updatedGame);
    setIsRoundEntryOpen(false);
    setEditingRound(null);
  };

  // Undo last recorded round
  const handleUndoLastRound = () => {
    if (!activeGame || activeGame.rounds.length === 0) return;

    const confirmed = window.confirm(
      `Undo and remove Round #${activeGame.rounds.length}? This will roll back the latest score.`
    );
    if (!confirmed) return;

    SoundEffects.playClick();
    const lastRound = activeGame.rounds[activeGame.rounds.length - 1];
    const updatedRounds = activeGame.rounds.slice(0, -1);

    const updatedGame: Game = {
      ...activeGame,
      rounds: updatedRounds,
      auditEvents: [
        ...activeGame.auditEvents,
        {
          id: `ae-${Date.now()}`,
          gameId: activeGame.id,
          roundId: lastRound.id,
          action: 'UNDO_ROUND',
          description: `Undid round #${lastRound.roundNumber}`,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    StorageService.saveGame(updatedGame);
    setActiveGame(updatedGame);
  };

  // End game & finalize
  const handleEndGame = () => {
    if (!activeGame) return;

    const updatedGame: Game = {
      ...activeGame,
      status: 'completed',
      endedAt: new Date().toISOString(),
      auditEvents: [
        ...activeGame.auditEvents,
        {
          id: `ae-${Date.now()}`,
          gameId: activeGame.id,
          action: 'END_GAME',
          description: 'Game concluded and finalized for settlement.',
          timestamp: new Date().toISOString(),
        },
      ],
    };

    StorageService.saveGame(updatedGame);
    setActiveGame(updatedGame);
    setIsGameSummaryOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      {/* Top App Bar */}
      <Header
        currentView={currentView}
        onNavigate={(view: string) => {
          if (view === 'home') {
            setCurrentView('home');
          } else if (view === 'callbreak') {
            setCurrentView('callbreak');
          } else if (view === 'tutorial') {
            setIsTutorialOpen(true);
          }
        }}
        activeGameTitle={activeGame?.title}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomeScreen
            activeGame={activeGame}
            onNewGame={() => setIsNewGameOpen(true)}
            onContinueGame={() => {
              if (activeGame) setCurrentView('scoreboard');
            }}
            onViewLogs={() => setCurrentView('logs')}
            onViewTutorial={() => setIsTutorialOpen(true)}
            onViewTransfer={() => setIsTransferModalOpen(true)}
            onViewRules={() => setIsRulesModalOpen(true)}
            onViewPlayers={() => setIsPlayerStatsOpen(true)}
            onOpenCallbreak={() => setCurrentView('callbreak')}
          />
        )}

        {currentView === 'scoreboard' && activeGame && (
          <LiveScoreboard
            game={activeGame}
            onAddRound={() => {
              setEditingRound(null);
              setIsRoundEntryOpen(true);
            }}
            onUndoLastRound={handleUndoLastRound}
            onViewAuditRound={(round: Round) => setAuditRound(round)}
            onEndGame={handleEndGame}
            onShareGame={() => setIsGameSummaryOpen(true)}
            onOpenRules={() => setIsRulesModalOpen(true)}
            onOpenTransfer={() => setIsTransferModalOpen(true)}
            onGameUpdated={(updated) => {
              setActiveGame(updated);
              refreshGlobalData();
            }}
          />
        )}

        {currentView === 'logs' && (
          <GameLogsScreen
            onBack={() => setCurrentView('home')}
            onOpenGame={(selectedGame: Game) => {
              setActiveGame(selectedGame);
              StorageService.setActiveGameId(selectedGame.id);
              setCurrentView('scoreboard');
            }}
            onRematchGame={(prevGame: Game) => {
              // Preload new game with same players & rules
              const rematchGame: Game = {
                id: `game-${Date.now()}`,
                title: `${prevGame.title} (Rematch)`,
                startedAt: new Date().toISOString(),
                status: 'active',
                rulesProfile: prevGame.rulesProfile,
                currency: prevGame.currency,
                pointRate: prevGame.pointRate,
                players: prevGame.players.map((p, idx) => ({
                  ...p,
                  id: `gp-${idx + 1}-${Date.now()}`,
                })),
                rounds: [],
                auditEvents: [
                  {
                    id: `ae-${Date.now()}`,
                    gameId: `game-${Date.now()}`,
                    action: 'CREATE_GAME',
                    description: `Rematch started from ${prevGame.title}`,
                    timestamp: new Date().toISOString(),
                  },
                ],
              };
              StorageService.saveGame(rematchGame);
              setActiveGame(rematchGame);
              setCurrentView('scoreboard');
            }}
          />
        )}

        {currentView === 'callbreak' && (
          <CallbreakScreen onBack={() => setCurrentView('home')} />
        )}
      </main>

      {/* Modals & Dialogs */}
      <NewGameModal
        isOpen={isNewGameOpen}
        onClose={() => setIsNewGameOpen(false)}
        onStartGame={handleStartGame}
        savedPlayers={savedPlayers}
        savedGroups={savedGroups}
        rulesProfiles={rulesProfiles}
      />

      {activeGame && isRoundEntryOpen && (
        <RoundEntryModal
          isOpen={isRoundEntryOpen}
          onClose={() => {
            setIsRoundEntryOpen(false);
            setEditingRound(null);
          }}
          game={activeGame}
          onSaveRound={handleSaveRound}
          editingRound={editingRound}
        />
      )}

      {activeGame && auditRound && (
        <CalculationAuditModal
          isOpen={!!auditRound}
          onClose={() => setAuditRound(null)}
          game={activeGame}
          round={auditRound}
          onEditRound={(r) => {
            setAuditRound(null);
            setEditingRound(r);
            setIsRoundEntryOpen(true);
          }}
        />
      )}

      {activeGame && (
        <GameSummaryModal
          isOpen={isGameSummaryOpen}
          onClose={() => setIsGameSummaryOpen(false)}
          game={activeGame}
        />
      )}

      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />

      <RulesProfilesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
        rulesProfiles={rulesProfiles}
        onProfilesUpdated={refreshGlobalData}
      />

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onDataRestored={refreshGlobalData}
      />

      <PlayerStatsModal
        isOpen={isPlayerStatsOpen}
        onClose={() => setIsPlayerStatsOpen(false)}
        games={StorageService.getGames()}
        players={savedPlayers}
        groups={savedGroups}
        onDataChanged={refreshGlobalData}
      />
    </div>
  );
}
