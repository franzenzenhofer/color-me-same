import React, { useState } from 'react';
import { GameProvider } from './context/GameContext';
import PageShell from './components/layout/PageShell';
import GameBoard from './components/board/GameBoard';
import Dashboard from './components/hud/Dashboard';
import PowerUps from './components/hud/PowerUps';
import ProgressBar from './components/hud/ProgressBar';
import VictoryModal from './components/modals/VictoryModal';
import TutorialModal from './components/modals/TutorialModal';
import InfoPanel from './components/modals/InfoPanel';
import AchievementModal from './components/modals/AchievementModal';
import StartScreen from './components/screens/StartScreen';
import { VersionInfo } from './components/VersionInfo';

const App: React.FC = () => {
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
      <PageShell>
        <StartScreen />
        <ProgressBar />
        <Dashboard />
        <PowerUps />
        <GameBoard />
        <TutorialModal />
        <VictoryModal onShowAchievements={showAchievements} />
        <InfoPanel />
        <AchievementModal
          isOpen={achievementModal.isOpen}
          achievements={achievementModal.achievements}
          onClose={closeAchievements}
        />
        <VersionInfo />
      </PageShell>
    </GameProvider>
  );
};

export default App;