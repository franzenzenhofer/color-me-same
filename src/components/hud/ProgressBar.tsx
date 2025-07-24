import React from 'react';
import { useProgression } from '../../hooks/useProgression';
import { BELT_COLORS } from '../../constants/gameConfig';
import { Trophy, Zap, Target } from 'lucide-react';
import { motion } from 'framer-motion';

const ProgressBar: React.FC = () => {
  const { progress, getNextBelt } = useProgression();
  const currentBeltData = BELT_COLORS[progress.currentBelt];
  const nextBelt = getNextBelt();

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4">
      {/* Current Belt Display */}
      <div className="flex items-center gap-3 mb-3">
        <motion.div
          className="w-8 h-8 rounded-full border-2 border-white/30 flex items-center justify-center"
          style={{ backgroundColor: currentBeltData.color }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Trophy size={16} className="text-white drop-shadow-lg" />
        </motion.div>
        
        <div>
          <h3 className="text-white font-semibold">
            {currentBeltData.name} Belt
          </h3>
          <p className="text-white/70 text-sm">
            {progress.totalXP} XP • {progress.completedPuzzles} puzzles
          </p>
        </div>
      </div>

      {/* Progress to Next Belt */}
      {nextBelt && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/80 text-sm">
              Progress to {nextBelt.name} Belt
            </span>
            <span className="text-white/80 text-sm">
              {nextBelt.xpNeeded} XP needed
            </span>
          </div>
          
          <div className="relative bg-white/10 rounded-full h-2 overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 h-full rounded-full"
              style={{ backgroundColor: nextBelt.color }}
              initial={{ width: 0 }}
              animate={{ width: `${nextBelt.progress * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
            
            {/* Sparkle effect */}
            <motion.div
              className="absolute top-0 h-full w-4 bg-gradient-to-r from-transparent via-white/50 to-transparent"
              animate={{ x: [-20, 200] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/10">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-green-400">
            <Target size={14} />
            <span className="text-xs font-medium">{progress.perfectSolves}</span>
          </div>
          <p className="text-white/60 text-xs">Perfect</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-orange-400">
            <Zap size={14} />
            <span className="text-xs font-medium">{progress.dailyStreak}</span>
          </div>
          <p className="text-white/60 text-xs">Streak</p>
        </div>
        
        <div className="text-center">
          <div className="text-blue-400 text-xs font-medium">
            {progress.statistics.bestTime === Infinity 
              ? '--' 
              : `${Math.round(progress.statistics.bestTime)}s`
            }
          </div>
          <p className="text-white/60 text-xs">Best Time</p>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;