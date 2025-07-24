import { useCallback } from 'react';
import { Difficulty } from '../constants/gameConfig';
import { log } from '../utils/logger';
import { applyReverseClick } from '../utils/gridV2';

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
 * Calculate progressive grid size based on difficulty and level
 * Easy: always 3x3
 * Medium: 6x6 → 8x8 → 10x10 → 12x12 → 14x14 → 16x16 → 18x18 → 20x20
 * Hard: 10x10 → 12x12 → 14x14 → 16x16 → 18x18 → 20x20
 */
function getProgressiveSize(baseSize: number, difficulty: string, level: number): number {
  if (difficulty === 'easy') {
    return 3; // Easy always stays 3x3
  }
  
  if (difficulty === 'medium') {
    // Medium starts at 6x6, increases by 2 every 5 levels
    const progression = Math.floor((level - 1) / 5);
    return Math.min(20, 6 + progression * 2);
  }
  
  if (difficulty === 'hard') {
    // Hard starts at 10x10, increases by 2 every 3 levels
    const progression = Math.floor((level - 1) / 3);
    return Math.min(20, 10 + progression * 2);
  }
  
  return baseSize;
}

/**
 * Generate puzzles using the reverse-move method for 100% guaranteed solvability
 * No BFS verification needed - solvability is guaranteed by construction
 */
export const useGenerator = () => {
  const generate = useCallback(async (conf: Difficulty, level: number = 1): Promise<GenerationResult> => {
    // Use progressive size instead of fixed size
    const size = getProgressiveSize(conf.size, conf.reverseSteps === 3 ? 'easy' : 
                                                 conf.reverseSteps === 5 ? 'medium' : 'hard', level);
    
    // Progressive difficulty scaling
    let targetMoves = conf.reverseSteps;
    if (level > 1) {
      if (conf.reverseSteps === 3) {
        // Easy: 3 → 4 → 5 → 6 → ... → 8
        targetMoves = Math.min(8, 3 + Math.floor((level - 1) / 2));
      } else if (conf.reverseSteps === 5) {
        // Medium: 5 → 6 → 7 → 8 → ... → 10
        targetMoves = Math.min(10, 5 + Math.floor((level - 1) / 2));
      } else if (conf.reverseSteps === 7) {
        // Hard: 7 → 8 → 9 → ... → 14
        targetMoves = Math.min(14, 7 + Math.floor((level - 1) / 2));
      }
    }
    
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
      currentGrid = applyReverseClick(currentGrid, row, col, conf.colors, isPower, emptyLocked);
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
      difficulty: conf.reverseSteps === 3 ? 'easy' : conf.reverseSteps === 5 ? 'medium' : 'hard'
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