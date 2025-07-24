import React from 'react';
import { COLOR_PALETTE } from '../../constants/gameConfig';
import { Lock, Zap } from 'lucide-react';

interface TileProps {
  value: number;
  power: boolean;
  locked: boolean;
  lockCount?: number;
  highlight: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const Tile: React.FC<TileProps> = ({ 
  value, 
  power, 
  locked, 
  lockCount, 
  highlight, 
  onClick,
  disabled = false 
}) => {
  return (
    <button
      className={`
        relative aspect-square rounded-lg transition-all duration-300
        ${highlight ? 'ring-4 ring-green-400 ring-offset-2 ring-offset-transparent scale-110 z-10' : ''}
        ${locked ? 'cursor-not-allowed opacity-80' : 'hover:scale-105 active:scale-95'}
        ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
        shadow-lg hover:shadow-xl
      `}
      onClick={onClick}
      disabled={locked || disabled}
      style={{ 
        backgroundColor: COLOR_PALETTE[value],
        transform: highlight ? 'scale(1.1)' : undefined
      }}
      aria-label={`Tile at position with color ${value}`}
    >
      {locked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
          <Lock size={20} className="text-white drop-shadow-lg" />
          {lockCount && lockCount > 0 && (
            <span className="absolute top-1 right-1 text-xs font-bold text-white bg-red-500 rounded-full w-5 h-5 flex items-center justify-center">
              {lockCount}
            </span>
          )}
        </div>
      )}
      {power && (
        <div className="absolute top-1 right-1 bg-yellow-400 rounded-full p-1 animate-pulse-soft">
          <Zap size={12} className="text-yellow-900" fill="currentColor" />
        </div>
      )}
    </button>
  );
};

export default React.memo(Tile);