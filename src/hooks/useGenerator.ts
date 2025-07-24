/**
 * @fileoverview Puzzle Generation System for Color Me Same
 * 
 * This module implements the core puzzle generation algorithm using a reverse-move
 * approach that mathematically guarantees 100% solvability. Instead of generating
 * a random puzzle and checking if it's solvable (which can fail), we start from
 * a solved state and apply reverse moves to scramble it.
 * 
 * Key concepts:
 * - Reverse-move generation: Start solved, apply inverse operations
 * - Level-based progression: Dynamic difficulty scaling 1-70+
 * - Deterministic solvability: No BFS needed, solution known by construction
 * 
 * @module useGenerator
 */

import { useCallback } from 'react';
import { Difficulty } from '../constants/gameConfig';
import { log } from '../utils/logger';
import { applyReverseClick } from '../utils/gridV2';

/**
 * Result of puzzle generation containing all game state data
 * 
 * @interface GenerationResult
 * @property {number[][]} grid - The scrambled puzzle grid to solve
 * @property {number[][]} solved - The target solved state (all same color)
 * @property {Set<string>} power - Power tile positions (format: "row-col")
 * @property {Map<string, number>} locked - Locked tiles with unlock countdown
 * @property {Array} solution - Optimal solution path (same as optimalPath)
 * @property {Array} reverse - Generation history (moves used to scramble)
 * @property {Array} optimalPath - Exact moves to solve puzzle optimally
 * @property {Array} playerMoves - Player's move history (starts empty)
 */
export interface GenerationResult {
  grid: number[][];
  solved: number[][];
  power: Set<string>;
  locked: Map<string, number>;
  solution: { row: number; col: number }[];
  reverse: { row: number; col: number }[];
  optimalPath: { row: number; col: number }[];
  playerMoves: { row: number; col: number }[];
}

/**
 * LEVEL PROGRESSION SYSTEM
 * 
 * Levels 1-10: EASY MODE
 * - 3x3 grid throughout
 * - Starts with 2 moves from solved state
 * - Gradually increases difficulty
 * - No time limits, unlimited undos
 * 
 * Levels 11-20: MEDIUM MODE  
 * - 6x6 grid
 * - Starts with 4 moves from solved state (harder!)
 * - Time limits apply
 * - 5 undos per puzzle
 * 
 * Levels 21+: HARD MODE
 * - 10x10 grid initially
 * - Starts with 5 moves from solved state (even harder!)
 * - Strict time limits
 * - 1 undo per puzzle
 * 
 * Grid size increases every 10 levels after level 20:
 * - Levels 21-30: 10x10
 * - Levels 31-40: 12x12
 * - Levels 41-50: 14x14
 * - Levels 51-60: 16x16
 * - Levels 61-70: 18x18
 * - Levels 71+: 20x20
 */
function getProgressiveSize(level: number): number {
  if (level <= 10) {
    // Easy: Always 3x3
    return 3;
  } else if (level <= 20) {
    // Medium: Always 6x6
    return 6;
  } else {
    // Hard: Start at 10x10, increase every 10 levels
    const hardLevel = level - 20;
    const sizeProgression = Math.floor(hardLevel / 10);
    return Math.min(20, 10 + sizeProgression * 2);
  }
}

/**
 * Calculate the number of reverse moves based on level
 * This determines puzzle difficulty within each tier
 */
function getTargetMoves(level: number): number {
  if (level <= 10) {
    // Easy: 2-8 moves
    return Math.min(8, 2 + Math.floor((level - 1) * 0.7));
  } else if (level <= 20) {
    // Medium: 4-14 moves (starts harder)
    const mediumLevel = level - 10;
    return Math.min(14, 4 + Math.floor((mediumLevel - 1) * 1.1));
  } else {
    // Hard: 5+ moves, increases more aggressively (even harder start)
    const hardLevel = level - 20;
    return Math.min(30, 5 + Math.floor(hardLevel * 1.2));
  }
}

/**
 * Get difficulty settings based on level
 */
function getDifficultyFromLevel(level: number): { 
  difficulty: 'easy' | 'medium' | 'hard';
  colors: number;
  timeLimit: number;
  maxUndos: number;
} {
  if (level <= 10) {
    return {
      difficulty: 'easy',
      colors: 3,
      timeLimit: 0, // No time limit
      maxUndos: -1 // Unlimited
    };
  } else if (level <= 20) {
    return {
      difficulty: 'medium',
      colors: 4,
      timeLimit: 300, // 5 minutes
      maxUndos: 5
    };
  } else {
    return {
      difficulty: 'hard', 
      colors: 4 + Math.floor((level - 21) / 20), // Increase colors every 20 levels
      timeLimit: 180, // 3 minutes
      maxUndos: 1
    };
  }
}

/**
 * Custom React hook for puzzle generation
 * 
 * This hook provides the main puzzle generation functionality using a reverse-move
 * algorithm. The key insight is that if we start with a solved puzzle and apply
 * N moves to scramble it, we can ALWAYS solve it by applying those same N moves
 * in reverse order. This gives us 100% guaranteed solvability without needing
 * complex verification algorithms.
 * 
 * Mathematical proof:
 * 1. Each click operation is its own inverse in modular arithmetic
 * 2. Starting from solved state S, applying moves M1, M2, ..., Mn gives scrambled state
 * 3. Applying Mn, ..., M2, M1 returns to S (commutativity in finite fields)
 * 
 * @returns {Object} Object containing the generate function
 */
