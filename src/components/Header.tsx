import React from 'react';
import { Volume2, VolumeX, Home } from 'lucide-react';
import { GameMode, GameState, Player } from '../types';
import { sound } from '../utils/sound';

interface HeaderProps {
  gameState: GameState;
  currentMode: GameMode;
  players: Player[];
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  onGoHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  gameState,
  currentMode,
  players,
  soundEnabled,
  setSoundEnabled,
  onGoHome,
}) => {
  const toggleSound = () => {
    const next = !soundEnabled;
    sound.enabled = next;
    setSoundEnabled(next);
    if (next) sound.playClick();
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-[#110823]/90 backdrop-blur-md border-b border-purple-900/40 text-white px-4 sm:px-8 py-3.5 transition-all">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Title */}
        <div className="flex items-center gap-3">
          {gameState !== 'SETUP_PLAYERS' && (
            <button
              id="header-home-btn"
              onClick={onGoHome}
              className="p-2 rounded-xl bg-[#221445] hover:bg-[#311e61] text-slate-200 border border-purple-500/20 transition-all active:scale-95"
              title="Accueil / Modes de jeu"
            >
              <Home className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" />
            </button>
          )}

          <div onClick={onGoHome} className="cursor-pointer group select-none">
            <h1 className="font-extrabold text-base sm:text-xl tracking-tight text-white uppercase flex items-center gap-2">
              <span>ACTION OU VÉRITÉ</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 normal-case hidden sm:inline-block">
                {currentMode.name}
              </span>
            </h1>
          </div>
        </div>

        {/* Right Section: Status Tag & Sound Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Status pill */}
          <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#27184c] border border-purple-500/30 text-[11px] font-black tracking-wider text-pink-200 uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>PARTIE EN COURS • {players.length} JOUEURS</span>
          </div>

          {/* Sound Toggle */}
          <button
            id="header-sound-toggle-btn"
            onClick={toggleSound}
            className={`p-2 rounded-xl border transition-all active:scale-95 ${
              soundEnabled
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-[#221445] text-slate-400 border-purple-500/20 hover:bg-[#311e61]'
            }`}
            title={soundEnabled ? 'Son activé' : 'Son coupé'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

        </div>

      </div>
    </header>
  );
};
