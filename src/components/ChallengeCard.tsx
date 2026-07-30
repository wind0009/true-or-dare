import React, { useState, useEffect } from 'react';
import { HelpCircle, Flame, CheckCircle2, Share2, Timer, RotateCcw, ArrowRight } from 'lucide-react';
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
  onPass,
  onSwapCard,
}) => {
  const [timeLeft, setTimeLeft] = useState<number | null>(60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timeLeft !== null && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === null) return null;
          if (prev <= 1) {
            sound.playPass();
            setIsTimerRunning(false);
            return 0;
          }
          if (prev <= 5) sound.playTick(1.5);
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const handleComplete = () => {
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

  const handlePass = () => {
    sound.playPass();
    onPass();
  };

  const handleCopyText = () => {
    sound.playClick();
    const textToCopy = `[Action ou Vérité] - ${player.name} : ${card.type === 'truth' ? 'Vérité 💬' : 'Action 🔥'} : "${card.text}"`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isTruth = card.type === 'truth';

  return (
    <div className="w-full bg-[#27184c] border border-[#3c286d] rounded-3xl p-6 sm:p-8 text-white shadow-2xl flex flex-col justify-between min-h-[460px] animate-in fade-in zoom-in-95 duration-300">
      
      {/* Top Header section matching the screenshot */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-extrabold text-pink-300 uppercase tracking-widest">
            TOUR DE {player.name}
          </p>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-6">
          Action ou Vérité ?
        </h2>

        {/* Main Magenta Challenge Card matching prompt screenshot */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#c43969] via-[#ae315d] to-[#8e244b] shadow-xl text-white flex flex-col justify-between min-h-[200px] border border-pink-400/20 mb-6">
          
          {/* Card Tag */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
              {isTruth ? (
                <>
                  <HelpCircle className="w-4 h-4 text-blue-200" />
                  <span>💬 VÉRITÉ</span>
                </>
              ) : (
                <>
                  <Flame className="w-4 h-4 text-amber-300" />
                  <span>⚡ ACTION</span>
                </>
              )}
            </span>

            <button
              type="button"
              onClick={handleCopyText}
              className="text-[10px] font-bold text-pink-200 hover:text-white px-2 py-0.5 rounded bg-black/20 hover:bg-black/30 transition-colors"
            >
              {copied ? 'Copié !' : 'Partager'}
            </button>
          </div>

          {/* Target Partner Badge if present */}
          {card.targetPartner && (
            <div className="mb-3 px-3 py-1.5 rounded-xl bg-pink-500/20 border border-pink-400/40 text-pink-200 text-xs font-bold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span>🎯 Gage ciblé pour {player.name} :</span>
                <span className="text-white bg-pink-600/40 px-2 py-0.5 rounded-lg border border-pink-300/30">
                  {card.targetPartner.name} {card.targetPartner.gender === 'male' ? '👨' : card.targetPartner.gender === 'female' ? '👩' : '✨'}
                </span>
              </span>
              <span className="text-[10px] text-pink-300 font-semibold uppercase">Compatibilité 💖</span>
            </div>
          )}

          {/* Main Challenge Text with bold markup renderer */}
          <p className="text-lg sm:text-2xl font-bold text-white leading-snug py-2">
            {card.text.split(/(\*\*.*?\*\*)/g).map((chunk, idx) => {
              if (chunk.startsWith('**') && chunk.endsWith('**')) {
                return (
                  <span key={idx} className="text-amber-300 underline underline-offset-4 font-black bg-amber-400/10 px-1 rounded">
                    {chunk.slice(2, -2)}
                  </span>
                );
              }
              return chunk;
            })}
          </p>

          {/* Card Metadata Footer */}
          <div className="flex items-center justify-between text-[11px] font-bold text-pink-100/70 tracking-wide uppercase pt-3 border-t border-pink-400/20">
            <span>NIVEAU · {card.intensity === 'spicy' ? 'Pimenté 🔥' : card.intensity === 'soft' ? 'Soft 🌸' : 'Standard ⚡'}</span>
            <span>CARTE EN COURS</span>
          </div>

        </div>
      </div>

      {/* Timer & Controls Bar */}
      <div className="space-y-4">
        
        {/* Optional Timer line */}
        <div className="flex items-center justify-between px-2 text-xs font-semibold text-slate-300">
          <div className="flex items-center gap-2">
            <Timer className="w-3.5 h-3.5 text-amber-400" />
            <span>Minuteur :</span>
            {timeLeft !== null && (
              <span className={`font-mono font-extrabold px-1.5 py-0.5 rounded ${timeLeft <= 5 ? 'text-rose-400 animate-ping' : 'text-amber-300'}`}>
                {timeLeft}s
              </span>
            )}
          </div>

          <div className="flex gap-1.5 text-[11px]">
            <button
              onClick={() => { setTimeLeft(30); setIsTimerRunning(true); }}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              30s
            </button>
            <button
              onClick={() => { setTimeLeft(60); setIsTimerRunning(true); }}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              60s
            </button>
            <button
              onClick={() => onSwapCard()}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Changer</span>
            </button>
          </div>
        </div>

        {/* Action Button Row matching prompt screenshot */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          
          {/* VÉRITÉ choice button */}
          <button
            type="button"
            onClick={handleComplete}
            className="w-full sm:flex-1 py-3.5 px-4 rounded-2xl bg-[#1c113b] hover:bg-[#2a1b55] text-white font-black text-sm border border-purple-500/20 shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <HelpCircle className="w-4 h-4 text-blue-400" />
            <span>VÉRITÉ</span>
          </button>

          {/* ACTION choice button */}
          <button
            type="button"
            onClick={handleComplete}
            className="w-full sm:flex-1 py-3.5 px-4 rounded-2xl bg-[#a52d55] hover:bg-[#b93763] text-white font-black text-sm shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Flame className="w-4 h-4 text-amber-300" />
            <span>ACTION</span>
          </button>

          {/* Passer cette carte button matching screenshot */}
          <button
            type="button"
            onClick={handlePass}
            className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-[#433171] hover:bg-[#523d87] text-slate-200 font-semibold text-xs sm:text-sm shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95 whitespace-nowrap"
          >
            <span>Passer cette carte</span>
            <ArrowRight className="w-4 h-4 text-slate-300" />
          </button>

        </div>

        {/* Final Complete Validation bar */}
        <button
          type="button"
          onClick={handleComplete}
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Défi Accompli ! (+10 pts)</span>
        </button>

      </div>

    </div>
  );
};
