import React, { useState } from 'react';
import { Plus, Trash2, UserPlus, Sparkles, ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react';
import { Gender, Player } from '../types';
import { sound } from '../utils/sound';

interface PlayerSetupProps {
  players: Player[];
  onUpdatePlayers: (players: Player[]) => void;
  onNext: () => void;
}

const AVATAR_PRESETS = [
  '🔥', '👑', '😎', '💃', '🕺', '🥳', '🦄', '🦁', 
  '🦊', '🐼', '🚀', '💎', '⭐', '🌶️', '🍕', '🎉'
];

const PLAYER_COLORS = [
  '#f97316', '#a855f7', '#ec4899', '#10b981', 
  '#06b6d4', '#3b82f6', '#eab308', '#ef4444'
];

export const PlayerSetup: React.FC<PlayerSetupProps> = ({
  players,
  onUpdatePlayers,
  onNext,
}) => {
  const [newName, setNewName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('😎');
  const [selectedGender, setSelectedGender] = useState<Gender>('female');

  const handleAddPlayer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;

    sound.playClick();
    const color = PLAYER_COLORS[players.length % PLAYER_COLORS.length];
    const newPlayer: Player = {
      id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: trimmed,
      avatar: selectedAvatar,
      color,
      gender: selectedGender,
      score: 0,
      completedTruths: 0,
      completedDares: 0,
      passedCount: 0,
    };

    onUpdatePlayers([...players, newPlayer]);
    setNewName('');
    // Cycle avatar preset
    const nextAvatar = AVATAR_PRESETS[(AVATAR_PRESETS.indexOf(selectedAvatar) + 1) % AVATAR_PRESETS.length];
    setSelectedAvatar(nextAvatar);
  };

  const handleRemovePlayer = (id: string) => {
    sound.playPass();
    onUpdatePlayers(players.filter((p) => p.id !== id));
  };

  const handleToggleGender = (id: string) => {
    sound.playClick();
    const genders: Gender[] = ['female', 'male', 'other'];
    onUpdatePlayers(
      players.map((p) => {
        if (p.id === id) {
          const nextIdx = (genders.indexOf(p.gender) + 1) % genders.length;
          return { ...p, gender: genders[nextIdx] };
        }
        return p;
      })
    );
  };

  const handleLoadPreset = (presetName: 'friends' | 'couple' | 'party') => {
    sound.playSuccess();
    if (presetName === 'friends') {
      onUpdatePlayers([
        { id: 'p1', name: 'Alex', avatar: '😎', color: '#f97316', gender: 'male', score: 0, completedTruths: 0, completedDares: 0, passedCount: 0 },
        { id: 'p2', name: 'Sophie', avatar: '👑', color: '#ec4899', gender: 'female', score: 0, completedTruths: 0, completedDares: 0, passedCount: 0 },
        { id: 'p3', name: 'Lucas', avatar: '🔥', color: '#a855f7', gender: 'male', score: 0, completedTruths: 0, completedDares: 0, passedCount: 0 },
        { id: 'p4', name: 'Maya', avatar: '🥳', color: '#10b981', gender: 'female', score: 0, completedTruths: 0, completedDares: 0, passedCount: 0 },
      ]);
    } else if (presetName === 'couple') {
      onUpdatePlayers([
        { id: 'p1', name: 'Mon Amour 💖', avatar: '👑', color: '#ec4899', gender: 'female', score: 0, completedTruths: 0, completedDares: 0, passedCount: 0 },
        { id: 'p2', name: 'Mon Cœur 💕', avatar: '🔥', color: '#f97316', gender: 'male', score: 0, completedTruths: 0, completedDares: 0, passedCount: 0 },
      ]);
    } else if (presetName === 'party') {
      onUpdatePlayers([
        { id: 'p1', name: 'Léa', avatar: '💃', color: '#ec4899', gender: 'female', score: 0, completedTruths: 0, completedDares: 0, passedCount: 0 },
        { id: 'p2', name: 'Thomas', avatar: '🕺', color: '#3b82f6', gender: 'male', score: 0, completedTruths: 0, completedDares: 0, passedCount: 0 },
        { id: 'p3', name: 'Chloé', avatar: '🥳', color: '#a855f7', gender: 'female', score: 0, completedTruths: 0, completedDares: 0, passedCount: 0 },
        { id: 'p4', name: 'Hugo', avatar: '🚀', color: '#10b981', gender: 'male', score: 0, completedTruths: 0, completedDares: 0, passedCount: 0 },
        { id: 'p5', name: 'Emma', avatar: '💎', color: '#06b6d4', gender: 'female', score: 0, completedTruths: 0, completedDares: 0, passedCount: 0 },
      ]);
    }
  };

  const getGenderBadge = (g: Gender) => {
    switch (g) {
      case 'male':
        return { label: 'Homme 👨', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
      case 'female':
        return { label: 'Femme 👩', color: 'bg-pink-500/20 text-pink-300 border-pink-500/30' };
      default:
        return { label: 'Autre ✨', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-4 sm:p-6 bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl text-white">
      
      {/* Title */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold mb-2">
          <span>Étape 1 sur 2</span>
          <span className="w-1 h-1 rounded-full bg-rose-500"></span>
          <span>Joueurs & Genre pour Gages</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-white via-slate-100 to-rose-200 bg-clip-text text-transparent">
          Qui va tourner la roue ? 🎡
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Définissez le sexe des joueurs pour des gages ciblés et compatibles !
        </p>
      </div>

      {/* Quick Presets */}
      <div className="mb-6 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
        <p className="text-xs text-slate-400 mb-2 font-medium flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Remplissage rapide :</span>
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleLoadPreset('friends')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-amber-300 border border-slate-700/80 transition-all active:scale-95 flex items-center gap-1.5"
          >
            <span>👥 Amis (4)</span>
          </button>
          <button
            type="button"
            onClick={() => handleLoadPreset('couple')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-pink-300 border border-slate-700/80 transition-all active:scale-95 flex items-center gap-1.5"
          >
            <span>💕 Duo Couple (2)</span>
          </button>
          <button
            type="button"
            onClick={() => handleLoadPreset('party')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-purple-300 border border-slate-700/80 transition-all active:scale-95 flex items-center gap-1.5"
          >
            <span>🍸 Soirée (5)</span>
          </button>
        </div>
      </div>

      {/* Add Player Input Form */}
      <form onSubmit={handleAddPlayer} className="mb-6">
        <div className="flex flex-col gap-3">
          
          {/* Avatar selector bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs text-slate-400 font-medium mr-1 shrink-0">Avatar:</span>
            {AVATAR_PRESETS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setSelectedAvatar(emoji)}
                className={`w-8 h-8 rounded-xl text-base flex items-center justify-center shrink-0 transition-all ${
                  selectedAvatar === emoji
                    ? 'bg-rose-500/30 border-2 border-rose-500 scale-110'
                    : 'bg-slate-800/80 border border-slate-700/60 hover:bg-slate-700'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Gender selection buttons */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium shrink-0">Genre / Sexe:</span>
            <div className="grid grid-cols-3 gap-1.5 flex-1">
              <button
                type="button"
                onClick={() => setSelectedGender('female')}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all border ${
                  selectedGender === 'female'
                    ? 'bg-pink-500/30 text-pink-200 border-pink-500 shadow-sm'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                Femme 👩
              </button>
              <button
                type="button"
                onClick={() => setSelectedGender('male')}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all border ${
                  selectedGender === 'male'
                    ? 'bg-blue-500/30 text-blue-200 border-blue-500 shadow-sm'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                Homme 👨
              </button>
              <button
                type="button"
                onClick={() => setSelectedGender('other')}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all border ${
                  selectedGender === 'other'
                    ? 'bg-purple-500/30 text-purple-200 border-purple-500 shadow-sm'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                Autre ✨
              </button>
            </div>
          </div>

          {/* Name input + Add button */}
          <div className="flex items-center gap-2 mt-1">
            <div className="relative flex-1">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Prénom du joueur..."
                className="w-full bg-slate-950 border border-slate-700/80 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 text-white rounded-2xl px-4 py-3 text-sm placeholder-slate-500 outline-none transition-all"
                maxLength={20}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-lg">
                {selectedAvatar}
              </span>
            </div>

            <button
              type="submit"
              disabled={!newName.trim()}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-rose-500/25 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all active:scale-95 shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>Ajouter</span>
            </button>
          </div>

        </div>
      </form>

      {/* Players List */}
      <div className="space-y-2 mb-6 max-h-60 overflow-y-auto pr-1">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-medium">
          <span>Joueurs inscrits ({players.length})</span>
          {players.length < 2 && (
            <span className="text-amber-400">Ajoute au moins 2 joueurs</span>
          )}
        </div>

        {players.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-slate-800 rounded-2xl bg-slate-950/40">
            <p className="text-slate-500 text-sm">Aucun joueur ajouté pour le moment</p>
            <p className="text-slate-600 text-xs mt-1">Saisis un prénom ci-dessus ou clique sur un modèle rapide</p>
          </div>
        ) : (
          players.map((p, index) => {
            const badge = getGenderBadge(p.gender);
            return (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-500 w-4 text-center">
                    #{index + 1}
                  </span>
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-md"
                    style={{ backgroundColor: p.color + '25', border: `2px solid ${p.color}` }}
                  >
                    {p.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-white">{p.name}</p>
                      <button
                        type="button"
                        onClick={() => handleToggleGender(p.id)}
                        className={`text-[10px] px-2 py-0.5 rounded-full border font-bold transition-all ${badge.color}`}
                        title="Cliquer pour changer le genre"
                      >
                        {badge.label}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400">Prêt pour le tirage</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemovePlayer(p.id)}
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Supprimer ce joueur"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Start Game Button */}
      <button
        type="button"
        disabled={players.length < 2}
        onClick={() => {
          sound.playSuccess();
          onNext();
        }}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 hover:opacity-95 text-white font-extrabold text-base shadow-xl shadow-rose-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-98"
      >
        <span>Choisir le mode de jeu</span>
        <ArrowRight className="w-5 h-5" />
      </button>

    </div>
  );
};
