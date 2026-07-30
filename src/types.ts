export type GameModeId = 'amis' | 'couple' | 'soiree' | 'famille' | 'custom';

export type CardType = 'truth' | 'dare';

export type IntensityLevel = 'soft' | 'medium' | 'spicy';

export type Gender = 'male' | 'female' | 'other';

export interface Player {
  id: string;
  name: string;
  avatar: string; // Emoji or avatar icon key
  color: string;  // Hex or Tailwind color for circle segment
  gender: Gender; // Gender for personalized gages and compatibility
  score: number;
  completedTruths: number;
  completedDares: number;
  passedCount: number;
}

export interface GameMode {
  id: GameModeId;
  name: string;
  subtitle: string;
  description: string;
  iconName: string;
  gradient: string;
  badge: string;
  color: string;
}

export interface CardItem {
  id: string | number;
  type: CardType;
  category?: 'soft' | 'hot' | 'extreme';
  difficulty?: number;
  age_rating?: string;
  text: string;
  tags?: string[];
  mode?: GameModeId;
  intensity?: IntensityLevel;
  custom?: boolean;
  targetPartner?: Player; // Target player for gender compatibility & personalized gages
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  playerId: string;
  playerName: string;
  playerAvatar: string;
  cardType: CardType;
  text: string;
  outcome: 'completed' | 'passed';
  points: number;
}

export type GameState = 
  | 'SETUP_PLAYERS'
  | 'SELECT_MODE'
  | 'SPINNING'
  | 'PLAYER_SELECTED'
  | 'CHOOSING_CARD'
  | 'CARD_DISPLAYED'
  | 'ROUND_RESULT';
