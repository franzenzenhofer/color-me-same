/**
 * @fileoverview Level Configuration System
 * 
 * This module manages the configuration for each level in the game's
 * progression system. It provides a deterministic way to calculate
 * game parameters based on the level number.
 * 
 * The progression is designed to:
 * - Start very simple (3x3, 1 move) for tutorial
 * - Gradually increase grid size at key milestones
 * - Introduce new mechanics (colors, power tiles, locked tiles) progressively
 * - Maintain a smooth difficulty curve
 * 
 * @module levelConfig
 */

export interface LevelConfig {
  level: number;
  gridSize: number;
  colors: number;
  requiredMoves: number;
  powerTiles: number;
  lockedTiles: number;
  hintsEnabled: boolean;
  timeLimit: number; // seconds, 0 = no limit
}

/**
 * Get configuration for a specific level
 * 
 * The progression system is designed around key milestones:
 * - Levels 1-20: Tutorial and basics (3x3 grid)
 * - Levels 21-50: Introduction to complexity (4x4 grid)
 * - Levels 51-100: Advanced mechanics (5x5 grid)
 * - Levels 101+: Expert challenges (larger grids)
 * 
 * @param level - The level number (1-based)
 * @returns Complete configuration for the level
 */
export function getLevelConfig(level: number): LevelConfig {
  // Ensure level is at least 1
  level = Math.max(1, Math.floor(level));
  
  // Grid size progression
  let gridSize: number;
  if (level <= 20) {
    gridSize = 3; // Tutorial and basics
  } else if (level <= 50) {
    gridSize = 4; // Introduction to complexity
  } else if (level <= 100) {
    gridSize = 5; // Advanced mechanics
  } else if (level <= 150) {
    gridSize = 6; // Expert play
  } else if (level <= 200) {
    gridSize = 7; // Master challenges
  } else {
    // Continue growing but cap at reasonable size
    gridSize = Math.min(10, 7 + Math.floor((level - 200) / 50));
  }
  
  // Color progression
  let colors: number;
  if (level <= 20) {
    colors = 3; // Always 3 colors in tutorial
  } else if (level <= 40) {
    colors = 3; // Keep 3 colors for a while
  } else if (level <= 45) {
    colors = 4; // Introduce 4th color
  } else if (level <= 50) {
    colors = 5; // Brief taste of 5 colors
  } else if (level <= 70) {
    colors = 3; // Back to 3 for new grid size
  } else if (level <= 95) {
    colors = 4; // Reintroduce 4 colors
  } else if (level <= 100) {
    colors = 5; // Full 5 colors
  } else {
    // Cycle through 3-5 colors for variety
    const cycle = (level - 101) % 30;
    if (cycle < 10) colors = 3;
    else if (cycle < 20) colors = 4;
    else colors = 5;
  }
  
  // Required moves calculation
  let requiredMoves: number;
  if (level <= 20) {
    // Tutorial: exactly as many moves as the level number
    requiredMoves = level;
  } else if (level <= 50) {
    // Gradually increase from 10 to 39
    requiredMoves = 10 + (level - 21);
  } else if (level <= 100) {
    // Increase from 15 to 64
    requiredMoves = 15 + (level - 51);
  } else {
    // Continue growing but with diminishing increases
    const baseLevel = 100;
    const baseMoves = 64;
    const extraLevels = level - baseLevel;
    // Logarithmic growth to prevent ridiculous move counts
    requiredMoves = Math.floor(baseMoves + Math.log2(extraLevels + 1) * 5);
  }
  
  // Power tiles progression
  let powerTiles: number;
  if (level <= 30) {
    powerTiles = 0; // No power tiles initially
  } else if (level <= 40) {
    powerTiles = 1; // Introduce power tiles
  } else if (level <= 50) {
    powerTiles = 2; // More power tiles
  } else if (level <= 60) {
    powerTiles = 1; // Scale back for new grid
  } else if (level <= 80) {
    powerTiles = 2; // Increase again
  } else if (level <= 100) {
    powerTiles = 3; // Maximum for 5x5
  } else {
    // Scale with grid size but cap at reasonable amount
    const maxPower = Math.floor(gridSize * gridSize * 0.15); // 15% of tiles max
    powerTiles = Math.min(maxPower, 3 + Math.floor((level - 100) / 50));
  }
  
  // Locked tiles progression
  let lockedTiles: number;
  if (level <= 70) {
    lockedTiles = 0; // No locked tiles for a while
  } else if (level <= 85) {
    lockedTiles = 1; // Introduce locked tiles
  } else if (level <= 100) {
    lockedTiles = 2; // More locked tiles
  } else {
    // Scale carefully - locked tiles can make puzzles very hard
    const maxLocked = Math.floor(gridSize * gridSize * 0.1); // 10% of tiles max
    lockedTiles = Math.min(maxLocked, 2 + Math.floor((level - 100) / 75));
  }
  
  // Hints enabled for tutorial levels
  const hintsEnabled = level <= 3;
  
  // Time limits (future feature)
  const timeLimit = 0; // No time limits for now
  
  return {
    level,
    gridSize,
    colors,
    requiredMoves,
    powerTiles,
    lockedTiles,
    hintsEnabled,
    timeLimit
  };
}

