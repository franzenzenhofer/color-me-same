import React from 'react';
import { Home } from 'lucide-react';
import { useGame } from '../../context/GameContext';

const Header: React.FC = () => {
  const { state } = useGame();

  const handleHomeClick = () => {
    // Reset the game state to go back to start screen
    if (state.started) {
      window.location.reload();
    }
  };

  return (
    <header className="bg-black/20 backdrop-blur-sm">
      <div className="max-w-screen-xl mx-auto px-4 py-2">
        <button
          onClick={handleHomeClick}
          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors group"
        >
          <Home size={16} className="group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">Color Me Same</span>
        </button>
      </div>
    </header>
  );
};

export default Header;