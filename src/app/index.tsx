import { GamePage, LoadingScreen } from '@/pages';
import type { PageType } from '../shared/types';
import { GameProvider } from '@/entities/game/game_context.tsx';
import { useGameContext } from '@/entities/game/use_game_context';

function AppContent() {
  const { loading, loadingProgress, loadingText } = useGameContext();

  const getCurrentPage = (): PageType => {
    if (loading) return 'loading';
    return 'game';
  };

  const currentPage = getCurrentPage();

  const renderPage = () => {
    switch (currentPage) {
      case 'loading':
        return <LoadingScreen progress={loadingProgress} loadingText={loadingText} />;
      case 'game':
        return <GamePage />;

      default:
        return <GamePage />;
    }
  };

  return renderPage();
}

// Главный App компонент с провайдером контекста
export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}
