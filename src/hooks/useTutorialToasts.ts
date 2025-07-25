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
  
  // Level 1: Welcome and center tile hint
  useEffect(() => {
    if (level === 1 && started && playerMoves.length === 0 && !won) {
      setTimeout(() => {
        showTutorialMessage('level1-start', 'Tap center', 3000);
      }, 1000);
    }
  }, [level, started, playerMoves.length, won, showTutorialMessage]);
  
  // Level 2: Explain cross pattern
  useEffect(() => {
    if (level === 2 && started && playerMoves.length === 0 && !won) {
      setTimeout(() => {
        showTutorialMessage('level2-start', 'Tap = + pattern', 3000);
      }, 1000);
    }
  }, [level, started, playerMoves.length, won, showTutorialMessage]);
  
  // Level 3: Explain color cycling
  useEffect(() => {
    if (level === 3 && started && playerMoves.length === 0 && !won) {
      setTimeout(() => {
        showTutorialMessage('level3-start', 'Colors cycle 0→1→2→0', 3000);
      }, 1000);
    }
  }, [level, started, playerMoves.length, won, showTutorialMessage]);
  
  // Success messages
  useEffect(() => {
    if (won && level <= 3) {
      setTimeout(() => {
        const messages = {
          1: 'Nice!',
          2: 'Great!',
          3: 'Perfect!'
        };
        showTutorialMessage(`level${level}-win`, messages[level as 1 | 2 | 3], 2000);
      }, 500);
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