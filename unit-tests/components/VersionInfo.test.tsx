import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import VersionInfo from '../../src/components/VersionInfo';

// Mock version.json
vi.mock('../../src/version.json', () => ({
  default: {
    version: '1.2.3',
    buildDate: '2025-01-01T12:00:00.000Z',
    gitCommit: 'abc123def456',
    displayVersion: 'v1.2.3',
    displayDate: '1/1/2025 12:00:00 PM',
    displayCommit: 'abc123d'
  }
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, onClick, ...props }: any) => 
      React.createElement('div', { className, onClick, ...props }, children)
  },
  AnimatePresence: ({ children }: any) => React.createElement(React.Fragment, null, children)
}));

// Mock lucide-react
vi.mock('lucide-react', () => ({
  Code2: ({ size, className }: any) => 
    React.createElement('div', { 'data-testid': 'code2-icon', 'data-size': size, className }, 'Code2'),
  X: ({ size, className }: any) => 
    React.createElement('div', { 'data-testid': 'x-icon', 'data-size': size, className }, 'X')
}));

describe('VersionInfo', () => {
  let mockClipboard: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockClipboard = {
      writeText: vi.fn().mockResolvedValue(undefined)
    };
    Object.defineProperty(navigator, 'clipboard', {
      value: mockClipboard,
      writable: true,
      configurable: true
    });
  });

  afterEach(() => {
    // Reset clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      writable: true,
      configurable: true
    });
  });

  it('renders version info with icon', () => {
    render(<VersionInfo />);
    
    expect(screen.getByText('v1.2.3')).toBeInTheDocument();
    expect(screen.getByTestId('code2-icon')).toBeInTheDocument();
  });

  it('displays correct date and commit info', () => {
    render(<VersionInfo />);
    
    expect(screen.getByText(/1\/1\/2025/)).toBeInTheDocument();
    expect(screen.getByText(/abc123d/)).toBeInTheDocument();
  });

  it('shows detailed info when clicked', () => {
    render(<VersionInfo />);
    
    const versionElement = screen.getByText('v1.2.3').parentElement!;
    fireEvent.click(versionElement);
    
    expect(screen.getByText('Version Details')).toBeInTheDocument();
    expect(screen.getByText(/Version: v1.2.3/)).toBeInTheDocument();
    expect(screen.getByText(/Built: 1\/1\/2025 12:00:00 PM/)).toBeInTheDocument();
    expect(screen.getByText(/Commit: abc123d/)).toBeInTheDocument();
  });

  it('closes detailed view when X is clicked', () => {
    render(<VersionInfo />);
    
    // Open details
    const versionElement = screen.getByText('v1.2.3').parentElement!;
    fireEvent.click(versionElement);
    
    // Close with X button
    const closeButton = screen.getByTestId('x-icon').parentElement!;
    fireEvent.click(closeButton);
    
    expect(screen.queryByText('Version Details')).not.toBeInTheDocument();
  });

  it('closes detailed view when backdrop is clicked', () => {
    const { container } = render(<VersionInfo />);
    
    // Open details
    const versionElement = screen.getByText('v1.2.3').parentElement!;
    fireEvent.click(versionElement);
    
    // Click backdrop
    const backdrop = container.querySelector('.fixed.inset-0');
    fireEvent.click(backdrop!);
    
    expect(screen.queryByText('Version Details')).not.toBeInTheDocument();
  });

  it('prevents closing when modal content is clicked', () => {
    render(<VersionInfo />);
    
    // Open details
    const versionElement = screen.getByText('v1.2.3').parentElement!;
    fireEvent.click(versionElement);
    
    // Click modal content
    const modalContent = screen.getByText('Version Details').parentElement!;
    fireEvent.click(modalContent);
    
    // Should still be open
    expect(screen.getByText('Version Details')).toBeInTheDocument();
  });

  it('copies commit hash when copy button is clicked', async () => {
    render(<VersionInfo />);
    
    // Open details
    const versionElement = screen.getByText('v1.2.3').parentElement!;
    fireEvent.click(versionElement);
    
    // Click copy button
    const copyButton = screen.getByText('Copy');
    fireEvent.click(copyButton);
    
    await waitFor(() => {
      expect(mockClipboard.writeText).toHaveBeenCalledWith('abc123def456');
    });
    
    // Should show "Copied!" text
    expect(screen.getByText('Copied!')).toBeInTheDocument();
  });

  it('resets copy button text after delay', async () => {
    vi.useFakeTimers();
    render(<VersionInfo />);
    
    // Open details
    const versionElement = screen.getByText('v1.2.3').parentElement!;
    fireEvent.click(versionElement);
    
    // Click copy button
    const copyButton = screen.getByText('Copy');
    fireEvent.click(copyButton);
    
    expect(screen.getByText('Copied!')).toBeInTheDocument();
    
    // Advance timers
    vi.advanceTimersByTime(2000);
    
    await waitFor(() => {
      expect(screen.getByText('Copy')).toBeInTheDocument();
      expect(screen.queryByText('Copied!')).not.toBeInTheDocument();
    });
    
    vi.useRealTimers();
  });

  it('handles clipboard error gracefully', async () => {
    mockClipboard.writeText.mockRejectedValue(new Error('Clipboard error'));
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<VersionInfo />);
    
    // Open details
    const versionElement = screen.getByText('v1.2.3').parentElement!;
    fireEvent.click(versionElement);
    
    // Click copy button
    const copyButton = screen.getByText('Copy');
    fireEvent.click(copyButton);
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to copy:', expect.any(Error));
    });
    
    consoleErrorSpy.mockRestore();
  });

  it('has correct CSS classes for positioning', () => {
    const { container } = render(<VersionInfo />);
    
    const versionInfo = container.firstChild as HTMLElement;
    expect(versionInfo).toHaveClass('absolute', 'bottom-4', 'left-1/2', 'transform', '-translate-x-1/2');
  });

  it('has correct hover state classes', () => {
    render(<VersionInfo />);
    
    const versionElement = screen.getByText('v1.2.3').parentElement!;
    expect(versionElement).toHaveClass('hover:bg-white/5');
  });

  it('displays icon with correct size', () => {
    render(<VersionInfo />);
    
    const icon = screen.getByTestId('code2-icon');
    expect(icon).toHaveAttribute('data-size', '16');
    expect(icon).toHaveClass('text-purple-400');
  });
});