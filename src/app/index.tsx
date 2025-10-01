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

  const getPageStyle = (pageType: PageType) => {
    const isVisible = actualCurrentPage === pageType;
    return {
      display: isVisible ? 'block' : 'none',
      width: '100%',
      height: '100%',
    };
  };

  return (
    <>
      {loading && <LoadingScreen progress={loadingProgress} loadingText={loadingText} />}

      {!loading && (
        <div style={getPageStyle('game')}>
          <GamePage />
        </div>
      )}

      {!loading && (
        <div style={getPageStyle('profile')}>
          <ProfilePage />
        </div>
      )}

      {!loading && <BottomNavigation activeTab={getActiveTab()} onTabChange={handleTabChange} />}
    </>
  );
}

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}
