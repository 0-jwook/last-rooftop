import { GameProvider } from './context/GameContext';
import { AppLayout } from './ui/layout/AppLayout';

export default function App() {
  return (
    <GameProvider>
      <AppLayout />
    </GameProvider>
  );
}
