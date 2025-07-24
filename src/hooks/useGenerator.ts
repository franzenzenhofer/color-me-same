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
  const generate = useCallback(async (conf: Difficulty): Promise<GenerationResult> => {
    const { size, reverseSteps, maxLockedTiles, powerTileChance, colors } = conf;

    // Start with solved grid
    const solved = Array(size).fill(null).map(() => Array(size).fill(0));
    const power = new Set<string>();
    const locked = new Map<string, number>();

    // Add power tiles
    if (powerTileChance > 0) {
      const numPowerTiles = Math.min(3, Math.floor(size * size * powerTileChance));
      while (power.size < numPowerTiles) {
        const r = Math.floor(Math.random() * size);
        const c = Math.floor(Math.random() * size);
        power.add(`${r}-${c}`);
      }
    }

    // Add locked tiles
    while (locked.size < maxLockedTiles) {
      const r = Math.floor(Math.random() * size);
      const c = Math.floor(Math.random() * size);
      const key = `${r}-${c}`;
      if (!power.has(key)) {
        locked.set(key, Math.floor(Math.random() * 3) + 2); // 2-4 moves to unlock
      }
    }

    // Apply reverse moves
    let currentGrid = clone(solved);
    const reverse: { row: number; col: number }[] = [];

    for (let i = 0; i < reverseSteps; i++) {
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
      currentGrid = applyEffect(currentGrid, effect, new Map(), colors);
      reverse.push(move);
    }

    // Solve to verify
    const { solution } = await bfsSolve(currentGrid, power, locked, colors);
    
    log('debug', 'Generated puzzle', { reverse, solution });

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