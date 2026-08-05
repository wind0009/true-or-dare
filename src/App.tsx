import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PlayerSetup } from './components/PlayerSetup';
import { ModeSelector } from './components/ModeSelector';
import { WheelOfNames } from './components/WheelOfNames';
import { ActionVeriteChoice } from './components/ActionVeriteChoice';
import { ChallengeCard } from './components/ChallengeCard';
import { PlayersSidebar } from './components/PlayersSidebar';
import { CardManagerModal } from './components/CardManagerModal';
import { WhatsAppCallModal } from './components/WhatsAppCallModal';

import { CardItem, CardType, GameMode, GameState, IntensityLevel, Player } from './types';
import { GAME_MODES } from './data/questions';
import { cardEngine } from './services/cardEngine';
import { sound } from './utils/sound';

const STORAGE_KEY_PLAYERS = 'av_app_players_v1';
const STORAGE_KEY_WHATSAPP_CALL = 'av_app_whatsapp_call_v1';

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
  const [intensity, setIntensity] = useState<IntensityLevel>('soft');

  // Game lifecycle state
  const [gameState, setGameState] = useState<GameState>('SETUP_PLAYERS');
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [currentCard, setCurrentCard] = useState<CardItem | null>(null);

  // Card engine session history & progressive difficulty tracking
  const [playedCardIds, setPlayedCardIds] = useState<(string | number)[]>([]);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [lastTags, setLastTags] = useState<string[]>([]);
  const [showEmptyPoolOptions, setShowEmptyPoolOptions] = useState<boolean>(false);
  const [emptyPoolType, setEmptyPoolType] = useState<CardType>('truth');

  // Card Manager modal toggle
  const [isCardManagerOpen, setIsCardManagerOpen] = useState<boolean>(false);
  const [isWhatsAppCallOpen, setIsWhatsAppCallOpen] = useState<boolean>(false);
  const [whatsAppCallLink, setWhatsAppCallLink] = useState<string>(() => localStorage.getItem(STORAGE_KEY_WHATSAPP_CALL) || '');

  const saveWhatsAppCallLink = (link: string) => {
    setWhatsAppCallLink(link);
    localStorage.setItem(STORAGE_KEY_WHATSAPP_CALL, link);
  };

  // Sound
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Handle spin finish -> player selected
  const handlePlayerSelected = (player: Player) => {
    setSelectedPlayer(player);
    setGameState('CHOOSING_CARD');
  };

  // Get Card from engine with anti-repetition & weighted selection
  const handleChooseType = (type: CardType) => {
    if (!selectedPlayer) return;

    setEmptyPoolType(type);

    const categories: ('soft' | 'hot' | 'extreme')[] =
      intensity === 'hot'
        ? ['hot', 'soft']
        : intensity === 'extreme' || intensity === 'hard'
        ? ['extreme', 'hot', 'soft']
        : ['soft'];

    const res = cardEngine.selectCard({
      type,
      mode: selectedMode.id,
      intensity,
      categories,
      progressiveDifficulty: true,
      currentRound,
      groupMinAge: intensity === 'hot' || intensity === 'extreme' ? '18+' : '13+',
      currentPlayer: selectedPlayer,
      allPlayers: players,
      playedCardIds,
      lastTags,
    });

    if (res.status === 'success' && res.card) {
      setCurrentCard(res.card);
      setPlayedCardIds((prev) => [...prev, res.card!.id]);
      if (res.card.tags && res.card.tags.length > 0) {
        setLastTags(res.card.tags.map((t) => t.toLowerCase()));
      }
      setGameState('CARD_DISPLAYED');
    } else {
      // No cards remaining in current configuration
      setShowEmptyPoolOptions(true);
    }
  };

  // Complete Challenge
  const handleCompleteChallenge = () => {
    if (selectedPlayer) {
      setPlayers((prev) =>
        prev.map((p) => {
          if (p.id !== selectedPlayer.id) return p;
          const isTruth = currentCard?.type === 'truth';
          return {
            ...p,
            score: p.score + (isTruth ? 10 : 15),
            completedTruths: p.completedTruths + (isTruth ? 1 : 0),
            completedDares: p.completedDares + (isTruth ? 0 : 1),
          };
        })
      );
    }

    setCurrentRound((r) => r + 1);
    setGameState('SPINNING');
    setSelectedPlayer(null);
    setCurrentCard(null);
  };

  // Pass Challenge
  const handlePassChallenge = () => {
    if (selectedPlayer) {
      setPlayers((prev) =>
        prev.map((p) => {
          if (p.id !== selectedPlayer.id) return p;
          return { ...p, passedCount: p.passedCount + 1 };
        })
      );
    }

    setGameState('SPINNING');
    setSelectedPlayer(null);
    setCurrentCard(null);
  };

  const handleSwapCard = () => {
    if (currentCard) {
      handleChooseType(currentCard.type);
    }
  };

  // Fallback options when played through all cards
  const handleResetSessionHistory = () => {
    sound.playClick();
    setPlayedCardIds([]);
    setShowEmptyPoolOptions(false);
    handleChooseType(emptyPoolType);
  };

  const handleIncreaseDifficulty = () => {
    sound.playClick();
    setIntensity((cur) => (cur === 'soft' ? 'hot' : cur === 'hot' ? 'hard' : 'extreme'));
    setShowEmptyPoolOptions(false);
    handleChooseType(emptyPoolType);
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
        onOpenCardManager={() => setIsCardManagerOpen(true)}
        onOpenWhatsAppCall={() => setIsWhatsAppCallOpen(true)}
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

      {/* Card Manager Modal */}
      <CardManagerModal
        isOpen={isCardManagerOpen}
        onClose={() => setIsCardManagerOpen(false)}
        currentModeId={selectedMode.id}
        playersList={players.map((p) => p.name)}
      />

      <WhatsAppCallModal
        isOpen={isWhatsAppCallOpen}
        onClose={() => setIsWhatsAppCallOpen(false)}
        callLink={whatsAppCallLink}
        onSaveCallLink={saveWhatsAppCallLink}
      />

      {/* Empty Pool Options Modal */}
      {showEmptyPoolOptions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-[#180d35] border border-purple-900/60 rounded-3xl p-6 shadow-2xl text-white space-y-4 text-center">
            <h3 className="text-xl font-black text-rose-400">Toutes les cartes ont été jouées ! 🎉</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tu as complété toutes les cartes disponibles dans la catégorie et le niveau de difficulté actuels sans aucune répétition. Que souhaites-tu faire ?
            </p>

            <div className="space-y-2 pt-2 text-xs font-bold">
              <button
                type="button"
                onClick={handleResetSessionHistory}
                className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30"
              >
                🔄 Recommencer la sélection (Mélanger les cartes)
              </button>

              <button
                type="button"
                onClick={handleIncreaseDifficulty}
                className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30"
              >
                📈 Augmenter la difficulté / pimenter l'ambiance
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowEmptyPoolOptions(false);
                  setIsCardManagerOpen(true);
                }}
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30"
              >
                ➕ Ajouter ou Importer de nouvelles cartes
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowEmptyPoolOptions(false);
                  setGameState('SPINNING');
                }}
                className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Retour au tour suivant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Footer Status */}
      <footer className="py-3 px-4 bg-[#110822] border-t border-purple-900/30 text-center text-[11px] text-slate-400 flex items-center justify-center gap-2">
        <span>Action ou Vérité 🎡</span>
        <span>•</span>
        <span>PARTIE EN COURS ({players.length} JOUEURS)</span>
      </footer>

    </div>
  );
}
