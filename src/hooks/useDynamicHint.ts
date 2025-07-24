import { useState, useEffect, useCallback } from 'react';
import { bfsSolve } from './useSolver';
import { isWinningState } from '../utils/grid';
import { DIFFICULTIES } from '../constants/gameConfig';

interface HintResult {
  nextMove: { row: number; col: number } | null;
  isCalculating: boolean;
}

export const useDynamicHint = (
  grid: number[][],
  power: Set<string>,
  locked: Map<string, number>,
  difficulty: string,
  enabled: boolean
): HintResult => {
  const [nextMove, setNextMove] = useState<{ row: number; col: number } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateBestMove = useCallback(async () => {
    if (!grid.length || !enabled || isWinningState(grid)) {
      setNextMove(null);
      return;
    }

    setIsCalculating(true);
    try {
      // Get current difficulty colors
      const colors = DIFFICULTIES[difficulty as keyof typeof DIFFICULTIES].colors;
      
      // Find shortest solution from current state
      const { solution } = await bfsSolve(grid, power, locked, colors);
      
      if (solution.length > 0) {
        // The first move in the solution is the best next move
        setNextMove(solution[0]);
      } else {
        setNextMove(null);
      }
    } catch (error) {
      console.error('Failed to calculate hint:', error);
      setNextMove(null);
    } finally {
      setIsCalculating(false);
    }
  }, [grid, power, locked, difficulty, enabled]);

  // Recalculate whenever game state changes
  useEffect(() => {
    if (enabled) {
      calculateBestMove();
    } else {
      setNextMove(null);
    }
  }, [calculateBestMove, enabled]);

  return { nextMove, isCalculating };
};