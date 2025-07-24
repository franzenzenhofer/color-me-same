import React, { useCallback } from 'react';
import { Timer, Target, Trophy, Settings, Pause, Play } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { DIFFICULTIES } from '../../constants/gameConfig';
import { useTimer } from '../../hooks/useTimer';
import { motion } from 'framer-motion';

const Dashboard: React.FC = () => {
  const { state, dispatch } = useGame();
  const { started, time, moves, score, difficulty, won, paused } = state;

  // Global timer
  const timeLimit = DIFFICULTIES[difficulty].timeLimit;
  useTimer(started && !won && !paused && !!timeLimit, useCallback(() => {
    dispatch({ type: 'TICK' });
  }, [dispatch]));

  if (!started) return null;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const remaining = timeLimit ? Math.max(0, timeLimit - time) : undefined;
  const isTimeCritical = !!timeLimit && remaining! < 30;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-effect rounded-xl p-4 mb-4"
    >
      <div className="grid grid-cols-5 gap-2 text-white">
        <Stat
          icon={<Target size={20} />}
          label="Moves"
          value={moves}
          subValue={DIFFICULTIES[difficulty].maxMoves || '∞'}
        />
        <Stat
          icon={<Timer size={20} />}
          label="Time"
          value={timeLimit ? formatTime(remaining!) : formatTime(time)}
          danger={isTimeCritical}
        />
        <Stat
          icon={<Trophy size={20} />}
          label="Score"
          value={score}
        />
        <Stat
          icon={<Settings size={20} />}
          label="Level"
          value={difficulty.toUpperCase()}
        />
        <button
          onClick={() => dispatch({ type: 'PAUSE', paused: !paused })}
          className="flex flex-col items-center justify-center hover:bg-white/10 rounded-lg transition-colors p-2"
        >
          {paused ? <Play size={20} /> : <Pause size={20} />}
          <span className="text-xs mt-1 opacity-60">
            {paused ? 'Resume' : 'Pause'}
          </span>
        </button>
      </div>
    </motion.div>
  );
};

interface StatProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  subValue?: number | string;
  danger?: boolean;
}

const Stat: React.FC<StatProps> = ({ icon, label, value, subValue, danger }) => (
  <div className="flex flex-col items-center text-center">
    <div className={`${danger ? 'text-red-400 animate-pulse' : ''}`}>
      {icon}
    </div>
    <span className={`text-lg font-bold ${danger ? 'text-red-400' : ''}`}>
      {value}
      {subValue && (
        <span className="text-xs opacity-60 ml-1">/{subValue}</span>
      )}
    </span>
    <span className="text-xs opacity-60">{label}</span>
  </div>
);

export default Dashboard;