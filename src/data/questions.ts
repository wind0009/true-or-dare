import { CardItem, CardType, GameMode, GameModeId, IntensityLevel, Player } from '../types';

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

const card = (
  id: string,
  type: CardType,
  category: 'soft' | 'hot' | 'extreme',
  text: string,
  difficulty = 1,
): CardItem => ({
  id,
  type,
  category,
  difficulty,
  age_rating: category === 'hot' ? '18+' : category === 'extreme' ? '16+' : '13+',
  text,
  tags: [],
  mode: category === 'hot' ? 'couple' : category === 'extreme' ? 'soiree' : 'amis',
  intensity: difficulty <= 2 ? 'soft' : difficulty === 3 ? 'medium' : 'spicy',
});

// Des cartes courtes, naturelles et faciles à lancer dans une vraie soirée.
export const FULL_DATABASE: CardItem[] = [
  card('soft-t1', 'truth', 'soft', 'C’est quoi ton plus gros délire en ce moment ?'),
  card('soft-t2', 'truth', 'soft', 'Tu préfères quoi chez toi ?'),
  card('soft-t3', 'truth', 'soft', 'C’est quoi ton dernier gros fou rire ?'),
  card('soft-t4', 'truth', 'soft', 'Tu as déjà eu un gros coup de honte pour quoi ?'),
  card('soft-t5', 'truth', 'soft', 'C’est quoi le truc le plus bizarre que tu aimes bien ?'),
  card('soft-t6', 'truth', 'soft', 'Qui ici te fait le plus rire ?'),
  card('soft-d1', 'dare', 'soft', 'Imite quelqu’un du groupe pendant 20 secondes.'),
  card('soft-d2', 'dare', 'soft', 'Parle avec un accent jusqu’à ton prochain tour.'),
  card('soft-d3', 'dare', 'soft', 'Fais ta meilleure danse pendant 15 secondes.'),
  card('soft-d4', 'dare', 'soft', 'Laisse le groupe choisir une chanson : chante le refrain.'),
  card('soft-d5', 'dare', 'soft', 'Fais deviner un film sans parler.'),
  card('soft-d6', 'dare', 'soft', 'Fais un compliment à la personne à ta droite.'),
  card('hot-t1', 'truth', 'hot', 'C’est quoi ton type de personne, en vrai ?'),
  card('hot-t2', 'truth', 'hot', 'C’est quoi le meilleur compliment qu’on puisse te faire ?'),
  card('hot-t3', 'truth', 'hot', 'Tu as déjà crushé sur quelqu’un ici ?'),
  card('hot-t4', 'truth', 'hot', 'C’est quoi ton date parfait ?'),
  card('hot-t5', 'truth', 'hot', 'Tu regardes quoi en premier chez quelqu’un ?'),
  card('hot-t6', 'truth', 'hot', 'Le truc le plus mignon qu’on ait fait pour toi ?'),
  card('hot-d1', 'dare', 'hot', 'Dis un compliment sincère à la personne de ton choix.'),
  card('hot-d2', 'dare', 'hot', 'Regarde une personne dans les yeux pendant 10 secondes.'),
  card('hot-d3', 'dare', 'hot', 'Fais une mini déclaration drôle à la personne de ton choix.'),
  card('hot-d4', 'dare', 'hot', 'Envoie un emoji qui te représente à la personne de ton choix.'),
  card('hot-d5', 'dare', 'hot', 'Propose un date complètement absurde à une personne volontaire.'),
  card('hot-d6', 'dare', 'hot', 'Dis à qui tu laisserais choisir la prochaine musique.'),
  card('party-t1', 'truth', 'extreme', 'C’est quoi le mensonge le plus nul que tu as déjà sorti ?', 3),
  card('party-t2', 'truth', 'extreme', 'C’est quoi le truc le plus gênant dans ton téléphone ?', 3),
  card('party-t3', 'truth', 'extreme', 'Tu as déjà stalké quelqu’un sur les réseaux ?', 3),
  card('party-t4', 'truth', 'extreme', 'Tu as déjà fait semblant d’aimer un cadeau ?', 3),
  card('party-t5', 'truth', 'extreme', 'C’est quoi ton pire message envoyé au mauvais moment ?', 3),
  card('party-t6', 'truth', 'extreme', 'Quelle excuse bidon tu utilises le plus ?', 3),
  card('party-d1', 'dare', 'extreme', 'Laisse le groupe choisir ta photo de profil pendant 10 minutes.', 3),
  card('party-d2', 'dare', 'extreme', 'Fais une pub ultra sérieuse pour un objet dans la pièce.', 3),
  card('party-d3', 'dare', 'extreme', 'Fais 10 secondes de stand-up sur quelqu’un du groupe.', 3),
  card('party-d4', 'dare', 'extreme', 'Laisse le groupe te donner un surnom pour la partie.', 3),
  card('party-d5', 'dare', 'extreme', 'Fais une voix de dessin animé jusqu’à ton prochain tour.', 3),
  card('party-d6', 'dare', 'extreme', 'Fais le défilé le plus gênant possible.', 3),
];

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
