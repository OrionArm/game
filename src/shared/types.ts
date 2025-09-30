export type PageType = 'loading' | 'game' | 'menu' | 'settings' | 'profile';

export interface AppState {
  currentPage: PageType;
  isLoading: boolean;
  loadingProgress: number;
  loadingText: string;
}
