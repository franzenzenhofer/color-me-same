import React, { useState } from 'react';
import { COLOR_PALETTE } from '../../constants/gameConfig';
import { Lock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface TileProps {
  value: number;
  power: boolean;
  locked: boolean;
  lockCount?: number;
  highlight: boolean;
  onClick: () => void;
  disabled?: boolean;
  row?: number;
  col?: number;
}

const Tile: React.FC<TileProps> = ({ 
  value, 
  power, 
  locked, 
  lockCount, 
  highlight, 
  onClick,
  disabled = false,
  row = 0,
  col = 0
}) => {
  const [isClicking, setIsClicking] = useState(false);
  
  const handleClick = () => {
    if (locked || disabled) return;
    setIsClicking(true);
    setTimeout(() => setIsClicking(false), 200);
    onClick();
  };

  const backgroundColor = COLOR_PALETTE[value] || COLOR_PALETTE[0];
  const colorName = ['Red', 'Green', 'Blue', 'Amber', 'Purple', 'Cyan', 'Orange', 'Pink'][value] || 'Unknown';

  return (
    <motion.button
      className={`
        relative w-full h-full rounded-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-white/50
        ${locked ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105 active:scale-95'}
        ${disabled ? 'cursor-not-allowed opacity-60' : ''}
        shadow-lg hover:shadow-xl
        ${isClicking ? 'scale-90' : ''}
        ${highlight ? '' : 'transform-gpu'}
      `}
      onClick={handleClick}
      disabled={locked || disabled}
      style={{ 
        backgroundColor,
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      }}
      aria-label={`${colorName} tile at row ${row + 1}, column ${col + 1}${locked ? ', locked' : ''}${power ? ', power tile' : ''}`}
      whileHover={!locked && !disabled && !highlight ? { scale: 1.05 } : {}}
      whileTap={!locked && !disabled ? { scale: 0.95 } : {}}
      animate={{
        scale: highlight ? 1.05 : 1,
        rotateY: isClicking ? 180 : 0,
        rotateZ: highlight ? [0, -5, 5, -5, 5, 0] : 0,
      }}
      transition={{
        scale: { duration: 0.2 },
        rotateY: { duration: 0.3, ease: "easeInOut" },
        rotateZ: { 
          duration: 0.6, 
          ease: "easeInOut",
          repeat: highlight ? Infinity : 0,
          repeatDelay: 2
        }
      }}
    >
      {/* Glossy effect */}
      <div className="absolute inset-1 bg-gradient-to-br from-white/30 to-transparent rounded-md pointer-events-none" />
      
      {/* Highlight effect with yellow dashed border */}
      {highlight && (
        <>
          <motion.div
            className="absolute -inset-1 rounded-lg pointer-events-none border-2 border-dashed border-yellow-400"
            style={{
              borderWidth: '3px',
              borderRadius: '12px',
            }}
            animate={{
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute inset-0 rounded-lg pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${backgroundColor}40 0%, transparent 70%)`,
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </>
      )}

      {locked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg backdrop-blur-sm">
          <Lock size={16} className="text-white drop-shadow-lg" />
          {lockCount && lockCount > 0 && (
            <span className="absolute -top-1 -right-1 text-xs font-bold text-white bg-red-500 rounded-full w-5 h-5 flex items-center justify-center shadow-lg animate-bounce">
              {lockCount}
            </span>
          )}
        </div>
      )}
      
      {power && (
        <motion.div 
          className="absolute top-1 right-1 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full p-1 shadow-lg"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Sparkles size={10} className="text-yellow-900" fill="currentColor" />
        </motion.div>
      )}

      {/* Click ripple effect */}
      {isClicking && (
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{
            background: `radial-gradient(circle, white 0%, transparent 70%)`,
          }}
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      )}
    </motion.button>
  );
};

export default React.memo(Tile);