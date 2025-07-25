import React from 'react';
import { useGame } from '../../context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, Target, Star, ArrowRight, Shield } from 'lucide-react';
import { useGenerator } from '../../hooks/useGenerator';
import { DIFFICULTIES } from '../../constants/gameConfig';
import { getLevelMilestoneDescription } from '../../utils/levelConfig';
import { calculateLevelScore, formatPoints } from '../../utils/scoring';

interface VictoryModalProps {
  onShowAchievements?: (achievements: string[]) => void;
}

const VictoryModal: React.FC<VictoryModalProps> = ({ onShowAchievements: _onShowAchievements }) => {
  const { state, dispatch } = useGame();
  const { showVictory, won, score, moves, optimalPath, time, level, hintsEnabled, undoCount, totalPoints } = state;
  const { generate } = useGenerator();

  if (!showVictory) return null;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate efficiency - can be over 100% if player beats optimal path!
  const efficiency = optimalPath.length && moves > 0 ? Math.round((optimalPath.length / moves) * 100) : 100;
  const stars = efficiency >= 100 ? 3 : efficiency >= 80 ? 2 : 1;
  
  // Calculate score breakdown
  const levelScore = won ? calculateLevelScore({
    level,
    moves,
    optimalMoves: optimalPath.length,
    time,
    hintsUsed: hintsEnabled,
    undoUsed: undoCount > 0,
    powerTilesUsedOptimally: 0 // TODO: Track power tile usage
  }) : null;

  const handleNewGame = () => {
    window.location.reload(); // Simple reload for now
  };

  const handleContinue = async () => {
    // Progress to next level
    dispatch({ type: 'NEXT_LEVEL' });
    
    // Generate new game for next level
    const nextLevel = level + 1;
    const result = await generate(DIFFICULTIES.easy, nextLevel); // Dummy config, will be replaced
    dispatch({ 
      type: 'NEW_GAME', 
      payload: { ...result, level: nextLevel } 
    });
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
                className="text-4xl mb-2"
              >
                🎉
              </motion.div>
              
              <h2 className="text-2xl font-bold text-green-600 mb-2">
                Puzzle Solved!
              </h2>
              
              <div className="flex justify-center gap-1 mb-2">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: i < stars ? 1 : 0.3, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                  >
                    <Star
                      size={24}
                      className={i < stars ? 'text-yellow-400' : 'text-gray-300'}
                      fill={i < stars ? 'currentColor' : 'none'}
                    />
                  </motion.div>
                ))}
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-center gap-2">
                  <Target size={20} className="text-gray-600" />
                  <span>Moves: <strong>{moves}</strong> / {optimalPath.length}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Clock size={20} className="text-gray-600" />
                  <span>Time: <strong>{formatTime(time)}</strong></span>
                </div>
                
                {/* Score breakdown */}
                {levelScore && levelScore.totalPoints > 0 && (
                  <>
                    <div className="border-t pt-2 mt-2">
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Base Points:</span>
                          <span>{levelScore.basePoints}</span>
                        </div>
                        {levelScore.moveBonus > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Move Bonus:
                              {moves < optimalPath.length && " 🌟"}
                            </span>
                            <span className="text-green-600">+{levelScore.moveBonus}</span>
                          </div>
                        )}
                        {levelScore.timeBonus > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Time Bonus:</span>
                            <span className="text-green-600">+{levelScore.timeBonus}</span>
                          </div>
                        )}
                        {levelScore.perfectBonus > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Perfect Bonus:</span>
                            <span className="text-green-600">+{levelScore.perfectBonus}</span>
                          </div>
                        )}
                        {undoCount > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Undo Penalty:</span>
                            <span className="text-red-600">-25%</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="border-t pt-2">
                      <div className="flex items-center justify-center gap-2">
                        <Trophy size={20} className="text-yellow-500" />
                        <span className="text-lg font-bold">{formatPoints(score)} points</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Total: {formatPoints(totalPoints)}
                      </div>
                    </div>
                  </>
                )}
                
                {/* Zero points message for hints */}
                {hintsEnabled && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <Shield size={16} />
                      <span className="text-sm">No points awarded (hints used)</span>
                    </div>
                  </div>
                )}
              </div>
              
              <p className="text-sm text-gray-600 mb-2">
                Efficiency: {efficiency}%
                {efficiency > 100 && (
                  <span className="text-yellow-600 font-bold ml-2">
                    🌟 Super Efficient!
                  </span>
                )}
              </p>
              
              {/* Show milestone message for next level */}
              {(() => {
                const nextLevel = level + 1;
                const milestone = getLevelMilestoneDescription(nextLevel);
                if (milestone) {
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-2"
                    >
                      <p className="text-sm text-blue-800 font-medium">
                        Next Level: {milestone}
                      </p>
                    </motion.div>
                  );
                }
                return null;
              })()}
            </>
          ) : (
            <>
              <div className="text-4xl mb-2">⏰</div>
              <h2 className="text-2xl font-bold text-red-600 mb-2">
                Time&apos;s Up!
              </h2>
              <p className="text-gray-600 mb-4">
                Don&apos;t worry, you can try again!
              </p>
            </>
          )}
          
          <div className="flex gap-2">
            {won && (
              <button
                onClick={handleContinue}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight size={16} />
              </button>
            )}
            <button
              onClick={handleNewGame}
              className={`btn-secondary flex-1 ${!won ? 'btn-primary' : ''}`}
            >
              New Game
            </button>
            <button
              onClick={() => dispatch({ type: 'SHOW_MODAL', modal: null })}
              className="btn-secondary"
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