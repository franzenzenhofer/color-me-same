import React from 'react';
import { Home } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { motion } from 'framer-motion';

const Header: React.FC = () => {
  const { state } = useGame();

  const handleHomeClick = () => {
    // Reset the game state to go back to start screen
    if (state.started) {
      window.location.reload();
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-sm"
    >
      <div className="max-w-screen-xl mx-auto px-4 py-1">
        <div className="flex items-center justify-between">
          <button
            onClick={handleHomeClick}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors group"
          >
            <Home size={16} className="group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Color Me Same</span>
          </button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;