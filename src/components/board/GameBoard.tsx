import React from 'react';
import { useGame } from '../../context/GameContext';
import Tile from './Tile';
import { useSolution } from '../../hooks/useSolver';
import { motion } from 'framer-motion';

const GameBoard: React.FC = () => {
  const { state, dispatch } = useGame();
  const { grid, power, locked, solution, started, won, paused } = state;
  
  // Interactive solution assistant
  const { step, current, next } = useSolution(solution);
  const showHint = !!solution.length && !won && started && step < solution.length && !paused;

  if (!started || !grid.length) return null;

  const handleTileClick = (row: number, col: number) => {
    if (paused || won) return;
    
    dispatch({ type: 'CLICK', row, col });
    
    // Advance hint if this was the hinted tile
    if (showHint && current?.row === row && current?.col === col) {
      next();
    }
    
    // Decrement locked tiles
    dispatch({ type: 'LOCK_DECR' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <div
        className="grid gap-2 bg-black/20 backdrop-blur-sm p-4 rounded-xl"
        style={{ 
          gridTemplateColumns: `repeat(${grid.length}, minmax(0, 1fr))`,
          maxWidth: `${grid.length * 80 + (grid.length - 1) * 8 + 32}px`,
          margin: '0 auto'
        }}
      >
        {grid.map((row, r) =>
          row.map((cell, c) => {
            const key = `${r}-${c}`;
            const isHint = showHint && current?.row === r && current?.col === c;
            const isPower = power.has(key);
            const isLocked = locked.has(key);
            const lockCount = locked.get(key);
            
            return (
              <motion.div
                key={key}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  delay: (r * grid.length + c) * 0.02,
                  type: "spring",
                  stiffness: 200
                }}
              >
                <Tile
                  value={cell}
                  power={isPower}
                  locked={isLocked}
                  lockCount={lockCount}
                  highlight={isHint}
                  onClick={() => handleTileClick(r, c)}
                  disabled={paused || won}
                />
              </motion.div>
            );
          })
        )}
      </div>
      
      {showHint && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mt-4 text-white/80"
        >
          <p className="text-sm">
            💡 Hint: Click the highlighted tile ({step + 1}/{solution.length})
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default GameBoard;