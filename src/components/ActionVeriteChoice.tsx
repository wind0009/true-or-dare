import React from 'react';
import { HelpCircle, Flame } from 'lucide-react';
import { CardType, Player } from '../types';
import { sound } from '../utils/sound';

interface ActionVeriteChoiceProps {
  player: Player;
  onChooseType: (type: CardType) => void;
  isLoadingAI?: boolean;
}

export const ActionVeriteChoice: React.FC<ActionVeriteChoiceProps> = ({
  player,
  onChooseType,
  isLoadingAI = false,
}) => {
  return (
    <div className="w-full bg-[#27184c] border border-[#3c286d] rounded-3xl p-6 sm:p-8 text-white shadow-2xl flex flex-col justify-between min-h-[420px] animate-in fade-in zoom-in-95 duration-300">
      
      {/* Top Section Header matching screenshot */}
      <div>
        <p className="text-xs font-extrabold text-pink-300 uppercase tracking-widest">
          TOUR DE {player.name}
        </p>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 mb-6">
          Action ou Vérité ?
        </h2>

        {/* Card Box Preview matching screenshot style */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#c43969] via-[#ae315d] to-[#8e244b] shadow-xl text-white flex flex-col justify-between min-h-[180px] border border-pink-400/20 mb-6">
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-pink-100 flex items-center gap-1.5">
              <span>🎯</span>
              <span>À TOI DE CHOISIR</span>
            </span>
            <span className="text-2xl">{player.avatar}</span>
          </div>

          <p className="text-lg sm:text-2xl font-bold text-white leading-snug py-4">
            Veux-tu répondre à une Vérité indiscrète ou relever une Action déjantée ?
          </p>

          <div className="flex items-center justify-between text-xs font-bold text-pink-100/70 tracking-wide uppercase pt-2 border-t border-pink-400/20">
            <span>CHOIX DU JOUEUR</span>
            <span>PRÊT À JOUER</span>
          </div>

        </div>
      </div>

      {/* Action Buttons Row matching screenshot design */}
      <div className="space-y-4">
        <p className="text-xs font-bold text-slate-300 text-center uppercase tracking-wider">
          Choisis ton camp
        </p>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          
          {/* VÉRITÉ Button */}
          <button
            type="button"
            disabled={isLoadingAI}
            onClick={() => {
              sound.playClick();
              onChooseType('truth');
            }}
            className="py-4 px-5 rounded-2xl bg-[#1c113b] hover:bg-[#2a1b55] text-white font-black text-sm sm:text-base border border-purple-500/20 shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            <HelpCircle className="w-5 h-5 text-blue-400" />
            <span>VÉRITÉ</span>
          </button>

          {/* ACTION Button */}
          <button
            type="button"
            disabled={isLoadingAI}
            onClick={() => {
              sound.playClick();
              onChooseType('dare');
            }}
            className="py-4 px-5 rounded-2xl bg-[#a52d55] hover:bg-[#b93763] text-white font-black text-sm sm:text-base shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            <Flame className="w-5 h-5 text-amber-300" />
            <span>ACTION</span>
          </button>

        </div>

      </div>

    </div>
  );
};
