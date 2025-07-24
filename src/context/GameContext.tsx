import React, { useReducer, createContext, Dispatch, useContext, ReactNode } from 'react';
import { DIFFICULTIES, DifficultyKey } from '../constants/gameConfig';
import { GenerationResult } from '../hooks/useGenerator';
import { computeScore, getDifficultyBonus } from '../utils/score';
import { isWinningState } from '../utils/grid';
import { applyClick } from '../utils/gridV2';
import { log } from '../utils/logger';

interface GameState {
  // Game state
  difficulty: DifficultyKey;
  level: number; // Current level within difficulty
  grid: number[][];
  initialGrid: number[][]; // Store initial scrambled state for reset
  solved: number[][];
  power: Set<string>;
  locked: Map<string, number>;
  initialLocked: Map<string, number>; // Store initial locked state for reset
  
  // Game progress
  moves: number;
  time: number;
  started: boolean;
  won: boolean;
  paused: boolean;
  
  // Solution data
  solution: { row: number; col: number }[];
  reverse: { row: number; col: number }[];
  optimalPath: { row: number; col: number }[]; // NEW: Exact reverse of generation
  playerMoves: { row: number; col: number }[]; // NEW: Track player's actual moves
  
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
  
  // Undo functionality
  undoHistory: { grid: number[][]; locked: Map<string, number>; moves: number; playerMoves: { row: number; col: number }[] }[];
  undoCount: number; // Number of undos used
  maxUndos: number; // Max undos allowed (unlimited = -1)
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
  | { type: 'TOGGLE_HINTS'; enabled?: boolean }
  | { type: 'UNDO' }
  | { type: 'RESET' };

const initial: GameState = {
  difficulty: 'easy',
  level: 1,
  grid: [],
  initialGrid: [],
  solved: [],
  power: new Set(),
  locked: new Map(),
  initialLocked: new Map(),
  moves: 0,
  time: 0,
  started: false,
  won: false,
  paused: false,
  solution: [],
  reverse: [],
  optimalPath: [],
  playerMoves: [],
  score: 0,
  xp: 0,
  streak: 0,
  belt: 'white',
  achievements: [],
  showTutorial: false,
  showVictory: false,
  showHints: false,
  hintsEnabled: false,
  undoHistory: [],
  undoCount: 0,
  maxUndos: -1, // Unlimited for easy
};

interface GameContextType {
  state: GameState;
  dispatch: Dispatch<Action>;
}

const GameContext = createContext<GameContextType>({
  state: initial,
  dispatch: () => {},
});

/**
 * Get max undos based on difficulty
 * Easy: unlimited (-1)
 * Medium: 5
 * Hard: 1
 */
function getMaxUndos(difficulty: DifficultyKey): number {
  switch (difficulty) {
    case 'easy':
      return -1; // Unlimited
    case 'medium':
      return 5;
    case 'hard':
      return 1;
    default:
      return -1;
  }
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'NEW_GAME': {
      const { 
        difficulty, 
        level = 1, 
        grid, 
        solved, 
        power, 
        locked, 
        solution, 
        reverse,
        optimalPath = solution, // Use solution as optimal path if not provided
        playerMoves = []
      } = action.payload;
      // Show hints automatically on level 1 of any difficulty
      const showHints = level === 1;
      return {
        ...state,
        difficulty,
        level,
        grid,
        initialGrid: grid.map(row => [...row]), // Store initial state
        solved,
        power,
        locked,
        initialLocked: new Map(locked), // Store initial locked state
        moves: 0,
        time: 0,
        started: true,
        won: false,
        paused: false,
        solution,
        reverse,
        optimalPath,
        playerMoves,
        score: 0,
        showTutorial: false, // Don't auto-open modal
        showVictory: false,
        showHints,
        hintsEnabled: showHints, // Enable hints on level 1
        undoHistory: [], // Reset undo history
        undoCount: 0,
        maxUndos: getMaxUndos(difficulty),
      };
    }

    case 'CLICK': {
      const { row, col } = action;
      if (state.won || state.paused) return state;
      if (state.locked.has(`${row}-${col}`) && state.locked.get(`${row}-${col}`)! > 0) return state;

      const isPower = state.power.has(`${row}-${col}`);
      const colors = DIFFICULTIES[state.difficulty].colors;
      
      // Save current state to undo history before making the move
      const newUndoHistory = [...state.undoHistory, {
        grid: state.grid.map(row => [...row]),
        locked: new Map(state.locked),
        moves: state.moves,
        playerMoves: [...state.playerMoves]
      }];
      
      // Apply click using the new pure function
      const nextGrid = applyClick(state.grid, row, col, colors, isPower, state.locked);
      
      // Track player move
      const newPlayerMoves = [...state.playerMoves, { row, col }];
      
      const won = isWinningState(nextGrid);
      const newMoves = state.moves + 1;
      
      // Calculate score based on optimal path
      const score = won
        ? computeScore(
            newMoves,
            state.optimalPath.length,
            state.time,
            DIFFICULTIES[state.difficulty].timeLimit,
            getDifficultyBonus(state.difficulty)
          )
        : state.score;

      // Log move for debugging
      const isOnOptimalPath = newPlayerMoves.length <= state.optimalPath.length &&
        newPlayerMoves.every((m, i) => {
          const opt = state.optimalPath[i];
          return opt && m.row === opt.row && m.col === opt.col;
        });
        
      log('debug', 'Player clicked', {
        row,
        col,
        isPower,
        moveNumber: newMoves,
        optimalPathLength: state.optimalPath.length,
        onOptimalPath: isOnOptimalPath
      });

      if (won) {
        log('info', '🎉 PUZZLE SOLVED!', { 
          moves: newMoves, 
          optimalMoves: state.optimalPath.length,
          score,
          efficiency: Math.round((state.optimalPath.length / newMoves) * 100) + '%'
        });
      }

      return {
        ...state,
        grid: nextGrid,
        moves: newMoves,
        playerMoves: newPlayerMoves,
        won,
        score,
        showVictory: false, // Don't show victory modal immediately
        undoHistory: newUndoHistory,
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

    case 'UNDO': {
      // Check if undo is available
      if (state.undoHistory.length === 0) return state;
      if (state.maxUndos !== -1 && state.undoCount >= state.maxUndos) return state;
      
      // Get the last saved state
      const lastState = state.undoHistory[state.undoHistory.length - 1];
      
      return {
        ...state,
        grid: lastState.grid,
        locked: lastState.locked,
        moves: lastState.moves,
        playerMoves: lastState.playerMoves,
        undoHistory: state.undoHistory.slice(0, -1),
        undoCount: state.undoCount + 1,
      };
    }

    case 'RESET': {
      // Reset to initial puzzle state (after generation)
      return {
        ...state,
        grid: state.initialGrid.map(row => [...row]),
        locked: new Map(state.initialLocked),
        moves: 0,
        playerMoves: [],
        undoHistory: [],
        undoCount: 0,
        won: false,
        score: 0,
        showVictory: false,
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