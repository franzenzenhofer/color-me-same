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
      const puzzle = await generate(DIFFICULTIES[selectedDifficulty]);
      dispatch({ 
        type: 'NEW_GAME', 
        payload: { difficulty: selectedDifficulty, ...puzzle } 
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
      className="text-center"
    >
      <motion.h1
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="text-5xl font-bold text-white mb-2"
      >
        Color Me Same
      </motion.h1>
      
      <p className="text-xl text-white/80 mb-8">
        Transform the grid into a single color!
      </p>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
        <h2 className="text-2xl font-semibold text-white mb-4">
          Select Difficulty
        </h2>
        
        <div className="grid gap-3">
          {(Object.entries(DIFFICULTIES) as [DifficultyKey, typeof DIFFICULTIES[DifficultyKey]][]).map(([key, config]) => (
            <motion.button
              key={key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedDifficulty(key)}
              className={`
                p-4 rounded-lg text-left transition-all
                ${selectedDifficulty === key 
                  ? 'bg-white/20 ring-2 ring-white/50' 
                  : 'bg-white/10 hover:bg-white/15'}
              `}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-white capitalize">
                    {key}
                  </h3>
                  <p className="text-sm text-white/70 mt-1">
                    {config.description}
                  </p>
                </div>
                <div className="flex gap-2">
                  {config.powerTileChance > 0 && (
                    <Zap size={16} className="text-yellow-400" />
                  )}
                  {config.maxMoves > 0 && (
                    <Trophy size={16} className="text-blue-400" />
                  )}
                  {config.timeLimit > 0 && (
                    <Clock size={16} className="text-red-400" />
                  )}
                </div>
              </div>
              
              <div className="mt-2 text-xs text-white/60">
                {config.size}×{config.size} grid • {config.colors} colors
                {config.maxMoves > 0 && ` • ${config.maxMoves} moves`}
                {config.timeLimit > 0 && ` • ${config.timeLimit / 60}min`}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleStart}
        disabled={loading}
        className="btn-primary text-lg px-8 py-3 flex items-center gap-2 mx-auto"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            <span>Generating...</span>
          </>
        ) : (
          <>
            <Play size={20} />
            <span>Start Game</span>
          </>
        )}
      </motion.button>

      <div className="mt-8 text-white/60 text-sm">
        <p>Tip: Complete puzzles efficiently to earn stars and unlock new worlds!</p>
      </div>
    </motion.div>
  );
};

export default StartScreen;