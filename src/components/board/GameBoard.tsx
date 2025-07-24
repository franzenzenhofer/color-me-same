import React, { useEffect, useState } from 'react';
import { useGame } from '../../context/GameContext';
import Tile from './Tile';
import { useDynamicHint } from '../../hooks/useDynamicHint';
import { useSolvabilityCheck } from '../../hooks/useSolvabilityCheck';
import { motion } from 'framer-motion';
import { DIFFICULTIES } from '../../constants/gameConfig';

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

  // Calculate responsive tile size
  useEffect(() => {
    const calculateTileSize = () => {
      if (!grid.length) return;
      
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Reserve space for UI elements
      const reservedHeight = 300; // Progress bar, dashboard, padding
      const padding = 32; // Side padding
      
      const availableWidth = viewportWidth - padding;
      const availableHeight = viewportHeight - reservedHeight;
      
      // Calculate max tile size based on available space
      const maxTileWidth = Math.floor((availableWidth - (grid.length - 1) * 4 - 16) / grid.length);
      const maxTileHeight = Math.floor((availableHeight - (grid.length - 1) * 4 - 16) / grid.length);
      
      // Use the smaller dimension to ensure board fits
      let calculatedSize = Math.min(maxTileWidth, maxTileHeight);
      
      // Set min/max bounds
      calculatedSize = Math.max(40, Math.min(80, calculatedSize));
      
      // Special handling for large grids on mobile
      if (viewportWidth < 768 && grid.length > 5) {
        calculatedSize = Math.min(calculatedSize, 50);
      }
      
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
      className="relative flex flex-col items-center"
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