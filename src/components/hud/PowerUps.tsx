import React, { useState } from 'react';
import { Shuffle, Lock, RotateCcw, Lightbulb } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { motion } from 'framer-motion';

const PowerUps: React.FC = () => {
  const { state } = useGame();
  const { started, won, paused } = state;
  
  // Power-up states (these would be managed in context in full implementation)
  const [wildcardUsed, setWildcardUsed] = useState(false);
  const [freezeUsed, setFreezeUsed] = useState(false);
  const [resetCount, setResetCount] = useState(1);
  const [hintEnabled, setHintEnabled] = useState(false);

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
        count={resetCount}
        disabled={!resetCount || disabled}
        onClick={() => {
          setResetCount(0);
          // TODO: Implement reset logic
        }}
        tooltip="Reset to start"
      />
      
      <PowerUpButton
        icon={<Lightbulb size={20} />}
        label="Hint"
        active={hintEnabled}
        disabled={disabled}
        onClick={() => {
          setHintEnabled(!hintEnabled);
          // Hint is handled by GameBoard component
        }}
        tooltip="Show next move"
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
  onClick: () => void;
  tooltip: string;
}

const PowerUpButton: React.FC<PowerUpButtonProps> = ({
  icon,
  label,
  disabled,
  active,
  count,
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
    {count !== undefined && count > 0 && (
      <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
        {count}
      </span>
    )}
  </motion.button>
);

export default PowerUps;