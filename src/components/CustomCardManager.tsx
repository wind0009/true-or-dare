import React, { useState } from 'react';
import { X, Plus, Sparkles, Trash2, HelpCircle, Flame, RefreshCw, Check } from 'lucide-react';
import { CardItem, CardType, GameModeId, IntensityLevel } from '../types';
import { sound } from '../utils/sound';

interface CustomCardManagerProps {
  isOpen: boolean;
  onClose: () => void;
  customCards: CardItem[];
  onAddCustomCard: (card: CardItem) => void;
  onRemoveCustomCard: (id: string) => void;
  onBatchAddCards: (cards: CardItem[]) => void;
  currentModeId: GameModeId;
  playersList: string[];
}

export const CustomCardManager: React.FC<CustomCardManagerProps> = ({
  isOpen,
  onClose,
  customCards,
  onAddCustomCard,
  onRemoveCustomCard,
  onBatchAddCards,
  currentModeId,
  playersList,
}) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'ai'>('manual');
  const [cardType, setCardType] = useState<CardType>('truth');
  const [intensity, setIntensity] = useState<IntensityLevel>('soft');
  const [textInput, setTextInput] = useState('');

  // AI Prompt controls
  const [aiTheme, setAiTheme] = useState('Anecdotes de lycée et secrets comiques');
  const [aiCount, setAiCount] = useState(5);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiSuccessMsg, setAiSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    sound.playClick();
    const newCard: CardItem = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: cardType,
      text: textInput.trim(),
      mode: currentModeId,
      intensity,
      custom: true,
    };

    onAddCustomCard(newCard);
    setTextInput('');
  };

  const handleGenerateWithAI = async () => {
    sound.playClick();
    setIsAiGenerating(true);
    setAiSuccessMsg('');

    try {
      const res = await fetch('/api/generate-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: currentModeId,
          category: aiTheme,
          players: playersList,
          count: aiCount,
          intensity,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la génération');
      }

      const generatedList: CardItem[] = [];

      (data.truths || []).forEach((itemText: string) => {
        generatedList.push({
          id: `ai_t_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          type: 'truth',
          text: itemText,
          mode: currentModeId,
          intensity,
          custom: true,
        });
      });

      (data.dares || []).forEach((itemText: string) => {
        generatedList.push({
          id: `ai_d_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          type: 'dare',
          text: itemText,
          mode: currentModeId,
          intensity,
          custom: true,
        });
      });

      onBatchAddCards(generatedList);
      sound.playWinner();
      setAiSuccessMsg(`🎉 ${generatedList.length} cartes générées avec succès !`);
    } catch (err: any) {
      sound.playPass();
      alert('Impossible de générer avec l\'IA : ' + err.message);
    } finally {
      setIsAiGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-white">
        
        {/* Header */}
        <div className="p-4 sm:p-6 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black">Gestion des Cartes & IA 🤖</h2>
              <p className="text-xs text-slate-400">Ajoute tes propres vérités et défis ou génère-les avec Gemini</p>
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

        {/* Tab switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 p-2 gap-2">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveTab('manual');
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'manual'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Ajout Manuel</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveTab('ai');
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'ai'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20'
                : 'text-indigo-400 hover:text-indigo-300'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-300" />
            <span>Générateur IA Gemini</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          
          {activeTab === 'manual' ? (
            <form onSubmit={handleCreateCard} className="space-y-4">
              
              {/* Type selector */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">Type de carte :</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCardType('truth')}
                    className={`py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      cardType === 'truth'
                        ? 'bg-blue-600/30 text-blue-300 border-blue-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <HelpCircle className="w-4 h-4 text-blue-400" />
                    <span>Vérité 💬</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCardType('dare')}
                    className={`py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      cardType === 'dare'
                        ? 'bg-rose-600/30 text-rose-300 border-rose-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <Flame className="w-4 h-4 text-rose-400" />
                    <span>Action 🔥</span>
                  </button>
                </div>
              </div>

              {/* Text Input */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Intitulé de la question ou du défi :
                </label>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Ex: Quel est le pire plat que tu aies cuisiné ?"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-2xl p-3 text-sm text-white placeholder-slate-500 outline-none h-24 resize-none"
                  maxLength={250}
                />
              </div>

              <button
                type="submit"
                disabled={!textInput.trim()}
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Ajouter cette carte
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-indigo-500/10 border border-indigo-500/30 p-4 rounded-2xl">
                <h4 className="font-extrabold text-indigo-300 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Génération automatique de paquets de cartes par l'IA</span>
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  L'IA Gemini va analyser tes joueurs et ton thème pour créer une série originale d'actions et de vérités sur-mesure !
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Thème / Ambiance souhaitée :
                </label>
                <input
                  type="text"
                  value={aiTheme}
                  onChange={(e) => setAiTheme(e.target.value)}
                  placeholder="Ex: Secrets de vacances, Révélations de bureau..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-sm text-white placeholder-slate-500 outline-none"
                />
              </div>

              <button
                type="button"
                disabled={isAiGenerating}
                onClick={handleGenerateWithAI}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 hover:opacity-95 text-white font-extrabold text-sm shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isAiGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Création par l'IA Gemini en cours...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Générer {aiCount} Vérités & {aiCount} Actions !</span>
                  </>
                )}
              </button>

              {aiSuccessMsg && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold text-center">
                  {aiSuccessMsg}
                </div>
              )}
            </div>
          )}

          {/* Saved Custom Cards List */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Mes cartes personnalisées enregistrées ({customCards.length})
            </h3>

            {customCards.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-800 rounded-2xl bg-slate-950/40">
                <p className="text-slate-500 text-xs">Aucune carte personnalisée créée pour l'instant</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {customCards.map((card) => (
                  <div
                    key={card.id}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className={card.type === 'truth' ? 'text-blue-400 font-bold' : 'text-rose-400 font-bold'}>
                        {card.type === 'truth' ? '💬 Vérité:' : '🔥 Action:'}
                      </span>
                      <p className="text-slate-200 line-clamp-1">{card.text}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        sound.playPass();
                        onRemoveCustomCard(String(card.id));
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Supprimer la carte"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
