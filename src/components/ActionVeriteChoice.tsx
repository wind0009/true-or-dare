import React from 'react';
import { Flame, Sparkles, Zap, ShieldAlert } from 'lucide-react';
import { CardType, Player } from '../types';
import { sound } from '../utils/sound';

interface ActionVeriteChoiceProps {
  player: Player;
  onChooseType: (type: CardType) => void;
  isLoadingAI?: boolean;
  disabled?: boolean;
}

export const ActionVeriteChoice: React.FC<ActionVeriteChoiceProps> = ({
  player,
  onChooseType,
  isLoadingAI = false,
  disabled = false,
}) => {
  return (
    <div className="w-full max-w-lg mx-auto bg-[#1b1137] border-2 border-purple-500/30 rounded-3xl p-5 sm:p-7 text-white shadow-2xl flex flex-col justify-between min-h-[500px] sm:min-h-[540px] relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      
      {/* Background Ambient Glows */}
      <div className="absolute -top-20 -left-20 w-56 h-56 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-56 h-56 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Floating Player Turn Header */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-1 mb-2">
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-purple-900/60 border border-purple-400/30 backdrop-blur-md shadow-lg">
          <span className="text-xl">{player.avatar || '🎲'}</span>
          <span className="text-xs font-black uppercase tracking-widest text-purple-200">
            C'EST À <span className="text-amber-300 underline underline-offset-2">{player.name}</span> DE JOUER
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-white via-slate-100 to-purple-200 bg-clip-text text-transparent">
          Fais ton choix !
        </h2>
      </div>

      {/* Dual Split Cards Container */}
      <div className="relative z-10 my-3 grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 items-stretch">
        
        {/* VÉRITÉ CARD (Pink / Rose / Neon) */}
        <button
          type="button"
          disabled={isLoadingAI || disabled}
          onClick={() => {
            sound.playClick();
            onChooseType('truth');
          }}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#d92662] via-[#b31b4e] to-[#7a0d33] p-6 text-left shadow-xl border border-pink-400/30 transition-all duration-300 hover:scale-[1.03] active:scale-95 hover:shadow-pink-500/25 flex flex-col justify-between cursor-pointer disabled:opacity-50 min-h-[190px]"
        >
          {/* Subtle diagonal background sheen */}
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-pink-300/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

          {/* Top Badge */}
          <div className="flex items-center justify-between z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-pink-950/40 border border-pink-300/20 text-[11px] font-black tracking-widest uppercase text-pink-200">
              <Sparkles className="w-3.5 h-3.5 text-pink-300" />
              CONFIDENCE
            </span>
            <span className="text-pink-200/40 text-xs font-bold">01</span>
          </div>

          {/* Hero Typography */}
          <div className="my-auto py-3 z-10">
            <h3 className="text-4xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md group-hover:translate-x-1 transition-transform">
              VÉRITÉ
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-pink-100/80 mt-1">
              Secrets, anecdotes & questions indiscrètes
            </p>
          </div>

          {/* Bottom Action Hint */}
          <div className="flex items-center justify-between text-xs font-bold text-pink-200 uppercase tracking-wider z-10 pt-2 border-t border-pink-400/20">
            <span>Révéler la carte</span>
            <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </button>

        {/* ACTION CARD (Cyan / Electric Blue / Gold) */}
        <button
          type="button"
          disabled={isLoadingAI || disabled}
          onClick={() => {
            sound.playClick();
            onChooseType('dare');
          }}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0284c7] via-[#0369a1] to-[#0c4a6e] p-6 text-left shadow-xl border border-cyan-400/30 transition-all duration-300 hover:scale-[1.03] active:scale-95 hover:shadow-cyan-500/25 flex flex-col justify-between cursor-pointer disabled:opacity-50 min-h-[190px]"
        >
          {/* Subtle diagonal background sheen */}
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-cyan-300/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

          {/* Top Badge */}
          <div className="flex items-center justify-between z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-950/40 border border-cyan-300/20 text-[11px] font-black tracking-widest uppercase text-cyan-200">
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              DÉFI
            </span>
            <span className="text-cyan-200/40 text-xs font-bold">02</span>
          </div>

          {/* Hero Typography */}
          <div className="my-auto py-3 z-10">
            <h3 className="text-4xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md group-hover:translate-x-1 transition-transform">
              ACTION
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-cyan-100/80 mt-1">
              Gages fous, mimes & défis hilarants
            </p>
          </div>

          {/* Bottom Action Hint */}
          <div className="flex items-center justify-between text-xs font-bold text-cyan-200 uppercase tracking-wider z-10 pt-2 border-t border-cyan-400/20">
            <span>Relever le défi</span>
            <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </button>

      </div>

      {/* Footer Instructions */}
      <div className="relative z-10 text-center pt-2">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1.5">
          <span>⚡</span>
          <span>{disabled ? `On attend le choix de ${player.name}` : 'Sélectionne une option pour piocher une carte'}</span>
        </p>
      </div>

    </div>
  );
};
