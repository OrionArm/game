import { GamePage, LoadingScreen, ProfilePage } from '@/pages';
import BottomNavigation from '@/features/bottom_navigation';
import type { PageType } from '../shared/types';
import { GameProvider } from '@/entities/game/game_context.tsx';
import { useGameContext } from '@/entities/game/use_game_context';
import { useState } from 'react';

function AppContent() {
  const { loading, loadingProgress, loadingText } = useGameContext();
  const [currentPage, setCurrentPage] = useState<PageType>('loading');

  const getCurrentPage = (): PageType => {
    if (loading) return 'loading';
    return currentPage === 'loading' ? 'game' : currentPage;
  };

  const actualCurrentPage = getCurrentPage();

  const handleTabChange = (tabId: string) => {
    if (tabId === 'profile') {
      setCurrentPage('profile');
    } else if (tabId === 'home') {
      setCurrentPage('game');
    }
  };

  const getActiveTab = (): string => {
    if (actualCurrentPage === 'profile') return 'profile';
    if (actualCurrentPage === 'game') return 'home';
    return 'home';
  };

  const renderPage = () => {
    switch (actualCurrentPage) {
      case 'loading':
        return <LoadingScreen progress={loadingProgress} loadingText={loadingText} />;
      case 'game':
        return <GamePage />;
      case 'profile':
        return <ProfilePage />;

      default:
        return <GamePage />;
    }
  };

  return (
    <>
      {renderPage()}
      {!loading && <BottomNavigation activeTab={getActiveTab()} onTabChange={handleTabChange} />}
    </>
  );
}

// Главный App компонент с провайдером контекста
export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}
