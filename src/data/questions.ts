import { CardItem, CardType, GameMode, GameModeId, IntensityLevel, Player } from '../types';
import rawDatabase from './raw_questions.json';

export const GAME_MODES: GameMode[] = [
  {
    id: 'amis',
    name: 'Amis',
    subtitle: 'Fous rires & secrets',
    description: 'Parfait pour s\'amuser entre potes, se taquiner et découvrir de folles anecdotes !',
    iconName: 'Users',
    gradient: 'from-amber-500 via-orange-500 to-rose-500',
    badge: 'Populaire 🔥',
    color: '#f97316',
  },
  {
    id: 'soiree',
    name: 'Soirée & Fête',
    subtitle: 'Ambiance survoltée',
    description: 'Relève la température avec des défis déjantés, des imitations et des fous rires garantis !',
    iconName: 'PartyPopper',
    gradient: 'from-purple-600 via-pink-600 to-red-500',
    badge: 'Soirée 🍸',
    color: '#a855f7',
  },
  {
    id: 'couple',
    name: 'Couple & Duo',
    subtitle: 'Complicité & Romantisme',
    description: 'Questions intimes, vérités touchantes et petites attentions pour pimenter votre duo.',
    iconName: 'Heart',
    gradient: 'from-rose-500 via-pink-500 to-purple-500',
    badge: 'Romantique 💕',
    color: '#ec4899',
  },
  {
    id: 'famille',
    name: 'Famille & Soft',
    subtitle: 'Tout public & Fun',
    description: '100% adapté aux petits et grands sans gêne ! Blagues, devinettes et défis rigolos.',
    iconName: 'Smile',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    badge: 'Familial 🎈',
    color: '#10b981',
  },
];

// Map 600 JSON items into typed CardItems
export const FULL_DATABASE: CardItem[] = (rawDatabase as any[]).map((item) => ({
  id: `db_${item.id}`,
  type: item.type as CardType,
  category: item.category as 'soft' | 'hot' | 'extreme',
  difficulty: item.difficulty || 1,
  age_rating: item.age_rating || '13+',
  text: item.text,
  tags: item.tags || [],
  mode:
    item.category === 'hot'
      ? 'couple'
      : item.category === 'extreme'
      ? 'soiree'
      : 'amis',
  intensity:
    item.difficulty <= 2
      ? 'soft'
      : item.difficulty === 3
      ? 'medium'
      : 'spicy',
}));

// Fallback initial questions list
export const INITIAL_QUESTIONS: CardItem[] = FULL_DATABASE;

// Select a partner based on gender compatibility or random active player
export const selectCompatiblePartner = (currentPlayer: Player, allPlayers: Player[], mode: GameModeId): Player | null => {
  const candidates = allPlayers.filter((p) => p.id !== currentPlayer.id);
  if (candidates.length === 0) return null;

  // In Couple or Soirée or Hot modes, prefer opposite gender for romantic compatibility
  if (mode === 'couple' || mode === 'soiree') {
    const oppositeGender = currentPlayer.gender === 'male' ? 'female' : currentPlayer.gender === 'female' ? 'male' : null;
    if (oppositeGender) {
      const compatible = candidates.filter((p) => p.gender === oppositeGender);
      if (compatible.length > 0) {
        return compatible[Math.floor(Math.random() * compatible.length)];
      }
    }
  }

  // Otherwise pick any random player
  return candidates[Math.floor(Math.random() * candidates.length)];
};

// Smart card generator with personalized partner replacement according to gender & compatibility
export const getSmartCard = (
  type: CardType,
  mode: GameModeId,
  intensity: IntensityLevel,
  currentPlayer: Player,
  allPlayers: Player[]
): CardItem => {
  // Filter questions matching type, category/mode, and intensity
  let matched = FULL_DATABASE.filter((c) => {
    if (c.type !== type) return false;

    if (mode === 'famille') {
      return c.category === 'soft' && c.difficulty <= 3;
    }
    if (mode === 'couple') {
      return c.category === 'hot' || c.category === 'soft';
    }
    if (mode === 'soiree') {
      return c.category === 'extreme' || c.category === 'hot' || c.difficulty >= 2;
    }
    // Mode 'amis'
    return c.category === 'soft' || c.category === 'extreme';
  });

  if (matched.length === 0) {
    matched = FULL_DATABASE.filter((c) => c.type === type);
  }

  // Pick random card
  const rawCard = matched[Math.floor(Math.random() * matched.length)];
  let cardText = rawCard.text;
  let targetPartner: Player | null = null;

  // Check if text refers to another player / partner
  const needsPartner =
    cardText.includes('la personne de ton choix') ||
    cardText.includes('une personne volontaire') ||
    cardText.includes('une personne de ton choix') ||
    cardText.includes('avec elle') ||
    cardText.includes('avec lui') ||
    rawCard.category === 'hot';

  if (needsPartner && allPlayers.length > 1) {
    targetPartner = selectCompatiblePartner(currentPlayer, allPlayers, mode);

    if (targetPartner) {
      const partnerGenderSymbol = targetPartner.gender === 'male' ? '👨' : targetPartner.gender === 'female' ? '👩' : '✨';
      const partnerNameFormatted = `**${targetPartner.name} ${partnerGenderSymbol}**`;

      cardText = cardText
        .replace(/la personne de ton choix/g, partnerNameFormatted)
        .replace(/une personne volontaire/g, partnerNameFormatted)
        .replace(/une personne de ton choix/g, partnerNameFormatted);
    }
  }

  return {
    ...rawCard,
    text: cardText,
    targetPartner: targetPartner || undefined,
  };
};
