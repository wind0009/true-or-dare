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

// Smart intensity classifier to assign every question to its precise intensity level
const determineIntensity = (item: any): IntensityLevel => {
  const text = (item.text || '').toLowerCase();
  const tags = (item.tags || []).map((t: string) => String(t).toLowerCase());
  const category = item.category || 'soft';
  const age = item.age_rating || '13+';
  const difficulty = item.difficulty || 1;

  // 1. HOT (Sensual, flirty, romantic, physical attraction, romance, kiss, lapdance, seduction, etc.)
  const hotKeywords = [
    'sexy', 'embrasser', 'fantasme', 'lit', 'culotte', 'massage', 'sérénade',
    'faire l\'amour', 'baiser', 'position', 'séduire', 'seduction', 'séduction',
    'caresse', 'charme', 'attirance', 'crush', 'nu', 'nue', 'coquin', 'coquine',
    'lap-dance', 'sextoy', 'mots coquins', 'tenue', 'yeux doux', 'déshabill',
    'séduisante', 'séduisant', 'désir', 'poitrine', 'fesses', 'cuisse',
    'bisou', 'lèvres', 'corps', 'satin', 'amour', 'coup de foudre', 'flirt', 'orgasme'
  ];
  const hotTags = ['sexy', 'fantasme', 'coquin', 'plaisir', 'seduction', 'séduction', 'intimité', 'charme', 'flirt'];

  const isHotByText = hotKeywords.some(k => text.includes(k)) || hotTags.some(t => tags.includes(t));

  if (isHotByText || (category === 'hot' && (age === '18+' || difficulty >= 3))) {
    return 'hot';
  }

  // 2. EXTREME (Wildest dares, extreme forfeit, no filter secrets, extreme challenges)
  const extremeKeywords = [
    'forfeit', 'sans filtre', 'story', 'post', 'publier', 'réseau', 'tatouage',
    'boire', 'cul sec', 'sexe', 'ex', 'trompé', 'fétichisme', 'pire secret', 'honte absolue',
    '1 million', '1000€', 'pipi', 'mordre', 'lécher', 'glaçon', 'strip', 'choc', 'piment', 'moutarde'
  ];
  const extremeTags = ['extreme', 'extrême', 'choc', 'trash', 'hardcore', 'forfeit', 'pari'];

  const isExtremeByText = extremeKeywords.some(k => text.includes(k)) || extremeTags.some(t => tags.includes(t));

  if (isExtremeByText || category === 'extreme' || difficulty >= 5) {
    return 'extreme';
  }

  // 3. HARD (Challenging, embarrassing secrets, physical feats, awkward/bold dares)
  if (difficulty >= 3 || age === '16+' || category === 'hot' || text.includes('honte') || text.includes('pire') || text.includes('mensonge') || text.includes('secret') || text.includes('pompes') || text.includes('squats') || text.includes('bras de fer') || text.includes('imitation')) {
    return 'hard';
  }

  // 4. SOFT (Fun, lighthearted, easy, family-friendly)
  return 'soft';
};

