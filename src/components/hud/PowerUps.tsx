import React, { useState } from 'react';
import { Shuffle, Lock, RotateCcw, Lightbulb } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { motion } from 'framer-motion';

const PowerUps: React.FC = () => {
  const { state, dispatch } = useGame();
  const { started, won, paused, difficulty, hintsEnabled } = state;
  
  // Power-up states (these would be managed in context in full implementation)
  const [wildcardUsed, setWildcardUsed] = useState(false);
  const [freezeUsed, setFreezeUsed] = useState(false);
  
  // Easy mode gets unlimited resets, others get limited
  const isEasyMode = difficulty === 'easy';
  const [resetCount, setResetCount] = useState(isEasyMode ? -1 : 3); // -1 means unlimited

  if (!started) return null;

  const disabled = won || paused;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="grid grid-cols-4 gap-2 mb-4"
    >
      <PowerUpButton
        icon={<Shuffle size={20} />}
        label="Wildcard"
        disabled={wildcardUsed || disabled}
        onClick={() => {
          setWildcardUsed(true);
          // TODO: Implement wildcard logic
        }}
        tooltip="Randomize one tile"
      />
      
      <PowerUpButton
        icon={<Lock size={20} />}
        label="Freeze"
        disabled={freezeUsed || disabled}
        onClick={() => {
          setFreezeUsed(true);
          // TODO: Implement freeze logic
        }}
        tooltip="Stop timer for 30s"
      />
      
      <PowerUpButton
        icon={<RotateCcw size={20} />}
        label="Reset"
        count={resetCount === -1 ? undefined : resetCount}
        showUnlimited={resetCount === -1}
        disabled={resetCount === 0 || disabled}
        onClick={() => {
          if (resetCount !== -1) {
            setResetCount(resetCount - 1);
          }
          // Reload page to reset game (simple solution)
          window.location.reload();
        }}
        tooltip={isEasyMode ? "Reset puzzle (unlimited)" : `Reset puzzle (${resetCount} left)`}
      />
      
      <PowerUpButton
        icon={<Lightbulb size={20} />}
        label="Hint"
        active={hintsEnabled}
        showUnlimited={isEasyMode}
        disabled={disabled}
        onClick={() => {
          dispatch({ type: 'TOGGLE_HINTS' });
        }}
        tooltip={isEasyMode ? "Show hints (unlimited)" : "Show next move"}
      />
    </motion.div>
  );
};

interface PowerUpButtonProps {
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
  active?: boolean;
  count?: number;
  showUnlimited?: boolean;
  onClick: () => void;
  tooltip: string;
}

const PowerUpButton: React.FC<PowerUpButtonProps> = ({
  icon,
  label,
  disabled,
  active,
  count,
  showUnlimited,
  onClick,
  tooltip
}) => (
  <motion.button
    whileHover={{ scale: disabled ? 1 : 1.05 }}
    whileTap={{ scale: disabled ? 1 : 0.95 }}
    disabled={disabled}
    onClick={onClick}
    className={`
      relative p-3 rounded-lg flex flex-col items-center gap-1 transition-all
      ${active ? 'bg-green-500 text-white' : 'bg-white/10 backdrop-blur-sm text-white'}
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/20'}
    `}
    title={tooltip}
  >
    {icon}
    <span className="text-xs font-medium">{label}</span>
    {showUnlimited && (
      <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
        ∞
      </span>
    )}
    {count !== undefined && count > 0 && !showUnlimited && (
      <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
        {count}
      </span>
    )}
  </motion.button>
);

export default PowerUps;