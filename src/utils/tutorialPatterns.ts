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
      // Level 1: Just tap the center tile
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
        message: "Welcome! Tap the center tile to make all tiles match!"
      };
      
    case 2:
      // Level 2: Two strategic moves to teach the cross pattern
      return {
        level: 2,
        initialGrid: [
          [0, 1, 0],
          [1, 2, 1],
          [0, 1, 0]
        ],
        targetGrid: [
          [0, 0, 0],
          [0, 0, 0],
          [0, 0, 0]
        ],
        solution: [
          { row: 1, col: 1 }, // Center changes the cross
          { row: 0, col: 1 }  // Top middle to finish
        ],
        message: "Each tap changes tiles in a + pattern. Follow the hints!"
      };
      
    case 3:
      // Level 3: Three moves, introducing color cycling
      return {
        level: 3,
        initialGrid: [
          [1, 0, 2],
          [0, 1, 0],
          [2, 0, 1]
        ],
        targetGrid: [
          [0, 0, 0],
          [0, 0, 0],
          [0, 0, 0]
        ],
        solution: [
          { row: 0, col: 0 }, // Top-left corner
          { row: 2, col: 2 }, // Bottom-right corner
          { row: 1, col: 1 }  // Center to finish
        ],
        message: "Colors cycle: Red → Green → Blue → Red. Try solving without hints!"
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
      return "Perfect! You've learned the basics. Tiles change when you tap them!";
    case 2:
      return "Excellent! You understand the cross pattern. Each tap affects 5 tiles!";
    case 3:
      return "Amazing! You've mastered color cycling. You're ready for real challenges!";
    default:
      return "";
  }
}