// Targeted questions mentioning other players directly with {target} across all 4 intensity levels
const EXTRA_TARGETED_QUESTIONS: CardItem[] = [
  // --- SOFT ---
  { id: 'ext_s_1', type: 'dare', category: 'soft', intensity: 'soft', difficulty: 1, text: 'Fais les yeux doux à {target} pendant 10 secondes sans rigoler !' },
  { id: 'ext_s_2', type: 'dare', category: 'soft', intensity: 'soft', difficulty: 1, text: 'Fais un compliment très sincère et original à {target}.' },
  { id: 'ext_s_3', type: 'dare', category: 'soft', intensity: 'soft', difficulty: 1, text: 'Propose un bras de fer éclair à {target} !' },
  { id: 'ext_s_4', type: 'dare', category: 'soft', intensity: 'soft', difficulty: 1, text: 'Invente une poignée de main secrète et stylée avec {target} en 15 secondes.' },
  { id: 'ext_s_5', type: 'dare', category: 'soft', intensity: 'soft', difficulty: 1, text: 'Fais la meilleure imitation possible de {target} pendant 20 secondes !' },
  { id: 'ext_s_6', type: 'truth', category: 'soft', intensity: 'soft', difficulty: 1, text: 'Quelle a été ta toute première impression sur {target} quand tu l\'as rencontré(e) ?' },
  { id: 'ext_s_7', type: 'truth', category: 'soft', intensity: 'soft', difficulty: 2, text: 'Quel est le trait de caractère que tu admires le plus chez {target} ?' },

  // --- HOT ---
  { id: 'ext_h_1', type: 'dare', category: 'hot', intensity: 'hot', difficulty: 3, text: 'Chante une sérénade improvisée de 15 secondes à {target} en le/la regardant dans les yeux.' },
  { id: 'ext_h_2', type: 'dare', category: 'hot', intensity: 'hot', difficulty: 3, text: 'Fais un massage apaisant des épaules de 20 secondes à {target}.' },
  { id: 'ext_h_3', type: 'dare', category: 'hot', intensity: 'hot', difficulty: 3, text: 'Chuchote un compliment très mystérieux ou romantique à l\'oreille de {target}.' },
  { id: 'ext_h_4', type: 'dare', category: 'hot', intensity: 'hot', difficulty: 4, text: 'Fais une déclaration d\'amour théâtrale et passionnée à {target} !' },
  { id: 'ext_h_5', type: 'dare', category: 'hot', intensity: 'hot', difficulty: 3, text: 'Mime une scène de film romantique culte avec {target} pendant 15 secondes.' },
  { id: 'ext_h_6', type: 'truth', category: 'hot', intensity: 'hot', difficulty: 3, text: 'Avis sincère : quelle note sur 10 donnes-tu au charme ou au style de {target} ce soir ?' },
  { id: 'ext_h_7', type: 'truth', category: 'hot', intensity: 'hot', difficulty: 3, text: 'Quelle tenue ou vêtement porté(e) par {target} trouves-tu le plus élégant(e) ou attrayant(e) ?' },

  // --- HARD ---
  { id: 'ext_hd_1', type: 'dare', category: 'extreme', intensity: 'hard', difficulty: 3, text: 'Laisse {target} te dessiner un petit motif marrant sur la main avec un stylo.' },
  { id: 'ext_hd_2', type: 'dare', category: 'extreme', intensity: 'hard', difficulty: 4, text: 'Donne à {target} un surnom hilarant qu\'il/elle devra garder jusqu\'à la fin de la partie !' },
  { id: 'ext_hd_3', type: 'dare', category: 'extreme', intensity: 'hard', difficulty: 4, text: 'Fais 10 pompes ou 10 squats juste devant {target} en restant ultra sérieux !' },
  { id: 'ext_hd_4', type: 'dare', category: 'extreme', intensity: 'hard', difficulty: 4, text: 'Échange ta place avec {target} et imite toutes ses réactions pendant 1 tour.' },
  { id: 'ext_hd_5', type: 'truth', category: 'extreme', intensity: 'hard', difficulty: 3, text: 'Si tu devais partir sur une île déserte uniquement avec {target}, quelle serait votre première dispute ?' },
  { id: 'ext_hd_6', type: 'truth', category: 'extreme', intensity: 'hard', difficulty: 4, text: 'Penses-tu que {target} garderait un secret si tu lui confiais ta plus grande honte ?' },

  // --- EXTREME ---
  { id: 'ext_ex_1', type: 'dare', category: 'extreme', intensity: 'extreme', difficulty: 5, text: 'Laisse {target} choisir le gage que tu devras obligatoirement réaliser au prochain tour !' },
  { id: 'ext_ex_2', type: 'dare', category: 'extreme', intensity: 'extreme', difficulty: 5, text: 'Laisse {target} poster un emoji mystérieux dans ta story ou envoyer un mot rigolo à un ami.' },
  { id: 'ext_ex_3', type: 'dare', category: 'extreme', intensity: 'extreme', difficulty: 5, text: 'Tiens le regard avec {target} pendant 20 secondes : le premier qui flanche ou rigole a un gage !' },
  { id: 'ext_ex_4', type: 'truth', category: 'extreme', intensity: 'extreme', difficulty: 5, text: 'Si {target} gagnait 1 million d\'euros demain, quelle est la première chose ridicule qu\'il/elle achèterait ?' },
  { id: 'ext_ex_5', type: 'truth', category: 'extreme', intensity: 'extreme', difficulty: 5, text: 'Combien de temps tiendrais-tu dans une maison hantée en duo avec {target} sans hurler ?' },
];

// Map 600 JSON items + Extra items into typed CardItems with smart intensity classifier
export const FULL_DATABASE: CardItem[] = [
  ...(rawDatabase as any[]).map((item) => {
    const intensity = determineIntensity(item);

    const modeId: GameModeId =
      intensity === 'hot' || item.category === 'hot'
        ? 'couple'
        : intensity === 'extreme' || item.category === 'extreme'
        ? 'soiree'
        : 'amis';

    return {
      id: `db_${item.id}`,
      type: item.type as CardType,
      category: item.category as 'soft' | 'hot' | 'extreme',
      difficulty: item.difficulty || 1,
      age_rating: item.age_rating || '13+',
      text: item.text,
      tags: item.tags || [],
      mode: modeId,
      intensity,
    };
  }),
  ...EXTRA_TARGETED_QUESTIONS,
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
  // Filter questions matching type & selected intensity level first
  let matched = FULL_DATABASE.filter((c) => {
    if (c.type !== type) return false;
    return c.intensity === intensity;
  });

  // If none matched for exact intensity, filter by mode / category
  if (matched.length === 0) {
    matched = FULL_DATABASE.filter((c) => {
      if (c.type !== type) return false;
      if (mode === 'famille') return c.category === 'soft';
      if (mode === 'couple') return c.category === 'hot' || c.category === 'soft';
      if (mode === 'soiree') return c.category === 'extreme' || c.category === 'hot';
      return true;
    });
  }

  // Fallback to type matching
  if (matched.length === 0) {
    matched = FULL_DATABASE.filter((c) => c.type === type);
  }

  // Pick random card
  const rawCard = matched[Math.floor(Math.random() * matched.length)];
  let cardText = rawCard.text;
  let targetPartner: Player | null = null;

  if (allPlayers.length > 1) {
    targetPartner = selectCompatiblePartner(currentPlayer, allPlayers, mode);

    if (targetPartner) {
      const partnerGenderSymbol = targetPartner.gender === 'male' ? '👨' : targetPartner.gender === 'female' ? '👩' : '✨';
      const partnerNameFormatted = `**${targetPartner.name} ${partnerGenderSymbol}**`;

      // Replace explicit target placeholders naturally
      const targetRegex = /\{target\}|\{TARGET\}|\{PARTENAIRE\}|la personne de ton choix|une personne volontaire|une personne de ton choix|un autre joueur|un joueur autour de la table/gi;
      cardText = cardText.replace(targetRegex, partnerNameFormatted);
    }
  }

  // Final cleanup of any unreplaced placeholders
  cardText = cardText
    .replace(/\{target\}|\{TARGET\}|\{PARTENAIRE\}/gi, "un autre joueur")
    .replace(/la personne de ton choix|une personne volontaire|une personne de ton choix/gi, "un autre joueur");

  return {
    ...rawCard,
    text: cardText,
    targetPartner: targetPartner || undefined,
  };
};

