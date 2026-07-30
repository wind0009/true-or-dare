import React from 'react';
import { BookOpen, X, Sparkles, Smartphone, CheckCircle, ShieldCheck } from 'lucide-react';
import { sound } from '../utils/sound';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-white">
        
        {/* Header */}
        <div className="p-4 sm:p-6 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black">Règles du Jeu 📖</h2>
              <p className="text-xs text-slate-400">Comment jouer à Action ou Vérité</p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-slate-300">
          
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="w-7 h-7 rounded-xl bg-rose-500/20 text-rose-400 font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                1
              </div>
              <div>
                <h4 className="font-extrabold text-white text-sm">La Roue des Prénoms 🎡</h4>
                <p className="text-slate-400 text-xs mt-0.5">
                  Clique sur la roue pour la faire tourner. Quand elle s'arrête, l'aiguille indique le joueur désigné pour le tour !
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="w-7 h-7 rounded-xl bg-blue-500/20 text-blue-400 font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                2
              </div>
              <div>
                <h4 className="font-extrabold text-white text-sm">Action ou Vérité ? 💬🔥</h4>
                <p className="text-slate-400 text-xs mt-0.5">
                  Le joueur choisi décide s'il veut répondre sincèrement à une <span className="text-blue-400 font-bold">Vérité</span> ou réaliser une <span className="text-rose-400 font-bold">Action</span> sous forme de défi !
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                3
              </div>
              <div>
                <h4 className="font-extrabold text-white text-sm">Points & Score 🏆</h4>
                <p className="text-slate-400 text-xs mt-0.5">
                  Réussir le défi accorde <span className="text-emerald-400 font-bold">+10 points</span>. Si un joueur refuse de le réaliser, il perd <span className="text-rose-400 font-bold">-5 points</span> (ou doit réaliser un gage collectif) !
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-400 font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                4
              </div>
              <div>
                <h4 className="font-extrabold text-white text-sm">Assistant IA Gemini 🤖</h4>
                <p className="text-slate-400 text-xs mt-0.5">
                  Passe en mode Créatif / IA pour générer des défis illimités totalement personnalisés selon vos prénoms et vos thèmes préférés !
                </p>
              </div>
            </div>
          </div>

          {/* Store Ready Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-slate-900 border border-indigo-500/30 text-xs">
            <h4 className="font-extrabold text-indigo-300 text-sm flex items-center gap-1.5 mb-1">
              <Smartphone className="w-4 h-4 text-indigo-400" />
              <span>Format Mobile & App Store / Play Store 📱</span>
            </h4>
            <p className="text-slate-400 leading-relaxed">
              Cette application est conçue avec une expérience tactile native, des animations fluides et des effets sonores interactifs prêts pour le déploiement sur smartphones et tablettes.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 text-right">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors"
          >
            Compris !
          </button>
        </div>

      </div>
    </div>
  );
};
