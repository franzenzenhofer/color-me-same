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
      // Level 1: REVERSE GENERATED - Start from solved (all 0s), apply 1 click at center
      // Reverse: [0,0,0; 0,0,0; 0,0,0] + click(1,1) = [0,1,0; 1,1,1; 0,1,0]
      return {
        level: 1,
        initialGrid: [
          [0, 1, 0],
          [1, 1, 1],
          [0, 1, 0]
        ],
        targetGrid: [
          [0, 0, 0],
          [0, 0, 0],
          [0, 0, 0]
        ],
        solution: [{ row: 1, col: 1 }], // Exactly 1 tap center
        message: "Tutorial 1/3"
      };
      
    case 2:
      // Level 2: REVERSE GENERATED - Start from solved, apply 2 clicks
      // Reverse: [0,0,0; 0,0,0; 0,0,0] + click(0,1) + click(1,1) = specific pattern
      // After click(0,1): [1,1,1; 0,1,0; 0,0,0]
      // After click(1,1): [1,0,1; 1,1,1; 0,1,0]
      return {
        level: 2,
        initialGrid: [
          [1, 0, 1],
          [1, 1, 1],
          [0, 1, 0]
        ],
        targetGrid: [
          [0, 0, 0],
          [0, 0, 0],
          [0, 0, 0]
        ],
        solution: [
          { row: 0, col: 1 }, // First tap - top center
          { row: 1, col: 1 }  // Second tap - center
        ],
        message: "Tutorial 2/3"
      };
      
    case 3:
      // Level 3: REVERSE GENERATED - Start from solved, apply 3 clicks  
      // Reverse: [0,0,0; 0,0,0; 0,0,0] + click(0,0) + click(0,2) + click(2,1) = specific pattern
      return {
        level: 3,
        initialGrid: [
          [1, 1, 1],
          [1, 0, 1],
          [1, 1, 1]
        ],
        targetGrid: [
          [0, 0, 0],
          [0, 0, 0],
          [0, 0, 0]
        ],
        solution: [
          { row: 0, col: 0 }, // First tap - top-left
          { row: 0, col: 2 }, // Second tap - top-right  
          { row: 2, col: 1 }  // Third tap - bottom-center
        ],
        message: "Tutorial 3/3"
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
      return "1/3";
    case 2:
      return "2/3";
    case 3:
      return "3/3";
    default:
      return "";
  }
}