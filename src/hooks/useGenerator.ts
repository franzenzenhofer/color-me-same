import { useCallback } from 'react';
import { clone, effectMatrix, applyEffect } from '../utils/grid';
import { Difficulty } from '../constants/gameConfig';
import { bfsSolve } from './useSolver';
import { log } from '../utils/logger';

export interface GenerationResult {
  grid: number[][];
  solved: number[][];
  power: Set<string>;
  locked: Map<string, number>;
  solution: { row: number; col: number }[];
  reverse: { row: number; col: number }[];
}

export const useGenerator = () => {
  const generate = useCallback(async (conf: Difficulty, level: number = 1): Promise<GenerationResult> => {
    // Progressive difficulty scaling
    // For moves: 3 (easy), 5, 7, then gradually up to 14
    let targetMoves = conf.reverseSteps; // Base: 3, 5, or 7
    
    if (level <= 1) {
      // Keep base moves for level 1
    } else if (conf.reverseSteps === 3) {
      // Easy mode progression: 3 -> 4 -> 5 -> 6...
      targetMoves = Math.min(8, 3 + Math.floor((level - 1) / 2));
    } else if (conf.reverseSteps === 5) {
      // Medium mode progression: 5 -> 6 -> 7 -> 8...
      targetMoves = Math.min(10, 5 + Math.floor((level - 1) / 2));
    } else if (conf.reverseSteps === 7) {
      // Hard mode progression: 7 -> 8 -> 9 -> ... -> 14
      targetMoves = Math.min(14, 7 + Math.floor((level - 1) / 2));
    }
    
    const scaledReverseSteps = targetMoves;
    
    // Scale locked tiles based on level (but not for easy mode)
    let scaledMaxLocked = conf.maxLockedTiles;
    if (conf.maxLockedTiles > 0 && level > 1) {
      scaledMaxLocked = Math.min(
        Math.floor(conf.size * conf.size * 0.3), // Max 30% of tiles can be locked
        Math.floor(conf.maxLockedTiles + Math.floor((level - 1) / 3))
      );
    }
    
    // Scale power tiles (less at higher levels)
    const scaledPowerChance = conf.powerTileChance === 0 ? 0 :
      Math.max(0.05, conf.powerTileChance * Math.max(0.5, 1 - (level - 1) * 0.1));
    
    // Use more colors on higher levels
    const maxColors = Math.min(conf.colors, 2 + Math.floor((level - 1) / 3)); // Add a color every 3 levels
    
    const { size } = conf;

    // Start with solved grid
    const solved = Array(size).fill(null).map(() => Array(size).fill(0));
    const power = new Set<string>();
    const locked = new Map<string, number>();

    // Add power tiles
    if (scaledPowerChance > 0) {
      const numPowerTiles = Math.min(3, Math.floor(size * size * scaledPowerChance));
      while (power.size < numPowerTiles) {
        const r = Math.floor(Math.random() * size);
        const c = Math.floor(Math.random() * size);
        power.add(`${r}-${c}`);
      }
    }

    // Add locked tiles
    while (locked.size < scaledMaxLocked) {
      const r = Math.floor(Math.random() * size);
      const c = Math.floor(Math.random() * size);
      const key = `${r}-${c}`;
      if (!power.has(key)) {
        // More moves to unlock on higher levels
        const minMoves = 2 + Math.floor((level - 1) / 5); // +1 move every 5 levels
        const maxMoves = Math.min(6, minMoves + 2);
        locked.set(key, Math.floor(Math.random() * (maxMoves - minMoves + 1)) + minMoves);
      }
    }

    // Apply reverse moves
    let currentGrid = clone(solved);
    const reverse: { row: number; col: number }[] = [];

    for (let i = 0; i < scaledReverseSteps; i++) {
      const validMoves = [];
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (!locked.has(`${r}-${c}`)) {
            validMoves.push({ row: r, col: c });
          }
        }
      }

      const move = validMoves[Math.floor(Math.random() * validMoves.length)];
      const effect = effectMatrix(move.row, move.col, size, power.has(`${move.row}-${move.col}`));
      currentGrid = applyEffect(currentGrid, effect, new Map(), maxColors);
      reverse.push(move);
    }

    // Solve to verify
    const { solution, statesExplored } = await bfsSolve(currentGrid, power, locked, maxColors);
    
    // CRITICAL: Ensure puzzle is solvable
    if (solution.length === 0) {
      log('error', 'Generated unsolvable puzzle!', { 
        level,
        scaledReverseSteps,
        scaledMaxLocked,
        maxColors,
        statesExplored
      });
      
      // Try again to ensure solvability
      return generate(conf, level); // Recursive retry
    }
    
    log('debug', 'Generated solvable puzzle', { 
      level,
      scaledReverseSteps,
      scaledMaxLocked,
      maxColors,
      reverse: reverse.length,
      solution: solution.length,
      statesExplored
    });

    return {
      grid: currentGrid,
      solved,
      power,
      locked,
      solution,
      reverse
    };
  }, []);

  return { generate };
};