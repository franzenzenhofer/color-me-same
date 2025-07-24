import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import Header from '../../../src/components/layout/Header';

// Mock the useGame hook
const mockState = { started: false };
vi.mock('../../../src/context/GameContext', () => ({
  useGame: () => ({
    state: mockState
  })
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    header: ({ children, ...props }: React.PropsWithChildren<React.HTMLProps<HTMLElement>>) => 
      <header {...props}>{children}</header>
  }
}));

// Mock location
const mockReload = vi.fn();
Object.defineProperty(window, 'location', {
  value: { reload: mockReload },
  writable: true
});

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState.started = false;
  });

  it('renders header with app name', () => {
    render(<Header />);
    expect(screen.getByText('Color Me Same')).toBeInTheDocument();
  });

  it('renders home icon', () => {
    render(<Header />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('does not reload when game has not started', () => {
    render(<Header />);
    const homeButton = screen.getByRole('button');
    fireEvent.click(homeButton);
    expect(mockReload).not.toHaveBeenCalled();
  });

  it('reloads page when game has started', () => {
    mockState.started = true;
    render(<Header />);
    const homeButton = screen.getByRole('button');
    fireEvent.click(homeButton);
    expect(mockReload).toHaveBeenCalled();
  });

  it('has correct styling classes', () => {
    render(<Header />);
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('fixed', 'top-0', 'left-0', 'right-0', 'z-50');
  });

  it('button has hover effects', () => {
    render(<Header />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('group');
  });
});