import React from 'react';
import { GameProvider } from './context/GameContext';
import PageShell from './components/layout/PageShell';
import GameBoard from './components/board/GameBoard';
import Dashboard from './components/hud/Dashboard';
import PowerUps from './components/hud/PowerUps';
import VictoryModal from './components/modals/VictoryModal';
import TutorialModal from './components/modals/TutorialModal';
import InfoPanel from './components/modals/InfoPanel';
import StartScreen from './components/screens/StartScreen';
import { VersionInfo } from './components/VersionInfo';

const App: React.FC = () => {
  return (
    <GameProvider>
      <PageShell>
        <StartScreen />
        <Dashboard />
        <PowerUps />
        <GameBoard />
        <TutorialModal />
        <VictoryModal />
        <InfoPanel />
        <VersionInfo />
      </PageShell>
    </GameProvider>
  );
};

export default App;