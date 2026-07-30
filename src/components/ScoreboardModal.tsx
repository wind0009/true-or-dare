import React from 'react';
import { Trophy, X, Medal, History, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { HistoryItem, Player } from '../types';
import { sound } from '../utils/sound';

interface ScoreboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  history: HistoryItem[];
  onResetScores: () => void;
}

export const ScoreboardModal: React.FC<ScoreboardModalProps> = ({
  isOpen,
  onClose,
  players,
  history,
  onResetScores,
}) => {
  if (!isOpen) return null;

  // Sort players by score descending
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-white">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black">Classement & Scores 🏆</h2>
              <p className="text-xs text-slate-400">Tableau des points et statistiques de la partie</p>
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

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          
          {/* Leaderboard Section */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Joueurs ({players.length})
            </h3>

            <div className="space-y-2">
              {sortedPlayers.map((player, rank) => {
                let medalColor = '';
                if (rank === 0) medalColor = 'text-amber-400';
                else if (rank === 1) medalColor = 'text-slate-300';
                else if (rank === 2) medalColor = 'text-amber-600';

                return (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-3 sm:p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 text-center font-black text-sm">
                        {rank < 3 ? (
                          <Medal className={`w-5 h-5 mx-auto ${medalColor}`} />
                        ) : (
                          <span className="text-slate-500">#{rank + 1}</span>
                        )}
                      </div>

                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow"
                        style={{ backgroundColor: player.color + '30', border: `2px solid ${player.color}` }}
                      >
                        {player.avatar}
                      </div>

                      <div>
                        <p className="font-extrabold text-sm sm:text-base text-white">{player.name}</p>
                        <p className="text-[10px] sm:text-xs text-slate-400 flex items-center gap-2">
                          <span className="text-blue-400">💬 {player.completedTruths} Vérité(s)</span>
                          <span>•</span>
                          <span className="text-rose-400">🔥 {player.completedDares} Action(s)</span>
                          {player.passedCount > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-slate-500">❌ {player.passedCount} Passé(s)</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-lg sm:text-2xl font-black text-amber-400">
                        {player.score}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-semibold">pts</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* History Log Section */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <History className="w-4 h-4 text-purple-400" />
              <span>Historique des tours ({history.length})</span>
            </h3>

            {history.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-800 rounded-2xl bg-slate-950/40">
                <p className="text-slate-500 text-xs">Aucun tour effectué pour le moment</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 text-xs flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg shrink-0">{item.playerAvatar}</span>
                      <div>
                        <p className="font-bold text-white">
                          {item.playerName}{' '}
                          <span className={item.cardType === 'truth' ? 'text-blue-400' : 'text-rose-400'}>
                            ({item.cardType === 'truth' ? 'Vérité' : 'Action'})
                          </span>
                        </p>
                        <p className="text-slate-400 text-[11px] line-clamp-1 italic mt-0.5">"{item.text}"</p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      {item.outcome === 'completed' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>+10</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-400 font-bold">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>-5</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              sound.playPass();
              onResetScores();
            }}
            className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Réinitialiser les scores</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
