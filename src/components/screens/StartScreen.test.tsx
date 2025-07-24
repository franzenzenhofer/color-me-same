import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import StartScreen from './StartScreen';

// Create mock functions outside to avoid scoping issues
const mockGenerate = vi.fn();
const mockDispatch = vi.fn();

// Mock the hooks and dependencies
vi.mock('../../hooks/useGenerator', () => ({
  useGenerator: () => ({
    generate: mockGenerate
  })
}));

vi.mock('../../context/GameContext', () => ({
  useGame: () => ({
    state: { started: false },
    dispatch: mockDispatch
  }),
  GameProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<React.HTMLProps<HTMLDivElement>>) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: React.PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>>) => <button {...props}>{children}</button>,
    h1: ({ children, ...props }: React.PropsWithChildren<React.HTMLProps<HTMLHeadingElement>>) => <h1 {...props}>{children}</h1>,
  }
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Play: () => <span>Play</span>,
  Trophy: () => <span>Trophy</span>,
  Zap: () => <span>Zap</span>,
  Clock: () => <span>Clock</span>,
}));

describe('StartScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerate.mockResolvedValue({
      grid: [[0, 1], [1, 0]],
      solved: [[0, 0], [0, 0]],
      power: new Set(),
      locked: new Map(),
      solution: [],
      reverse: [],
      optimalPath: [],
      playerMoves: []
    });
  });

  it('renders the start screen with all difficulty options', () => {
    render(<StartScreen />);
    
    expect(screen.getByText('Color Me Same')).toBeInTheDocument();
    expect(screen.getByText('easy')).toBeInTheDocument();
    expect(screen.getByText('medium')).toBeInTheDocument();
    expect(screen.getByText('hard')).toBeInTheDocument();
  });

  it('starts easy mode at level 1', async () => {
    render(<StartScreen />);
    
    // Easy is selected by default
    const startButton = screen.getByText('Start Game');
    fireEvent.click(startButton);
    
    await waitFor(() => {
      // Should generate with level 1 for easy
      expect(mockGenerate).toHaveBeenCalledWith(
        expect.objectContaining({ size: 3 }), // easy config
        1 // level 1
      );
    });
  });

  it('starts medium mode at level 11', async () => {
    render(<StartScreen />);
    
    // Select medium difficulty
    const mediumButton = screen.getByText('medium');
    fireEvent.click(mediumButton);
    
    const startButton = screen.getByText('Start Game');
    fireEvent.click(startButton);
    
    await waitFor(() => {
      // Should generate with level 11 for medium
      expect(mockGenerate).toHaveBeenCalledWith(
        expect.objectContaining({ size: 6 }), // medium config
        11 // level 11
      );
    });
  });

  it('starts hard mode at level 21', async () => {
    render(<StartScreen />);
    
    // Select hard difficulty
    const hardButton = screen.getByText('hard');
    fireEvent.click(hardButton);
    
    const startButton = screen.getByText('Start Game');
    fireEvent.click(startButton);
    
    await waitFor(() => {
      // Should generate with level 21 for hard
      expect(mockGenerate).toHaveBeenCalledWith(
        expect.objectContaining({ size: 10 }), // hard config
        21 // level 21
      );
    });
  });

  it('dispatches NEW_GAME action with correct level', async () => {
    render(<StartScreen />);
    
    // Select medium
    const mediumButton = screen.getByText('medium');
    fireEvent.click(mediumButton);
    
    const startButton = screen.getByText('Start Game');
    fireEvent.click(startButton);
    
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'NEW_GAME',
        payload: expect.objectContaining({
          difficulty: 'medium',
          level: 11 // Should be level 11 for medium
        })
      });
    });
  });
});