import React, { useReducer, createContext, Dispatch, useContext, ReactNode } from 'react';
import { DIFFICULTIES, DifficultyKey } from '../constants/gameConfig';
import { GenerationResult } from '../hooks/useGenerator';
import { computeScore, getDifficultyBonus } from '../utils/score';
import { isWinningState, effectMatrix, applyEffect } from '../utils/grid';

interface GameState {
  // Game state
  difficulty: DifficultyKey;
  level: number; // Current level within difficulty
  grid: number[][];
  solved: number[][];
  power: Set<string>;
  locked: Map<string, number>;
  
  // Game progress
  moves: number;
  time: number;
  started: boolean;
  won: boolean;
  paused: boolean;
  
  // Solution data
  solution: { row: number; col: number }[];
  reverse: { row: number; col: number }[];
  
  // Player data
  score: number;
  xp: number;
  streak: number;
  belt: string;
  achievements: string[];
  
  // UI state
  showTutorial: boolean;
  showVictory: boolean;
  showHints: boolean; // Show hints (level 1 auto or manual toggle)
  hintsEnabled: boolean; // Manual hint toggle from PowerUps
}

type Action =
  | { type: 'NEW_GAME'; payload: { difficulty: DifficultyKey; level?: number } & GenerationResult }
  | { type: 'CLICK'; row: number; col: number }
  | { type: 'LOCK_DECR' }
  | { type: 'TICK' }
  | { type: 'WIN' }
  | { type: 'PAUSE'; paused: boolean }
  | { type: 'SHOW_MODAL'; modal: 'tutorial' | 'victory' | null }
  | { type: 'ADD_XP'; amount: number }
  | { type: 'UNLOCK_ACHIEVEMENT'; id: string }
  | { type: 'NEXT_LEVEL' }
  | { type: 'TOGGLE_HINTS'; enabled?: boolean };

const initial: GameState = {
  difficulty: 'easy',
  level: 1,
  grid: [],
  solved: [],
  power: new Set(),
  locked: new Map(),
  moves: 0,
  time: 0,
  started: false,
  won: false,
  paused: false,
  solution: [],
  reverse: [],
  score: 0,
  xp: 0,
  streak: 0,
  belt: 'white',
  achievements: [],
  showTutorial: false,
  showVictory: false,
  showHints: false,
  hintsEnabled: false,
};

interface GameContextType {
  state: GameState;
  dispatch: Dispatch<Action>;
}

const GameContext = createContext<GameContextType>({
  state: initial,
  dispatch: () => {},
});

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'NEW_GAME': {
      const { difficulty, level = 1, grid, solved, power, locked, solution, reverse } = action.payload;
      // Show hints automatically on level 1 of any difficulty
      const showHints = level === 1;
      return {
        ...state,
        difficulty,
        level,
        grid,
        solved,
        power,
        locked,
        moves: 0,
        time: 0,
        started: true,
        won: false,
        paused: false,
        solution,
        reverse,
        score: 0,
        showTutorial: false, // Don't auto-open modal
        showVictory: false,
        showHints,
        hintsEnabled: showHints, // Enable hints on level 1
      };
    }

    case 'CLICK': {
      const { row, col } = action;
      if (state.won || state.paused) return state;
      if (state.locked.has(`${row}-${col}`)) return state;

      const isPower = state.power.has(`${row}-${col}`);
      const effect = effectMatrix(row, col, state.grid.length, isPower);
      const nextGrid = applyEffect(state.grid, effect, state.locked, DIFFICULTIES[state.difficulty].colors);

      const won = isWinningState(nextGrid);
      const newMoves = state.moves + 1;
      const score = won
        ? computeScore(
            newMoves,
            state.solution.length,
            state.time,
            DIFFICULTIES[state.difficulty].timeLimit,
            getDifficultyBonus(state.difficulty)
          )
        : state.score;

      const newState = {
        ...state,
        grid: nextGrid,
        moves: newMoves,
        won,
        score,
        showVictory: false, // Don't show victory modal immediately
      };

      // Log state for debugging
      if (won) {
        console.log('🎉 PUZZLE SOLVED!', { moves: newMoves, score, grid: nextGrid });
      }

      return newState;
    }

    case 'LOCK_DECR': {
      const nextLocked = new Map<string, number>();
      state.locked.forEach((v, k) => {
        if (v > 1) nextLocked.set(k, v - 1);
      });
      return { ...state, locked: nextLocked };
    }

    case 'TICK': {
      if (state.paused || state.won) return state;
      const newTime = state.time + 1;
      const timeLimit = DIFFICULTIES[state.difficulty].timeLimit;
      
      // Check time limit
      if (timeLimit > 0 && newTime >= timeLimit) {
        return { ...state, time: newTime, won: false, paused: true, showVictory: true };
      }
      
      return { ...state, time: newTime };
    }

    case 'WIN': {
      return { ...state, won: true, showVictory: true };
    }

    case 'PAUSE': {
      return { ...state, paused: action.paused };
    }

    case 'SHOW_MODAL': {
      return {
        ...state,
        showTutorial: action.modal === 'tutorial',
        showVictory: action.modal === 'victory',
      };
    }

    case 'ADD_XP': {
      const newXP = state.xp + action.amount;
      // Update belt based on XP thresholds
      let newBelt = state.belt;
      if (newXP >= 8000) newBelt = 'purple';
      else if (newXP >= 5000) newBelt = 'blue';
      else if (newXP >= 3000) newBelt = 'green';
      else if (newXP >= 1500) newBelt = 'orange';
      else if (newXP >= 500) newBelt = 'yellow';
      
      return { ...state, xp: newXP, belt: newBelt };
    }

    case 'UNLOCK_ACHIEVEMENT': {
      if (state.achievements.includes(action.id)) return state;
      return {
        ...state,
        achievements: [...state.achievements, action.id],
      };
    }

    case 'NEXT_LEVEL': {
      // Progress to next level within current difficulty
      return {
        ...state,
        level: state.level + 1,
        showVictory: false,
        // Clear hints after level 1
        showHints: false,
        hintsEnabled: false,
      };
    }

    case 'TOGGLE_HINTS': {
      const enabled = action.enabled !== undefined ? action.enabled : !state.hintsEnabled;
      return {
        ...state,
        hintsEnabled: enabled,
        showHints: enabled || state.level === 1, // Always show on level 1
      };
    }

    default:
      return state;
  }
}

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initial);
  
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};

export default GameContext;