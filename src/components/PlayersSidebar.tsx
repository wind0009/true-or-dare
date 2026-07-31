import React, { useState } from 'react';
import { UserPlus, Trash2, Edit2, Check, X, ShieldAlert } from 'lucide-react';
import { Gender, Player } from '../types';
import { sound } from '../utils/sound';

interface PlayersSidebarProps {
  players: Player[];
  activePlayerId?: string | null;
  onUpdatePlayers: (players: Player[]) => void;
  onOpenPlayerSetup?: () => void;
}

const EMOJIS = ['😎', '👑', '🔥', '🦊', '🚀', '⭐', '💎', '🎉', '🦁', '🦄', '🌈', '🍕'];
const COLOR_PALETTE = ['#f97316', '#ec4899', '#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

export const PlayersSidebar: React.FC<PlayersSidebarProps> = ({
  players,
  activePlayerId,
  onUpdatePlayers,
  onOpenPlayerSetup,
}) => {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerGender, setNewPlayerGender] = useState<Gender>('female');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newPlayerName.trim();
    if (!trimmed) return;

    sound.playClick();
    const newPlayer: Player = {
      id: `p_${Date.now()}`,
      name: trimmed,
      avatar: EMOJIS[players.length % EMOJIS.length],
      color: COLOR_PALETTE[players.length % COLOR_PALETTE.length],
      gender: newPlayerGender,
      score: 0,
      completedTruths: 0,
      completedDares: 0,
      passedCount: 0,
    };

    onUpdatePlayers([...players, newPlayer]);
    setNewPlayerName('');
    setIsAdding(false);
  };

  const handleRemovePlayer = (id: string) => {
    if (players.length <= 2) {
      alert('Il faut au moins 2 joueurs dans la partie !');
      return;
    }
    sound.playClick();
    onUpdatePlayers(players.filter((p) => p.id !== id));
  };

  return (
    <div className="w-full bg-white text-slate-900 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between border border-slate-100">
      
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Joueurs</h3>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">
              {players.length} dans la partie
            </p>
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors text-xs font-bold flex items-center gap-1"
            title="Ajouter un joueur"
          >
            <UserPlus className="w-4 h-4 text-rose-500" />
            <span className="hidden sm:inline">Ajouter</span>
          </button>
        </div>

        {/* Quick Add Form */}
        {isAdding && (
          <form onSubmit={handleAddPlayer} className="mb-4 p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Prénom..."
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                autoFocus
                className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <button
                type="submit"
                disabled={!newPlayerName.trim()}
                className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-2 py-2 rounded-xl bg-slate-200 text-slate-600 hover:text-slate-900 text-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1 text-[11px]">
              <span className="text-slate-500 font-bold mr-1">Genre :</span>
              <button
                type="button"
                onClick={() => setNewPlayerGender('female')}
                className={`px-2 py-0.5 rounded-lg border font-bold ${
                  newPlayerGender === 'female' ? 'bg-pink-100 border-pink-400 text-pink-700' : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                Femme
              </button>
              <button
                type="button"
                onClick={() => setNewPlayerGender('male')}
                className={`px-2 py-0.5 rounded-lg border font-bold ${
                  newPlayerGender === 'male' ? 'bg-blue-100 border-blue-400 text-blue-700' : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                Homme
              </button>
            </div>
          </form>
        )}

        {/* Player items list */}
        <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
          {players.map((player) => {
            const isActive = player.id === activePlayerId;

            return (
              <div
                key={player.id}
                className={`group px-4 py-3 rounded-2xl flex items-center justify-between text-sm font-extrabold transition-all border ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-[1.02]'
                    : 'bg-slate-100/90 hover:bg-slate-100 text-slate-800 border-slate-200/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`text-base ${isActive ? 'text-rose-400 font-black' : 'text-slate-400'}`}>
                    {isActive ? '●' : '○'}
                  </span>
                  
                  <span className="text-base">{player.avatar}</span>
                  <span className="truncate max-w-[120px]">{player.name}</span>
                </div>

                <div className="flex items-center gap-2">
                  {players.length > 2 && (
                    <button
                      onClick={() => handleRemovePlayer(player.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1 transition-opacity"
                      title="Supprimer le joueur"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer link to manage full setup */}
      {onOpenPlayerSetup && (
        <div className="mt-4 pt-3 border-t border-slate-100">
          <button
            onClick={onOpenPlayerSetup}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors text-center"
          >
            Gérer la liste complète ⚙️
          </button>
        </div>
      )}

    </div>
  );
};
