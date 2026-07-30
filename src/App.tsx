import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PlayerSetup } from './components/PlayerSetup';
import { ModeSelector } from './components/ModeSelector';
import { WheelOfNames } from './components/WheelOfNames';
import { ActionVeriteChoice } from './components/ActionVeriteChoice';
import { ChallengeCard } from './components/ChallengeCard';
import { PlayersSidebar } from './components/PlayersSidebar';

import { CardItem, CardType, GameMode, GameState, IntensityLevel, Player } from './types';
import { GAME_MODES, INITIAL_QUESTIONS, getSmartCard } from './data/questions';
import { sound } from './utils/sound';

const STORAGE_KEY_PLAYERS = 'av_app_players_v1';

export default function App() {
  // Players state
  const [players, setPlayers] = useState<Player[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PLAYERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 2) {
          return parsed.map((p, idx) => ({
            ...p,
            gender: p.gender || (idx % 2 === 0 ? 'female' : 'male'),
          }));
        }
      }
    } catch (e) {}
    return [
      { id: 'p1', name: 'Léa', avatar: '👑', color: '#ec4899', gender: 'female', score: 0, completedTruths: 0, completedDares: 0, passedCount: 0 },
      { id: 'p2', name: 'Alex', avatar: '😎', color: '#f97316', gender: 'male', score: 0, completedTruths: 0, completedDares: 0, passedCount: 0 },
      { id: 'p3', name: 'Maya', avatar: '🔥', color: '#a855f7', gender: 'female', score: 0, completedTruths: 0, completedDares: 0, passedCount: 0 },
      { id: 'p4', name: 'Thomas', avatar: '🕺', color: '#3b82f6', gender: 'male', score: 0, completedTruths: 0, completedDares: 0, passedCount: 0 },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PLAYERS, JSON.stringify(players));
    } catch (e) {}
  }, [players]);

  // Mode & Intensity
  const [selectedMode, setSelectedMode] = useState<GameMode>(GAME_MODES[0]); // Amis
  const [intensity, setIntensity] = useState<IntensityLevel>('medium');

  // Game lifecycle state
  const [gameState, setGameState] = useState<GameState>('SPINNING');
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [currentCard, setCurrentCard] = useState<CardItem | null>(null);

  // Sound
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Handle spin finish -> player selected
  const handlePlayerSelected = (player: Player) => {
    setSelectedPlayer(player);
    setGameState('CHOOSING_CARD');
  };

  // Get Card from pool with gender compatibility & partner targeting
  const handleChooseType = (type: CardType) => {
    if (!selectedPlayer) return;

    const chosen = getSmartCard(
      type,
      selectedMode.id,
      intensity,
      selectedPlayer,
      players
    );

    setCurrentCard(chosen);
    setGameState('CARD_DISPLAYED');
  };

  // Complete Challenge
  const handleCompleteChallenge = () => {
    setGameState('SPINNING');
    setSelectedPlayer(null);
    setCurrentCard(null);
  };

  // Pass Challenge
  const handlePassChallenge = () => {
    setGameState('SPINNING');
    setSelectedPlayer(null);
    setCurrentCard(null);
  };

  const handleSwapCard = () => {
    if (currentCard) {
      handleChooseType(currentCard.type);
    }
  };

  return (
    <div className="min-h-screen bg-[#160b2b] text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      
      {/* Top Bar Header */}
      <Header
        gameState={gameState}
        currentMode={selectedMode}
        players={players}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        onGoHome={() => setGameState('SELECT_MODE')}
      />

      {/* Main Grid */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Full screen setup states */}
        {gameState === 'SETUP_PLAYERS' && (
          <div className="max-w-2xl mx-auto">
            <PlayerSetup
              players={players}
              onUpdatePlayers={setPlayers}
              onNext={() => setGameState('SELECT_MODE')}
            />
          </div>
        )}

        {gameState === 'SELECT_MODE' && (
          <div className="max-w-2xl mx-auto">
            <ModeSelector
              selectedMode={selectedMode}
              onSelectMode={setSelectedMode}
              selectedIntensity={intensity}
              onSelectIntensity={setIntensity}
              onBack={() => setGameState('SETUP_PLAYERS')}
              onStartGame={() => setGameState('SPINNING')}
            />
          </div>
        )}

        {/* Active Game Grid layout (Desktop 2-column, Mobile stacked) */}
        {gameState !== 'SETUP_PLAYERS' && gameState !== 'SELECT_MODE' && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_310px] gap-6 items-start">
            
            {/* Left Column: Game Board Arena */}
            <div className="w-full">
              
              {/* Spinner View */}
              {gameState === 'SPINNING' && (
                <div className="w-full bg-[#27184c] border border-[#3c286d] rounded-3xl p-4 sm:p-6 text-white shadow-2xl flex flex-col justify-between min-h-[440px]">
                  
                  {/* Active Spinner */}
                  <WheelOfNames
                    players={players}
                    onSelectPlayer={handlePlayerSelected}
                    isSpinning={isSpinning}
                    setIsSpinning={setIsSpinning}
                    selectedPlayer={selectedPlayer}
                  />

                </div>
              )}

              {/* Choice View */}
              {gameState === 'CHOOSING_CARD' && selectedPlayer && (
                <ActionVeriteChoice
                  player={selectedPlayer}
                  onChooseType={handleChooseType}
                />
              )}

              {/* Display Challenge Card View */}
              {gameState === 'CARD_DISPLAYED' && selectedPlayer && currentCard && (
                <ChallengeCard
                  player={selectedPlayer}
                  card={currentCard}
                  onComplete={handleCompleteChallenge}
                  onPass={handlePassChallenge}
                  onSwapCard={handleSwapCard}
                />
              )}

            </div>

            {/* Right Column: Joueurs Sidebar Panel */}
            <div className="w-full">
              <PlayersSidebar
                players={players}
                activePlayerId={selectedPlayer?.id}
                onUpdatePlayers={setPlayers}
                onOpenPlayerSetup={() => setGameState('SETUP_PLAYERS')}
              />
            </div>

          </div>
        )}

      </main>

      {/* Mobile Footer Status */}
      <footer className="py-3 px-4 bg-[#110822] border-t border-purple-900/30 text-center text-[11px] text-slate-400 flex items-center justify-center gap-2">
        <span>Action ou Vérité 🎡</span>
        <span>•</span>
        <span>PARTIE EN COURS ({players.length} JOUEURS)</span>
      </footer>

    </div>
  );
}
