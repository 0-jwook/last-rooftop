import { useState } from 'react';
import { GameProvider } from './context/GameContext';
import { AppLayout } from './ui/layout/AppLayout';
import { LandingPage } from './ui/landing/LandingPage';

type View = 'landing' | 'game';

export default function App() {
  const [view, setView] = useState<View>('landing');

  if (view === 'landing') {
    return <LandingPage onStart={() => setView('game')} />;
  }

  return (
    <GameProvider>
      <AppLayout />
    </GameProvider>
  );
}
