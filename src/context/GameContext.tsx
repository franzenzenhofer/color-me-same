/**
 * @fileoverview Game State Management with React Context
 * 
 * This module implements centralized state management for Color Me Same using
 * React Context API with useReducer. It follows the Flux architecture pattern
 * with immutable state updates and type-safe actions.
 * 
 * State management principles:
 * - Single source of truth: All game state in one place
 * - Immutable updates: State is never mutated directly
 * - Type safety: TypeScript ensures action payload correctness
 * - Performance: Context updates only trigger necessary re-renders
 * 
 * The state tracks everything from the current puzzle grid to player progression,
 * achievements, and UI state. Actions are dispatched to update state predictably.
 * 
 * @module GameContext
 */

import React, { useReducer, createContext, Dispatch, useContext, ReactNode } from 'react';
import { GenerationResult } from '../hooks/useGenerator';
import { computeScore } from '../utils/score';
import { isWinningState } from '../utils/grid';
import { applyClick } from '../utils/gridV2';
import { log } from '../utils/logger';

/**
 * Complete game state interface
 * 
 * The GameState contains all data needed to represent a game session,
 * from the puzzle itself to player progress and UI state.
 * 
 * @interface GameState
 */
interface GameState {
  // === Puzzle Configuration ===
  /** Current level number (1-based, determines all difficulty parameters) */
  level: number;
  /** Current puzzle grid state (2D array of color indices) */
  grid: number[][];
  /** Original scrambled state for reset functionality */
  initialGrid: number[][];
  /** Target solved state (all tiles same color, usually 0) */
  solved: number[][];
  /** Set of power tile positions ("row-col" format) */
  power: Set<string>;
  /** Map of locked tiles to unlock countdown */
  locked: Map<string, number>;
  /** Original locked state for reset */
  initialLocked: Map<string, number>;
  
  // === Game Progress ===
  /** Number of moves made by player */
  moves: number;
  /** Elapsed time in seconds */
  time: number;
  /** Whether game has started */
  started: boolean;
  /** Whether puzzle is solved */
  won: boolean;
  /** Whether game is paused */
  paused: boolean;
  
  // === Solution Tracking ===
  /** Optimal solution path (for backwards compatibility) */
  solution: { row: number; col: number }[];
  /** Moves used to generate puzzle */
  reverse: { row: number; col: number }[];
  /** Exact optimal path to solve (reverse of generation) */
  optimalPath: { row: number; col: number }[];
  /** Player's actual move history */
  playerMoves: { row: number; col: number }[];
  
  // === Player Progression ===
  /** Current score for this puzzle */
  score: number;
  /** Total experience points */
  xp: number;
  /** Current win streak */
  streak: number;
  /** Current belt color (white → black) */
  belt: string;
  /** Unlocked achievement IDs */
  achievements: string[];
  
  // === UI State ===
  /** Whether to show tutorial modal */
  showTutorial: boolean;
  /** Whether to show victory modal */
  showVictory: boolean;
  /** Whether hints are currently displayed */
  showHints: boolean;
  /** Whether hints are manually enabled */
  hintsEnabled: boolean;
  
  // === Undo System ===
  /** History of previous states for undo */
  undoHistory: { 
    grid: number[][]; 
    locked: Map<string, number>; 
    moves: number; 
    playerMoves: { row: number; col: number }[] 
  }[];
  /** Number of undos used in current puzzle */
  undoCount: number;
  /** Maximum undos allowed (-1 = unlimited) */
  maxUndos: number;
}

type Action =
  | { type: 'NEW_GAME'; payload: { level?: number } & GenerationResult }
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
 * Main state reducer implementing the Flux pattern
 * 
 * This reducer handles all state transitions in the game. Each action
 * produces a new immutable state based on the current state and action payload.
 * The reducer is pure - same state + action always produces same new state.
 * 
 * Design principles:
 * - Immutability: Always return new state objects
 * - Predictability: Each action has clear, documented behavior
 * - Atomicity: Actions complete fully or not at all
 * - Traceability: All state changes go through this function
 * 
 * @param {GameState} state - Current game state
 * @param {Action} action - Action to perform
 * @returns {GameState} New game state
 */
function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'NEW_GAME': {
      const { 
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
      
      // Show hints automatically on tutorial levels (1-3)
      const showHints = level >= 1 && level <= 3;
      
      // Get max undos based on level progression
      const maxUndos = level <= 10 ? -1 : level <= 30 ? 10 : Math.max(1, 15 - Math.floor(level / 10));
      
      return {
        ...state,
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
        hintsEnabled: showHints, // Enable hints on tutorial levels
        undoHistory: [], // Reset undo history
        undoCount: 0,
        maxUndos,
      };
    }

    case 'CLICK': {
      const { row, col } = action;
      if (state.won || state.paused) return state;
      if (state.locked.has(`${row}-${col}`) && state.locked.get(`${row}-${col}`)! > 0) return state;

      const isPower = state.power.has(`${row}-${col}`);
      // Get colors based on level (will be replaced by level generation)
      const colors = state.level <= 20 ? 3 : state.level <= 50 ? 4 : 5;
      
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
            0, // Time limit will be determined by level
            1 + (state.level / 10) // Level-based bonus
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
      // Time limit will be determined by level progression
      const timeLimit = 0; // No time limits for now
      
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
      let newBelt = state.belt;
      
      // Enhanced belt progression based on level milestones
      // Belt progression aligns with difficulty transitions
      if (state.level >= 50 && newXP >= 15000 && state.belt !== 'black') {
        newBelt = 'black'; // Master level
      } else if (state.level >= 30 && newXP >= 8000 && state.belt !== 'purple') {
        newBelt = 'purple';
      } else if (state.level >= 21 && newXP >= 5000 && state.belt !== 'blue') {
        newBelt = 'blue';
      } else if (state.level >= 11 && newXP >= 3000 && state.belt !== 'green') {
        newBelt = 'green';
      } else if (state.level >= 6 && newXP >= 1500 && state.belt !== 'orange') {
        newBelt = 'orange';
      } else if (state.level >= 3 && newXP >= 500 && state.belt !== 'yellow') {
        newBelt = 'yellow';
      }
      
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