export const COLOR_PALETTE = [
  '#EF4444', // Red - vibrant and accessible
  '#10B981', // Green - good contrast
  '#3B82F6', // Blue - clear distinction
  '#F59E0B', // Amber - warm and visible
  '#8B5CF6', // Purple - distinct hue
  '#06B6D4', // Cyan - cool tone
  '#F97316', // Orange - energetic
  '#EC4899', // Pink - playful
] as const;

export type DifficultyKey = 'easy' | 'medium' | 'hard';

export interface Difficulty {
  size: number;
  colors: number;
  reverseSteps: number;
  maxMoves: number;
  maxLockedTiles: number;
  powerTileChance: number;
  timeLimit: number;     // seconds (0 = no timer)
  tutorial: boolean;
  description: string;
}

export const DIFFICULTIES: Record<DifficultyKey, Difficulty> = {
  easy: { 
    size: 3, 
    colors: 3, 
    reverseSteps: 3, 
    maxMoves: 0, 
    maxLockedTiles: 0,
    powerTileChance: 0, 
    timeLimit: 0, 
    tutorial: false,
    description: 'Perfect for learning! No limits.' 
  },
  medium: { 
    size: 4, 
    colors: 4, 
    reverseSteps: 5, 
    maxMoves: 25, 
    maxLockedTiles: 1,
    powerTileChance: 0.1, 
    timeLimit: 0, 
    tutorial: false,
    description: 'Special tiles & larger board.' 
  },
  hard: { 
    size: 5, 
    colors: 4, 
    reverseSteps: 7, 
    maxMoves: 35, 
    maxLockedTiles: 2,
    powerTileChance: 0.15, 
    timeLimit: 600, 
    tutorial: false,
    description: 'Timer & hardest puzzles.' 
  },
};

// Progression system constants
export const BELT_COLORS = {
  white: { name: 'White', color: '#FFFFFF', minXP: 0 },
  yellow: { name: 'Yellow', color: '#FFAA00', minXP: 500 },
  orange: { name: 'Orange', color: '#FF6B35', minXP: 1500 },
  green: { name: 'Green', color: '#44DD44', minXP: 3000 },
  blue: { name: 'Blue', color: '#4444FF', minXP: 5000 },
  purple: { name: 'Purple', color: '#AA44FF', minXP: 8000 },
} as const;

export const ACHIEVEMENTS = [
  { id: 'first_win', name: 'First Victory', description: 'Complete your first puzzle', xp: 100 },
  { id: 'perfect_solve', name: 'Perfect Solution', description: 'Solve a puzzle optimally', xp: 200 },
  { id: 'speed_demon', name: 'Speed Demon', description: 'Solve a puzzle in under 30 seconds', xp: 150 },
  { id: 'streak_5', name: 'On Fire', description: '5 day streak', xp: 250 },
  { id: 'streak_30', name: 'Dedication', description: '30 day streak', xp: 1000 },
] as const;