import React, { useReducer, createContext, Dispatch, useContext, ReactNode } from 'react';
import { COLOR_PALETTE, DIFFICULTIES, DifficultyKey } from '../constants/gameConfig';
import { GenerationResult } from '../hooks/useGenerator';
import { computeScore, getDifficultyBonus } from '../utils/score';
import { isWinningState, effectMatrix, applyEffect } from '../utils/grid';

interface GameState {
  // Game state
  difficulty: DifficultyKey;
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
  showInfo: boolean;
}

type Action =
  | { type: 'NEW_GAME'; payload: { difficulty: DifficultyKey } & GenerationResult }
  | { type: 'CLICK'; row: number; col: number }
  | { type: 'LOCK_DECR' }
  | { type: 'TICK' }
  | { type: 'WIN' }
  | { type: 'PAUSE'; paused: boolean }
  | { type: 'SHOW_MODAL'; modal: 'tutorial' | 'victory' | 'info' | null }
  | { type: 'ADD_XP'; amount: number }
  | { type: 'UNLOCK_ACHIEVEMENT'; id: string };

const initial: GameState = {
  difficulty: 'easy',
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
  showInfo: false,
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
      const { difficulty, grid, solved, power, locked, solution, reverse } = action.payload;
      return {
        ...state,
        difficulty,
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
        showTutorial: DIFFICULTIES[difficulty].tutorial,
        showVictory: false,
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
      const score = won
        ? computeScore(
            state.moves + 1,
            state.solution.length,
            state.time,
            DIFFICULTIES[state.difficulty].timeLimit,
            getDifficultyBonus(state.difficulty)
          )
        : state.score;

      return {
        ...state,
        grid: nextGrid,
        moves: state.moves + 1,
        won,
        score,
        showVictory: won,
      };
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
        showInfo: action.modal === 'info',
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