/**
 * @fileoverview Main Application Component for Color Me Same
 * 
 * This is the root component that sets up the entire game application.
 * It provides the game context to all child components and manages the
 * top-level layout and modal states.
 * 
 * Architecture:
 * - GameProvider: Wraps everything with game state context
 * - PageShell: Provides responsive layout container
 * - Component hierarchy organized by function (HUD, Board, Modals)
 * 
 * The app uses a centralized state management pattern where all game
 * state lives in the GameContext and components dispatch actions to
 * update it. This ensures predictable state updates and easy debugging.
 * 
 * @module App
 */

import React, { useState } from 'react';
import { GameProvider } from './context/GameContext';
import PageShell from './components/layout/PageShell';
import GameBoard from './components/board/GameBoard';
import Dashboard from './components/hud/Dashboard';
import PowerUps from './components/hud/PowerUps';
import ProgressBar from './components/hud/ProgressBar';
import ColorCycleInfo from './components/hud/ColorCycleInfo';
import VictoryModal from './components/modals/VictoryModal';
import TutorialModal from './components/modals/TutorialModal';
import AchievementModal from './components/modals/AchievementModal';
import StartScreen from './components/screens/StartScreen';
import { VersionInfo } from './components/VersionInfo';
import Header from './components/layout/Header';
import SaveGameLoader from './components/SaveGameLoader';
import { ToastProvider } from './context/ToastContext';

/**
 * Root Application Component
 * 
 * Renders the complete game UI with all necessary components:
 * - StartScreen: Initial game menu
 * - Dashboard: Stats display (timer, moves, score)
 * - PowerUps: Action buttons (undo, reset, hints)
 * - GameBoard: The main puzzle grid
 * - ColorCycleInfo: Shows color progression
 * - ProgressBar: Level and XP progress
 * - Modals: Victory, tutorial, and achievement popups
 * 
 * @component
 * @returns {JSX.Element} The complete game application
 */
const App: React.FC = () => {
  // Local state for achievement modal (not in game state as it's UI-only)
  const [achievementModal, setAchievementModal] = useState<{
    isOpen: boolean;
    achievements: string[];
  }>({ isOpen: false, achievements: [] });

  const showAchievements = (achievements: string[]) => {
    setAchievementModal({ isOpen: true, achievements });
  };

  const closeAchievements = () => {
    setAchievementModal({ isOpen: false, achievements: [] });
  };

  return (
    <GameProvider>
      <ToastProvider>
        <SaveGameLoader>
          <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
            <Header />
            <PageShell>
              <StartScreen />
              <Dashboard />
              <PowerUps />
              <GameBoard />
              <ColorCycleInfo />
              <ProgressBar />
              <TutorialModal />
              <VictoryModal onShowAchievements={showAchievements} />
              <AchievementModal
                isOpen={achievementModal.isOpen}
                achievements={achievementModal.achievements}
                onClose={closeAchievements}
              />
              <VersionInfo />
            </PageShell>
          </div>
        </SaveGameLoader>
      </ToastProvider>
    </GameProvider>
  );
};

export default App;