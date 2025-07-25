import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { useGenerator } from '../../hooks/useGenerator';
import { DIFFICULTIES } from '../../constants/gameConfig';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

const StartScreen: React.FC = () => {
  const { state, dispatch } = useGame();
  const { generate } = useGenerator();
  const [loading, setLoading] = useState(false);

  if (state.started) return null;

  const handleStart = async () => {
    setLoading(true);
    try {
      // Always start at level 1 for new games
      const startingLevel = 1;
      
      // Use a dummy config for now - will be replaced by level-based generation
      const puzzle = await generate(DIFFICULTIES.easy, startingLevel);
      dispatch({ 
        type: 'NEW_GAME', 
        payload: { level: startingLevel, ...puzzle } 
      });
    } catch (error) {
      console.error('Failed to generate puzzle:', error);
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center flex-1 flex flex-col justify-center max-h-screen py-2"
    >
      {/* Header */}
      <div className="mb-6">
        <motion.h1
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="text-4xl md:text-5xl font-bold text-white mb-2"
        >
          Color Me Same
        </motion.h1>
        
        <p className="text-lg text-white/80">
          Transform the grid into a single color!
        </p>
      </div>

      {/* Start button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleStart}
        disabled={loading}
        className="btn-primary text-lg px-8 py-3 flex items-center gap-3 mx-auto mb-4"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
            <span>Generating...</span>
          </>
        ) : (
          <>
            <Play size={20} />
            <span>New Game</span>
          </>
        )}
      </motion.button>

      {/* Starting level info */}
      <p className="text-white/60 text-sm">
        Starting at Level 1 • 3×3 Grid • 1 Move
      </p>
    </motion.div>
  );
};

export default StartScreen;