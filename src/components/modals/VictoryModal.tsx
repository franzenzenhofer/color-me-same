import React from 'react';
import { useGame } from '../../context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, Target, Star } from 'lucide-react';

interface VictoryModalProps {
  onShowAchievements?: (achievements: string[]) => void;
}

const VictoryModal: React.FC<VictoryModalProps> = ({ onShowAchievements }) => {
  const { state, dispatch } = useGame();
  const { showVictory, won, score, moves, solution, time } = state;

  if (!showVictory) return null;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const efficiency = solution.length ? Math.round((solution.length / moves) * 100) : 100;
  const stars = efficiency >= 90 ? 3 : efficiency >= 70 ? 2 : 1;

  const handleNewGame = () => {
    window.location.reload(); // Simple reload for now
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="modal-backdrop"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="modal-content text-center"
        >
          {won ? (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-6xl mb-4"
              >
                🎉
              </motion.div>
              
              <h2 className="text-3xl font-bold text-green-600 mb-2">
                Puzzle Solved!
              </h2>
              
              <div className="flex justify-center gap-1 mb-4">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: i < stars ? 1 : 0.3, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                  >
                    <Star
                      size={32}
                      className={i < stars ? 'text-yellow-400' : 'text-gray-300'}
                      fill={i < stars ? 'currentColor' : 'none'}
                    />
                  </motion.div>
                ))}
              </div>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-center gap-2">
                  <Target size={20} className="text-gray-600" />
                  <span>Moves: <strong>{moves}</strong> / {solution.length}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Clock size={20} className="text-gray-600" />
                  <span>Time: <strong>{formatTime(time)}</strong></span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Trophy size={20} className="text-gray-600" />
                  <span>Score: <strong className="text-xl">{score}</strong></span>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Efficiency: {efficiency}%
              </p>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">⏰</div>
              <h2 className="text-3xl font-bold text-red-600 mb-4">
                Time's Up!
              </h2>
              <p className="text-gray-600 mb-6">
                Don't worry, you can try again!
              </p>
            </>
          )}
          
          <div className="flex gap-2">
            <button
              onClick={handleNewGame}
              className="btn-primary flex-1"
            >
              New Game
            </button>
            <button
              onClick={() => dispatch({ type: 'SHOW_MODAL', modal: null })}
              className="btn-secondary flex-1"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VictoryModal;