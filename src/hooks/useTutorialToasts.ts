import { useEffect, useState, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { useToast } from '../context/ToastContext';

/**
 * Hook to manage tutorial toasts for the first 3 levels
 * Shows contextual hints to guide new players
 */
export const useTutorialToasts = () => {
  const { state } = useGame();
  const { showToast } = useToast();
  const { level, started, playerMoves, won } = state;
  
  // Track which tutorial messages have been shown
  const [shownMessages, setShownMessages] = useState<Set<string>>(new Set());
  
  const showTutorialMessage = useCallback((key: string, message: string, duration = 5000) => {
    if (!shownMessages.has(key)) {
      showToast(message, 'tutorial', duration);
      setShownMessages(prev => new Set(prev).add(key));
    }
  }, [shownMessages, showToast]);
  
  // Show tutorial messages at start of each tutorial level
  useEffect(() => {
    if (started && playerMoves.length === 0 && !won && level <= 3) {
      setTimeout(() => {
        const messages = {
          1: 'Click = 5 tiles flip',
          2: 'Multiple taps needed',
          3: 'Corners unlock patterns'
        };
        showTutorialMessage(`tutorial-${level}`, messages[level as 1 | 2 | 3], 5000);
      }, 800);
    }
  }, [level, started, playerMoves.length, won, showTutorialMessage]);
  
  // Tutorial completion messages
  useEffect(() => {
    if (won && level <= 3) {
      setTimeout(() => {
        const messages = {
          1: '✓ Cross pattern!',
          2: '✓✓ Think ahead!', 
          3: '✓✓✓ Master!'
        };
        showTutorialMessage(`level${level}-win`, messages[level as 1 | 2 | 3], 3000);
      }, 300);
    }
  }, [won, level, showTutorialMessage]);
  
  // Reset shown messages when starting a new game
  useEffect(() => {
    if (started && playerMoves.length === 0) {
      setShownMessages(new Set());
    }
  }, [started, playerMoves.length]);
  
  return { showTutorialMessage };
};