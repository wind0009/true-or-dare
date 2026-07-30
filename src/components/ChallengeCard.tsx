import React, { useState, useEffect } from 'react';
import { HelpCircle, Flame, Volume2, VolumeX, Play, Square } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CardItem, Player } from '../types';
import { sound } from '../utils/sound';

interface ChallengeCardProps {
  player: Player;
  card: CardItem;
  onComplete: () => void;
  onPass: () => void;
  onSwapCard: () => void;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({
  player,
  card,
  onComplete,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isTruth = card.type === 'truth';

  const speakQuestion = () => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel(); // Stop any ongoing speech

    const cleanText = card.text.replace(/\*\*/g, '');
    const textToSpeak = `${player.name}, ${isTruth ? 'Vérité' : 'Action'} : ${cleanText}`;
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'fr-FR';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Try to find a French voice
    const voices = window.speechSynthesis.getVoices();
    const frenchVoice = voices.find(v => v.lang.startsWith('fr'));
    if (frenchVoice) {
      utterance.voice = frenchVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Auto-play TTS on card load and cleanup on unmount
  useEffect(() => {
    speakQuestion();

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [card.id, card.text, player.name]);

  const handleCardClick = () => {
    stopSpeech();
    sound.playSuccess();
    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#a855f7', '#3b82f6', '#10b981', '#f59e0b'],
      });
    } catch (e) {}
    onComplete();
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-[#1b1137] border-2 border-purple-500/30 rounded-3xl p-5 sm:p-7 text-white shadow-2xl flex flex-col justify-between min-h-[460px] sm:min-h-[500px] relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      
      {/* Background Ambient Glows */}
      <div className={`absolute -top-20 -left-20 w-56 h-56 ${isTruth ? 'bg-pink-500/20' : 'bg-cyan-500/20'} rounded-full blur-3xl pointer-events-none`} />

      {/* Header Info */}
      <div className="relative z-10 text-center space-y-1 mb-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-900/60 border border-purple-400/30 backdrop-blur-md shadow-lg">
          <span className="text-xl">{player.avatar || '🎲'}</span>
          <span className="text-xs font-black uppercase tracking-widest text-purple-200">
            TOUR DE <span className="text-amber-300 underline underline-offset-2">{player.name}</span>
          </span>
        </div>
      </div>

      {/* Main Interactive Challenge Card */}
      <button
        type="button"
        onClick={handleCardClick}
        aria-label="Valider la carte"
        className={`group relative w-full flex-1 rounded-3xl ${
          isTruth
            ? 'bg-gradient-to-br from-[#d92662] via-[#ae315d] to-[#7a0d33] border-pink-400/40 hover:shadow-pink-500/30'
            : 'bg-gradient-to-br from-[#0284c7] via-[#0369a1] to-[#0c4a6e] border-cyan-400/40 hover:shadow-cyan-500/30'
        } border-2 p-6 sm:p-8 text-left shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-95 flex flex-col justify-between cursor-pointer my-2`}
      >
        {/* Card Header Tag & Audio Button */}
        <div className="flex items-center justify-between mb-3 z-10 gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/20 border border-white/20">
              {isTruth ? (
                <>
                  <HelpCircle className="w-4 h-4 text-pink-200" />
                  <span>💬 VÉRITÉ</span>
                </>
              ) : (
                <>
                  <Flame className="w-4 h-4 text-amber-300" />
                  <span>⚡ ACTION</span>
                </>
              )}
            </span>

            <span className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl border ${
              card.intensity === 'soft'
                ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40'
                : card.intensity === 'hot'
                ? 'bg-pink-500/20 text-pink-200 border-pink-400/40'
                : card.intensity === 'hard'
                ? 'bg-orange-500/20 text-orange-200 border-orange-400/40'
                : 'bg-purple-500/20 text-purple-200 border-purple-400/40'
            }`}>
              {card.intensity === 'soft' && '🟢 SOFT'}
              {card.intensity === 'hot' && '🌶️ HOT'}
              {card.intensity === 'hard' && '🔥 HARD'}
              {card.intensity === 'extreme' && '💀 EXTREME'}
            </span>
          </div>

          {/* Audio Reader Control Button inside card header */}
          <div 
            onClick={(e) => {
              e.stopPropagation(); // Prevents advancing the card when toggling audio
              if (isSpeaking) {
                stopSpeech();
              } else {
                speakQuestion();
              }
            }}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-black tracking-wider transition-all cursor-pointer ${
              isSpeaking
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-lg shadow-amber-400/30 animate-pulse'
                : 'bg-black/30 hover:bg-black/50 text-white border-white/20'
            }`}
            title="Lire la question à haute voix"
          >
            {isSpeaking ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>STOP</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-amber-300" />
                <span>ÉCOUTER</span>
              </>
            )}
          </div>
        </div>

        {/* Challenge Text */}
        <div className="my-auto py-4 z-10">
          <p className="text-xl sm:text-2xl font-black text-white leading-relaxed tracking-wide">
            {card.text.split(/(\*\*.*?\*\*)/g).map((chunk, idx) => {
              if (chunk.startsWith('**') && chunk.endsWith('**')) {
                return (
                  <span key={idx} className="text-amber-300 underline underline-offset-4 bg-amber-400/10 px-1.5 py-0.5 rounded-lg">
                    {chunk.slice(2, -2)}
                  </span>
                );
              }
              return chunk;
            })}
          </p>
        </div>

      </button>

    </div>
  );
};


