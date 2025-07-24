/**
 * @fileoverview Main Game Board Component
 * 
 * The GameBoard is the central interactive element of Color Me Same. It renders
 * a responsive grid of colored tiles that players click to solve puzzles.
 * 
 * Key features:
 * - Responsive sizing: Adapts to any screen size (3x3 to 20x20 grids)
 * - Dynamic hints: Shows optimal next move when enabled
 * - Solvability verification: Real-time checking (for debugging)
 * - Smooth animations: Framer Motion for delightful interactions
 * - Victory detection: Auto-shows victory modal on completion
 * 
 * The component uses custom hooks for complex logic separation and
 * maintains performance even with large grids through React optimizations.
 * 
 * @module GameBoard
 */

import React, { useEffect, useState } from 'react';
import { useGame } from '../../context/GameContext';
import Tile from './Tile';
import { useDynamicHint } from '../../hooks/useDynamicHint';
import { useSolvabilityCheck } from '../../hooks/useSolvabilityCheck';
import { motion } from 'framer-motion';
import { DIFFICULTIES } from '../../constants/gameConfig';

/**
 * GameBoard Component - Renders the interactive puzzle grid
 * 
 * This component is responsible for:
 * 1. Rendering the grid of tiles based on game state
 * 2. Calculating responsive tile sizes for any screen
 * 3. Showing hints when enabled
 * 4. Detecting victory condition
 * 5. Managing tile interactions
 * 
 * @component
 * @returns {JSX.Element} The game board grid
 */
