import React from 'react';
import { Info, X, Github, Globe } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';

const InfoPanel: React.FC = () => {
  const { state, dispatch } = useGame();
  const { showInfo } = state;

  return (
    <>
      {/* Info Button */}
      {!showInfo && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => dispatch({ type: 'SHOW_MODAL', modal: 'info' })}
          className="fixed bottom-4 right-4 p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
        >
          <Info size={24} className="text-white" />
        </motion.button>
      )}

      {/* Info Modal */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-end justify-end p-4 z-40"
            onClick={() => dispatch({ type: 'SHOW_MODAL', modal: null })}
          >
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">About Color Me Same</h3>
                <button
                  onClick={() => dispatch({ type: 'SHOW_MODAL', modal: null })}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4 text-sm text-gray-600">
                <p>
                  Color Me Same is a puzzle game where you transform a colorful grid 
                  into a single color through strategic moves.
                </p>
                
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Features</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Progressive difficulty levels</li>
                    <li>Special power tiles</li>
                    <li>Hint system for learning</li>
                    <li>Score tracking and achievements</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Technical</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Built with React + TypeScript</li>
                    <li>Cloudflare Workers backend</li>
                    <li>BFS solver for optimal solutions</li>
                    <li>Fully responsive design</li>
                  </ul>
                </div>
                
                <div className="flex gap-4 pt-4 border-t">
                  <a
                    href="https://github.com/yourusername/color-me-same"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
                  >
                    <Github size={16} />
                    <span>Source Code</span>
                  </a>
                  <a
                    href="https://franzai.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
                  >
                    <Globe size={16} />
                    <span>More Games</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default InfoPanel;