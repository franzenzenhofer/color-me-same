/**
 * @fileoverview Tutorial Level Patterns
 * 
 * This module provides hardcoded patterns for tutorial levels (1-3) to ensure
 * a consistent and optimal learning experience for new players.
 * 
 * @module tutorialPatterns
 */

/**
 * Tutorial pattern configuration
 */
export interface TutorialPattern {
  level: number;
  initialGrid: number[][];
  targetGrid: number[][];
  solution: { row: number; col: number }[];
  message: string;
}

/**
 * Get hardcoded pattern for tutorial levels
 * 
 * @param level - Tutorial level (1-3)
 * @returns Tutorial pattern or null for non-tutorial levels
 */
export function getTutorialPattern(level: number): TutorialPattern | null {
  switch (level) {
    case 1:
      // Level 1: Exactly 1 tap in the center
      return {
        level: 1,
        initialGrid: [
          [0, 0, 0],
          [0, 1, 0],
          [0, 0, 0]
        ],
        targetGrid: [
          [0, 0, 0],
          [0, 0, 0],
          [0, 0, 0]
        ],
        solution: [{ row: 1, col: 1 }],
        message: "Tap center"
      };
      
    case 2:
      // Level 2: Exactly 2 taps to learn + pattern
      return {
        level: 2,
        initialGrid: [
          [0, 1, 0],
          [1, 0, 1],
          [0, 1, 0]
        ],
        targetGrid: [
          [0, 0, 0],
          [0, 0, 0],
          [0, 0, 0]
        ],
        solution: [
          { row: 1, col: 1 }, // Center changes the cross
          { row: 0, col: 1 }  // Top to finish
        ],
        message: "Each tap = + pattern"
      };
      
    case 3:
      // Level 3: Exactly 3 taps to learn color cycling
      return {
        level: 3,
        initialGrid: [
          [1, 0, 1],
          [0, 2, 0],
          [1, 0, 1]
        ],
        targetGrid: [
          [0, 0, 0],
          [0, 0, 0],
          [0, 0, 0]
        ],
        solution: [
          { row: 0, col: 0 }, // Top-left
          { row: 0, col: 2 }, // Top-right  
          { row: 1, col: 1 }  // Center to finish
        ],
        message: "Colors cycle 0→1→2→0"
      };
      
    default:
      return null;
  }
}

/**
 * Check if a level is a tutorial level
 * 
 * @param level - Level number to check
 * @returns True if level 1-3
 */
export function isTutorialLevel(level: number): boolean {
  return level >= 1 && level <= 3;
}

/**
 * Get tutorial completion message
 * 
 * @param level - Tutorial level completed
 * @returns Victory message for tutorial level
 */
export function getTutorialCompleteMessage(level: number): string {
  switch (level) {
    case 1:
      return "Great! Basics learned!";
    case 2:
      return "Nice! + pattern mastered!";
    case 3:
      return "Perfect! Ready to play!";
    default:
      return "";
  }
}