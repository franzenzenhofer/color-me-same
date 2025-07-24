import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { useGenerator } from '../../hooks/useGenerator';
import { DIFFICULTIES, DifficultyKey } from '../../constants/gameConfig';
import { motion } from 'framer-motion';
import { Play, Trophy, Zap, Clock } from 'lucide-react';

const StartScreen: React.FC = () => {
  const { state, dispatch } = useGame();
  const { generate } = useGenerator();
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyKey>('easy');
  const [loading, setLoading] = useState(false);

  if (state.started) return null;

  const handleStart = async () => {
    setLoading(true);
    try {
      const puzzle = await generate(DIFFICULTIES[selectedDifficulty], 1); // Start at level 1
      dispatch({ 
        type: 'NEW_GAME', 
        payload: { difficulty: selectedDifficulty, level: 1, ...puzzle } 
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
      {/* Compact header */}
      <div className="mb-3">
        <motion.h1
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="text-2xl md:text-3xl font-bold text-white mb-1"
        >
          Color Me Same
        </motion.h1>
        
        <p className="text-sm text-white/80 mb-3">
          Transform the grid into a single color!
        </p>
      </div>

      {/* Compact difficulty selector */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mb-3 max-w-sm mx-auto w-full">
        <h2 className="text-base font-semibold text-white mb-2">
          Select Difficulty
        </h2>
        
        <div className="grid gap-1">
          {(Object.entries(DIFFICULTIES) as [DifficultyKey, typeof DIFFICULTIES[DifficultyKey]][]).map(([key, config]) => (
            <motion.button
              key={key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedDifficulty(key)}
              className={`
                p-2 rounded-lg text-left transition-all text-xs
                ${selectedDifficulty === key 
                  ? 'bg-white/20 ring-1 ring-white/50' 
                  : 'bg-white/10 hover:bg-white/15'}
              `}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-white capitalize text-sm">
                    {key}
                  </h3>
                  <p className="text-xs text-white/70">
                    {config.size}×{config.size} • {config.colors} colors
                  </p>
                </div>
                <div className="flex gap-1">
                  {config.powerTileChance > 0 && (
                    <Zap size={10} className="text-yellow-400" />
                  )}
                  {config.maxMoves > 0 && (
                    <Trophy size={10} className="text-blue-400" />
                  )}
                  {config.timeLimit > 0 && (
                    <Clock size={10} className="text-red-400" />
                  )}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Start button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleStart}
        disabled={loading}
        className="btn-primary text-sm px-6 py-2 flex items-center gap-2 mx-auto mb-2"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
            <span>Generating...</span>
          </>
        ) : (
          <>
            <Play size={14} />
            <span>Start Game</span>
          </>
        )}
      </motion.button>

      {/* Compact tip */}
      <p className="text-white/60 text-xs">
        Complete puzzles to earn XP and unlock belt colors!
      </p>
    </motion.div>
  );
};

export default StartScreen;