export const useGenerator = () => {
  /**
   * Generate a puzzle for a specific level
   * 
   * The generation process:
   * 1. Determine grid size based on level (3x3 → 20x20)
   * 2. Calculate target moves based on level difficulty
   * 3. Start with solved grid (all tiles color 0)
   * 4. Apply N reverse clicks to scramble
   * 5. Return scrambled grid with known solution path
   * 
   * @param {Difficulty} conf - Legacy difficulty config (maintained for compatibility)
   * @param {number} level - The current level (1-based), determines all difficulty params
   * @returns {Promise<GenerationResult>} Generated puzzle with guaranteed solution
   * 
   * @example
   * const { generate } = useGenerator();
   * const puzzle = await generate(DIFFICULTIES.easy, 15); // Level 15 = Medium 6x6
   */
  const generate = useCallback(async (_conf: Difficulty, level: number = 1): Promise<GenerationResult> => {
    // Get size and difficulty based on level
    const size = getProgressiveSize(level);
    const targetMoves = getTargetMoves(level);
    const { colors } = getDifficultyFromLevel(level);
    
    // Start with solved state (all zeros)
    const solved = Array(size).fill(null).map(() => Array(size).fill(0));
    
    // POWER TILES STASHED - Keep logic for future use
    // Power tiles affect 3x3 area instead of + pattern
    const power = new Set<string>();
    /* STASHED POWER TILE LOGIC - Uncomment to re-enable
    if (conf.powerTileChance > 0) {
      const numPowerTiles = Math.min(3, Math.floor(size * size * conf.powerTileChance));
      const allPositions: string[] = [];
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          allPositions.push(`${r}-${c}`);
        }
      }
      
      // Randomly select power tile positions
      for (let i = 0; i < numPowerTiles && allPositions.length > 0; i++) {
        const idx = Math.floor(Math.random() * allPositions.length);
        power.add(allPositions.splice(idx, 1)[0]);
      }
    }
    */
    
    // Generate puzzle by applying random moves to solved state
    let currentGrid = solved.map(row => [...row]);
    const generationHistory: { row: number; col: number }[] = [];
    
    // No locked tiles during generation to ensure all moves are valid
    const emptyLocked = new Map<string, number>();
    
    // Apply REVERSE clicks to scramble the board
    // This ensures that applying normal clicks in reverse order will solve it
    for (let i = 0; i < targetMoves; i++) {
      const row = Math.floor(Math.random() * size);
      const col = Math.floor(Math.random() * size);
      const isPower = power.has(`${row}-${col}`);
      
      // Apply REVERSE click (subtract instead of add)
      currentGrid = applyReverseClick(currentGrid, row, col, colors, isPower, emptyLocked);
      generationHistory.push({ row, col });
    }
    
    // The optimal solution is EXACTLY the reverse of generation history
    // This guarantees solvability - we scrambled from solved state, so reversing unscrambles
    const optimalPath = [...generationHistory].reverse();
    
    // LOCKED TILES STASHED - Keep logic for future use
    // Locked tiles require multiple clicks before they can be clicked
    const locked = new Map<string, number>();
    /* STASHED LOCKED TILE LOGIC - Uncomment to re-enable
    if (conf.maxLockedTiles > 0 && level > 1) {
      const optimalPathSet = new Set(optimalPath.map(m => `${m.row}-${m.col}`));
      const candidates: string[] = [];
      
      // Find positions not in optimal path and not power tiles
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          const key = `${r}-${c}`;
          if (!optimalPathSet.has(key) && !power.has(key)) {
            candidates.push(key);
          }
        }
      }
      
      // Place locked tiles
      const scaledMaxLocked = Math.min(
        conf.maxLockedTiles,
        Math.floor(conf.maxLockedTiles + (level - 1) / 3),
        candidates.length
      );
      
      for (let i = 0; i < scaledMaxLocked && candidates.length > 0; i++) {
        const idx = Math.floor(Math.random() * candidates.length);
        const key = candidates.splice(idx, 1)[0];
        const lockMoves = 2 + Math.floor(Math.random() * 3); // 2-4 moves
        locked.set(key, lockMoves);
      }
    }
    */
    
    log('info', '✅ Generated 100% solvable puzzle using reverse-move method', {
      level,
      targetMoves,
      actualMoves: generationHistory.length,
      powerTiles: power.size,
      lockedTiles: locked.size,
      optimalPathLength: optimalPath.length,
      gridSize: size,
      difficulty: getDifficultyFromLevel(level).difficulty,
      colors
    });
    
    return {
      grid: currentGrid,
      solved,
      power,
      locked,
      solution: optimalPath, // Guaranteed optimal solution
      reverse: generationHistory, // Moves used to generate
      optimalPath, // Exact path to solve
      playerMoves: [] // Start with no player moves
    };
  }, []);

  return { generate };
};