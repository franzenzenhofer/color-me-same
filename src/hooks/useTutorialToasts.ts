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
  
  const showTutorialMessage = useCallback((key: string, message: string, duration = 4000) => {
    if (!shownMessages.has(key)) {
      showToast(message, 'tutorial', duration);
      setShownMessages(prev => new Set(prev).add(key));
    }
  }, [shownMessages, showToast]);
  
  // Show ONE tutorial message only at start of tutorials
  useEffect(() => {
    if (level === 1 && started && playerMoves.length === 0 && !won) {
      setTimeout(() => {
        showTutorialMessage('tutorial-info', 'Tutorials 1-3', 2000);
      }, 500);
    }
  }, [level, started, playerMoves.length, won, showTutorialMessage]);
  
  // Minimal success messages
  useEffect(() => {
    if (won && level <= 3) {
      setTimeout(() => {
        const messages = {
          1: '✓',
          2: '✓✓', 
          3: '✓✓✓'
        };
        showTutorialMessage(`level${level}-win`, messages[level as 1 | 2 | 3], 1000);
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