/**
 * Get a human-readable description of what's new at this level
 * 
 * @param level - The level number
 * @returns Description of new features/changes at this level
 */
export function getLevelMilestoneDescription(level: number): string | null {
  switch (level) {
    case 1:
      return "Welcome! Click a tile to change colors.";
    case 2:
      return "Great! Now try solving in 2 moves.";
    case 3:
      return "Last tutorial level - hints will be disabled after this.";
    case 4:
      return "Hints disabled - you're on your own now!";
    case 21:
      return "Grid expanded to 4×4!";
    case 31:
      return "Power tiles introduced - they affect a 3×3 area!";
    case 41:
      return "New color added to the palette!";
    case 46:
      return "Maximum 5 colors unlocked!";
    case 51:
      return "Grid expanded to 5×5!";
    case 71:
      return "Locked tiles introduced - click other tiles to unlock!";
    case 101:
      return "Grid expanded to 6×6 - Expert mode!";
    case 151:
      return "Grid expanded to 7×7 - Master challenges!";
    case 201:
      return "Grid expanded to 8×8 - Legendary puzzles!";
    default:
      // Check for every 50 levels
      if (level > 200 && level % 50 === 1) {
        const newSize = Math.min(10, 7 + Math.floor((level - 200) / 50));
        if (newSize > 7 + Math.floor((level - 250) / 50)) {
          return `Grid expanded to ${newSize}×${newSize}!`;
        }
      }
      return null;
  }
}

/**
 * Calculate XP reward for completing a level
 * 
 * @param config - Level configuration
 * @param movesUsed - Actual moves used by player
 * @param hintsUsed - Whether hints were used
 * @returns XP points earned
 */
export function calculateLevelXP(
  config: LevelConfig,
  movesUsed: number,
  hintsUsed: boolean
): number {
  // Base XP scales with level
  const baseXP = 100 + config.level * 10;
  
  // Efficiency bonus
  const efficiency = config.requiredMoves / movesUsed;
  const efficiencyBonus = efficiency >= 1 ? Math.floor(baseXP * 0.5) : 
                          efficiency >= 0.8 ? Math.floor(baseXP * 0.25) : 0;
  
  // Complexity bonus for harder configurations
  const complexityBonus = (config.powerTiles * 50) + (config.lockedTiles * 75);
  
  // Penalty for using hints
  const hintPenalty = hintsUsed ? 0.5 : 1;
  
  return Math.floor((baseXP + efficiencyBonus + complexityBonus) * hintPenalty);
}