import { describe, it, expect, vi } from 'vitest';
import { gameReducer, initialState } from '../../src/context/GameContext';
import { DIFFICULTIES } from '../../src/constants/gameConfig';

// Mock the functions from utils
vi.mock('../../src/utils/grid', () => ({
  generateSolvableGrid: vi.fn((size, colors) => {
    // Create a simple grid filled with 0s
    const grid = Array(size).fill(null).map(() => Array(size).fill(0));
    return { grid, moves: 0 };
  }),
  applyMove: vi.fn((grid, row, col, power, colors) => {
    // Simple mock that just increments the clicked cell
    const newGrid = grid.map(r => [...r]);
    newGrid[row][col] = (newGrid[row][col] + 1) % colors;
    return newGrid;
  }),
  checkWin: vi.fn((grid) => {
    // Check if all cells have the same value
    const firstValue = grid[0][0];
    return grid.every(row => row.every(cell => cell === firstValue));
  })
}));

vi.mock('../../src/utils/score', () => ({
  calculateScore: vi.fn((moves, time, difficulty, hintsUsed, powerUsed, optimalMoves) => {
    return 1000 - moves * 10 - hintsUsed * 50 - powerUsed * 30;
  })
}));

describe('GameContext Reducer', () => {
  it('should return initial state', () => {
    const state = gameReducer(undefined as any, { type: 'UNKNOWN' as any });
    expect(state).toEqual(initialState);
  });

  describe('START action', () => {
    it('should start game with selected difficulty', () => {
      const state = gameReducer(initialState, { type: 'START', difficulty: 'medium' });
      
      expect(state.started).toBe(true);
      expect(state.difficulty).toBe('medium');
      expect(state.grid).toHaveLength(DIFFICULTIES.medium.size);
      expect(state.grid[0]).toHaveLength(DIFFICULTIES.medium.size);
      expect(state.moves).toBe(0);
      expect(state.time).toBe(0);
      expect(state.won).toBe(false);
      expect(state.paused).toBe(false);
    });

    it('should generate power tiles for medium difficulty', () => {
      const state = gameReducer(initialState, { type: 'START', difficulty: 'medium' });
      
      expect(state.power.size).toBeGreaterThan(0);
    });

    it('should generate locked tiles for hard difficulty', () => {
      const state = gameReducer(initialState, { type: 'START', difficulty: 'hard' });
      
      expect(state.locked.size).toBeGreaterThan(0);
    });
  });

  describe('CLICK action', () => {
    it('should apply move and increment move count', () => {
      const startedState = gameReducer(initialState, { type: 'START', difficulty: 'easy' });
      const state = gameReducer(startedState, { type: 'CLICK', row: 0, col: 0 });
      
      expect(state.moves).toBe(1);
      expect(state.playerMoves).toContain('0-0');
    });

    it('should not apply move when game is won', () => {
      const wonState = { ...initialState, started: true, won: true, moves: 5 };
      const state = gameReducer(wonState, { type: 'CLICK', row: 0, col: 0 });
      
      expect(state.moves).toBe(5); // Unchanged
    });

    it('should not apply move when game is paused', () => {
      const pausedState = { ...initialState, started: true, paused: true, moves: 5 };
      const state = gameReducer(pausedState, { type: 'CLICK', row: 0, col: 0 });
      
      expect(state.moves).toBe(5); // Unchanged
    });

    it('should handle power tile clicks', () => {
      const stateWithPower = {
        ...initialState,
        started: true,
        grid: [[0, 1], [1, 0]],
        power: new Map([['0-0', true]]),
        powerUsed: 0
      };
      
      const state = gameReducer(stateWithPower, { type: 'CLICK', row: 0, col: 0 });
      
      expect(state.powerUsed).toBe(1);
      expect(state.power.has('0-0')).toBe(false);
    });

    it('should handle locked tile clicks', () => {
      const stateWithLocked = {
        ...initialState,
        started: true,
        grid: [[0, 1], [1, 0]],
        locked: new Map([['0-0', 2]])
      };
      
      const state = gameReducer(stateWithLocked, { type: 'CLICK', row: 0, col: 0 });
      
      expect(state.locked.get('0-0')).toBe(1);
    });

    it('should unlock tile when lock count reaches 0', () => {
      const stateWithLocked = {
        ...initialState,
        started: true,
        grid: [[0, 1], [1, 0]],
        locked: new Map([['0-0', 1]])
      };
      
      const state = gameReducer(stateWithLocked, { type: 'CLICK', row: 0, col: 0 });
      
      expect(state.locked.has('0-0')).toBe(false);
    });
  });

  describe('RESET action', () => {
    it('should reset to initial state', () => {
      const modifiedState = {
        ...initialState,
        started: true,
        moves: 10,
        time: 60
      };
      
      const state = gameReducer(modifiedState, { type: 'RESET' });
      
      expect(state).toEqual(initialState);
    });
  });

  describe('RESTART action', () => {
    it('should restart with same difficulty', () => {
      const gameState = gameReducer(initialState, { type: 'START', difficulty: 'medium' });
      const state = gameReducer(gameState, { type: 'RESTART' });
      
      expect(state.difficulty).toBe('medium');
      expect(state.moves).toBe(0);
      expect(state.time).toBe(0);
      expect(state.grid).toHaveLength(DIFFICULTIES.medium.size);
    });
  });

  describe('TICK action', () => {
    it('should increment time when not paused', () => {
      const runningState = { ...initialState, started: true, time: 10 };
      const state = gameReducer(runningState, { type: 'TICK' });
      
      expect(state.time).toBe(11);
    });

    it('should not increment time when paused', () => {
      const pausedState = { ...initialState, started: true, paused: true, time: 10 };
      const state = gameReducer(pausedState, { type: 'TICK' });
      
      expect(state.time).toBe(10);
    });

    it('should not increment time when game is won', () => {
      const wonState = { ...initialState, started: true, won: true, time: 10 };
      const state = gameReducer(wonState, { type: 'TICK' });
      
      expect(state.time).toBe(10);
    });
  });

  describe('TOGGLE_PAUSE action', () => {
    it('should toggle pause state', () => {
      const runningState = { ...initialState, started: true, paused: false };
      const pausedState = gameReducer(runningState, { type: 'TOGGLE_PAUSE' });
      
      expect(pausedState.paused).toBe(true);
      
      const resumedState = gameReducer(pausedState, { type: 'TOGGLE_PAUSE' });
      expect(resumedState.paused).toBe(false);
    });
  });

  describe('TOGGLE_HINTS action', () => {
    it('should toggle hints when not already used', () => {
      const state = gameReducer(initialState, { type: 'TOGGLE_HINTS' });
      
      expect(state.showHints).toBe(true);
      expect(state.hintsUsed).toBe(1);
    });

    it('should increment hints used when enabling', () => {
      const stateWithHints = { ...initialState, showHints: false, hintsUsed: 2 };
      const state = gameReducer(stateWithHints, { type: 'TOGGLE_HINTS' });
      
      expect(state.showHints).toBe(true);
      expect(state.hintsUsed).toBe(3);
    });

    it('should not increment hints when disabling', () => {
      const stateWithHints = { ...initialState, showHints: true, hintsUsed: 2 };
      const state = gameReducer(stateWithHints, { type: 'TOGGLE_HINTS' });
      
      expect(state.showHints).toBe(false);
      expect(state.hintsUsed).toBe(2);
    });
  });

  describe('SHOW_MODAL action', () => {
    it('should show victory modal', () => {
      const state = gameReducer(initialState, { type: 'SHOW_MODAL', modal: 'victory' });
      
      expect(state.showVictory).toBe(true);
      expect(state.showTutorial).toBe(false);
    });

    it('should show tutorial modal', () => {
      const state = gameReducer(initialState, { type: 'SHOW_MODAL', modal: 'tutorial' });
      
      expect(state.showTutorial).toBe(true);
      expect(state.showVictory).toBe(false);
    });

    it('should hide all modals when modal is null', () => {
      const stateWithModals = {
        ...initialState,
        showVictory: true,
        showTutorial: true
      };
      
      const state = gameReducer(stateWithModals, { type: 'SHOW_MODAL', modal: null });
      
      expect(state.showVictory).toBe(false);
      expect(state.showTutorial).toBe(false);
    });
  });

  describe('UNDO action', () => {
    it('should return to previous state', () => {
      const startedState = gameReducer(initialState, { type: 'START', difficulty: 'easy' });
      const afterMove = gameReducer(startedState, { type: 'CLICK', row: 0, col: 0 });
      const undoneState = gameReducer(afterMove, { type: 'UNDO' });
      
      expect(undoneState.moves).toBe(0);
      expect(undoneState.undosUsed).toBe(1);
    });

    it('should restore grid state', () => {
      const startedState = gameReducer(initialState, { type: 'START', difficulty: 'easy' });
      const originalGrid = JSON.stringify(startedState.grid);
      
      const afterMove = gameReducer(startedState, { type: 'CLICK', row: 0, col: 0 });
      const undoneState = gameReducer(afterMove, { type: 'UNDO' });
      
      expect(JSON.stringify(undoneState.grid)).toBe(originalGrid);
    });

    it('should not undo when history is empty', () => {
      const state = gameReducer(initialState, { type: 'UNDO' });
      
      expect(state).toEqual(initialState);
    });
  });

  describe('RESET_UNDOS action', () => {
    it('should reset undo counter', () => {
      const stateWithUndos = { ...initialState, undosUsed: 5 };
      const state = gameReducer(stateWithUndos, { type: 'RESET_UNDOS' });
      
      expect(state.undosUsed).toBe(0);
    });
  });

  describe('LOCK_DECR action', () => {
    it('should decrement all locked tiles', () => {
      const stateWithLocked = {
        ...initialState,
        locked: new Map([['0-0', 3], ['1-1', 2], ['2-2', 1]])
      };
      
      const state = gameReducer(stateWithLocked, { type: 'LOCK_DECR' });
      
      expect(state.locked.get('0-0')).toBe(2);
      expect(state.locked.get('1-1')).toBe(1);
      expect(state.locked.has('2-2')).toBe(false); // Removed when reaching 0
    });
  });

  describe('SET_OPTIMAL_PATH action', () => {
    it('should set optimal path and moves', () => {
      const state = gameReducer(initialState, { 
        type: 'SET_OPTIMAL_PATH', 
        path: ['0-0', '1-1', '2-2'],
        moves: 3
      });
      
      expect(state.optimalPath).toEqual(['0-0', '1-1', '2-2']);
      expect(state.optimalMoves).toBe(3);
    });
  });
});