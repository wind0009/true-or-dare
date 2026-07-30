import React from 'react';
import { Users, PartyPopper, Heart, Smile, Sparkles, Flame, Check, ArrowLeft, Play } from 'lucide-react';
import { GameMode, GameModeId, IntensityLevel } from '../types';
import { GAME_MODES } from '../data/questions';
import { sound } from '../utils/sound';

interface ModeSelectorProps {
  selectedMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  selectedIntensity: IntensityLevel;
  onSelectIntensity: (level: IntensityLevel) => void;
  onBack: () => void;
  onStartGame: () => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  selectedMode,
  onSelectMode,
  selectedIntensity,
  onSelectIntensity,
  onBack,
  onStartGame,
}) => {
  const getIcon = (id: GameModeId) => {
    switch (id) {
      case 'amis': return <Users className="w-6 h-6" />;
      case 'soiree': return <PartyPopper className="w-6 h-6" />;
      case 'couple': return <Heart className="w-6 h-6" />;
      case 'famille': return <Smile className="w-6 h-6" />;
      case 'custom': return <Sparkles className="w-6 h-6" />;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl text-white">
      
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => {
            sound.playClick();
            onBack();
          }}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Modifier joueurs</span>
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold">
          <span>Étape 2 sur 2</span>
        </div>
      </div>

      {/* Main Title */}
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-white via-purple-100 to-rose-200 bg-clip-text text-transparent">
          Choisis ton ambiance de jeu 🎭
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Sélectionne le mode le plus adapté à ton groupe
        </p>
      </div>

      {/* Mode Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {GAME_MODES.map((mode) => {
          const isSelected = selectedMode.id === mode.id;
          return (
            <div
              key={mode.id}
              onClick={() => {
                sound.playClick();
                onSelectMode(mode);
              }}
              className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 group flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-800/90 border-rose-500 shadow-xl shadow-rose-500/15 scale-[1.02]'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
            >
              {/* Badge */}
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${mode.gradient} flex items-center justify-center text-white shadow-md`}
                >
                  {getIcon(mode.id)}
                </div>

                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                  {mode.badge}
                </span>
              </div>

              {/* Mode text */}
              <div>
                <h3 className="font-extrabold text-base text-white flex items-center justify-between">
                  <span>{mode.name}</span>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center text-white">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </h3>
                <p className="text-xs font-medium text-rose-400 mt-0.5">{mode.subtitle}</p>
                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {mode.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Intensity Selector Bar */}
      <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 mb-6">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-3">
          <Flame className="w-4 h-4 text-orange-400" />
          <span>Niveau d'intensité des défis :</span>
        </label>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onSelectIntensity('soft');
            }}
            className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              selectedIntensity === 'soft'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <span>🟢 Soft</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onSelectIntensity('medium');
            }}
            className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              selectedIntensity === 'medium'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <span>🟡 Modéré</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onSelectIntensity('spicy');
            }}
            className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              selectedIntensity === 'spicy'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <span>🔥 Pimenté</span>
          </button>
        </div>
      </div>

      {/* Launch Game Button */}
      <button
        type="button"
        onClick={() => {
          sound.playSuccess();
          onStartGame();
        }}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 hover:opacity-95 text-white font-extrabold text-base shadow-xl shadow-rose-500/25 flex items-center justify-center gap-2 transition-all active:scale-98"
      >
        <Play className="w-5 h-5 fill-current" />
        <span>Lancer la bouteille ! 🍾</span>
      </button>

    </div>
  );
};