const GameBoard: React.FC = () => {
  const { state, dispatch } = useGame();
  const { grid, power, locked, started, won, paused, difficulty, showHints, optimalPath, playerMoves } = state;
  const [tileSize, setTileSize] = useState(60);
  
  // Dynamic hint calculation with optimal path tracking
  const { nextMove: hintMove, isCalculating, isOnOptimalPath } = useDynamicHint(
    grid,
    power,
    locked,
    difficulty,
    showHints && !won && !paused,
    optimalPath,
    playerMoves
  );
  
  // Check solvability after each move
  const colors = DIFFICULTIES[difficulty].colors;
  const { isSolvable, isChecking } = useSolvabilityCheck(
    grid,
    colors,
    power,
    locked,
    started && !won // Only check during active gameplay
  );
  
  // Show victory modal after delay when puzzle is solved
  useEffect(() => {
    if (won && !state.showVictory) {
      const timer = setTimeout(() => {
        dispatch({ type: 'SHOW_MODAL', modal: 'victory' });
      }, 2000); // 2 second delay to admire the solved grid
      
      return () => clearTimeout(timer);
    }
  }, [won, state.showVictory, dispatch]);

  /**
   * Calculate responsive tile size based on viewport and grid dimensions
   * 
   * This effect runs whenever the grid changes or window resizes. It ensures
   * that any grid size (3x3 to 20x20) fits perfectly on any screen size while
   * maintaining square tiles and leaving room for UI elements.
   * 
   * Algorithm:
   * 1. Calculate available space after UI elements
   * 2. Determine max tile size for width and height
   * 3. Use the smaller to ensure grid fits
   * 4. Apply min/max constraints for usability
   */
  useEffect(() => {
    const calculateTileSize = () => {
      if (!grid.length) return;
      
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // === UI Space Reservation ===
      // We need to reserve space for various UI elements:
      // - Dashboard: ~60px (stats, timer, moves)
      // - PowerUps: ~80px (undo, reset, hint buttons)
      // - ColorCycleInfo: ~60px (shows color progression)
      // - ProgressBar: ~40px (level progress)
      // - Additional padding and margins
      const baseUIHeight = 280;
      
      // Dynamic reservation based on device type
      const reservedHeight = viewportWidth < 768 
        ? Math.min(baseUIHeight, viewportHeight * 0.45) // Mobile: max 45% for UI
        : Math.min(baseUIHeight + 50, viewportHeight * 0.35); // Desktop: max 35% for UI
      
      // Responsive padding
      const padding = viewportWidth < 768 ? 12 : 24; // Less padding on mobile
      
      const availableWidth = viewportWidth - padding;
      const availableHeight = viewportHeight - reservedHeight;
      
      // Gap between tiles
      const tileGap = 4;
      const boardPadding = 16;
      
      // Calculate max tile size that fits in available space
      const maxTileWidth = Math.floor(
        (availableWidth - boardPadding - (grid.length - 1) * tileGap) / grid.length
      );
      const maxTileHeight = Math.floor(
        (availableHeight - boardPadding - (grid.length - 1) * tileGap) / grid.length
      );
      
      // Use the smaller dimension to ensure board fits both ways
      let calculatedSize = Math.min(maxTileWidth, maxTileHeight);
      
      // Don't artificially limit tile size - let it use available space
      // Only apply minimum size to ensure visibility
      const minSize = grid.length >= 20 ? 20 : 
                      grid.length >= 16 ? 25 :
                      grid.length >= 12 ? 30 :
                      grid.length >= 10 ? 35 :
                      grid.length >= 6 ? 40 : 45;
      
      // For very large grids on small screens, ensure they fit
      if (viewportWidth < 768 && grid.length > 12) {
        const mobileMax = Math.floor((viewportWidth - 20) / grid.length) - 1;
        calculatedSize = Math.min(calculatedSize, mobileMax);
      }
      
      // Apply minimum size
      calculatedSize = Math.max(minSize, calculatedSize);
      
      setTileSize(calculatedSize);
    };
    
    calculateTileSize();
    window.addEventListener('resize', calculateTileSize);
    
    return () => window.removeEventListener('resize', calculateTileSize);
  }, [grid.length]);

  if (!started || !grid.length) return null;

  const handleTileClick = (row: number, col: number) => {
    if (paused || won) return;
    
    dispatch({ type: 'CLICK', row, col });
    
    // Decrement locked tiles
    dispatch({ type: 'LOCK_DECR' });
  };

  const boardSize = grid.length * tileSize + (grid.length - 1) * 4 + 16;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="relative flex flex-col items-center justify-center flex-1 py-2"
    >
      <div
        className="grid gap-1 bg-black/20 backdrop-blur-sm p-2 rounded-xl"
        style={{ 
          gridTemplateColumns: `repeat(${grid.length}, ${tileSize}px)`,
          width: `${boardSize}px`,
          maxWidth: '100%'
        }}
      >
        {grid.map((row, r) =>
          row.map((cell, c) => {
            const key = `${r}-${c}`;
            const isHint = showHints && hintMove?.row === r && hintMove?.col === c;
            const isPower = power.has(key);
            const isLocked = locked.has(key);
            const lockCount = locked.get(key);
            
            return (
              <motion.div
                key={key}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ 
                  scale: won && !state.showVictory ? [1, 1.1, 1] : 1, 
                  rotate: 0 
                }}
                transition={{ 
                  delay: (r * grid.length + c) * 0.02,
                  type: "spring",
                  stiffness: 200,
                  scale: won && !state.showVictory ? {
                    delay: 0.5 + (r * grid.length + c) * 0.05,
                    duration: 0.5,
                    repeat: 2,
                    repeatType: "reverse"
                  } : {}
                }}
                style={{ width: tileSize, height: tileSize }}
              >
                <Tile
                  value={cell}
                  power={isPower}
                  locked={isLocked}
                  lockCount={lockCount}
                  highlight={isHint}
                  onClick={() => handleTileClick(r, c)}
                  disabled={paused || won}
                  row={r}
                  col={c}
                />
              </motion.div>
            );
          })
        )}
      </div>
      
      {showHints && hintMove && !won && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mt-2 text-white/80"
        >
          <p className="text-sm">
            💡 Hint: Click the highlighted tile
            {isOnOptimalPath && " (optimal path)"}
            {!isOnOptimalPath && " (new path)"}
            {isCalculating && " (calculating...)"}
          </p>
        </motion.div>
      )}
      
      {/* Unsolvable warning */}
      {!isSolvable && !isChecking && !won && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-0 left-0 right-0 bg-red-600 text-white p-3 rounded-lg shadow-lg z-50"
        >
          <p className="text-center font-bold">
            ⚠️ Warning: Puzzle has become unsolvable!
          </p>
          <p className="text-center text-sm mt-1">
            This shouldn&apos;t happen with our generation method.
          </p>
        </motion.div>
      )}
      
      {/* Victory celebration overlay */}
      {won && !state.showVictory && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{ 
              duration: 2,
              rotate: { ease: "linear", repeat: 1 },
              scale: { repeat: 2, repeatType: "reverse" }
            }}
            className="text-6xl"
          >
            🎉
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default GameBoard;