import styles from './bottom_navigation.module.css';
import { FaHome, FaUser, FaGift, FaShoppingCart } from 'react-icons/fa';

type NavItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
};

type Props = {
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
};

export default function BottomNavigation({ activeTab = 'home', onTabChange }: Props) {
  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Главная',
      icon: FaHome,
      onClick: () => onTabChange?.('home'),
    },
    {
      id: 'profile',
      label: 'Профиль',
      icon: FaUser,
      onClick: () => onTabChange?.('profile'),
    },
    {
      id: 'rewards',
      label: 'Призы',
      icon: FaGift,
      onClick: () => onTabChange?.('rewards'),
    },
    {
      id: 'shop',
      label: 'Лавка',
      icon: FaShoppingCart,
      onClick: () => onTabChange?.('shop'),
    },
  ];

  return (
    <nav className={styles.bottomNavigation}>
      {navItems.map((item) => (
        <button
          key={item.id}
          className={`${styles.navButton} ${activeTab === item.id ? styles.active : ''}`}
          onClick={item.onClick}
          aria-label={item.label}
          data-tab={item.id}
        >
          <span className={styles.icon}>
            <item.icon />
          </span>
          <span className={styles.label}>{item.label}</span>
          {activeTab === item.id && <span className={styles.activeIndicator} />}
        </button>
      ))}
    </nav>
  );
}
