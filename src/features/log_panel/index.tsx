import { useEffect, useState, useRef } from 'react';
import styles from './log_panel.module.css';

type Props = {
  lines: string[];
};
const AUTO_HIDE_DELAY = 10000;
const ANIMATION_DURATION = 2000;

export default function LogPanel({ lines }: Props) {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isHoveredRef = useRef(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lines.length > 0) {
      // Показываем панель при новых логах
      setIsVisible(true);
      setIsFading(false);

      // Автоскролл к последнему сообщению
      if (logRef.current) {
        logRef.current.scrollTop = logRef.current.scrollHeight;
      }

      // Очищаем предыдущий таймер
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Устанавливаем таймер для затухания всей панели через 5 секунд
      timerRef.current = setTimeout(() => {
        if (!isHoveredRef.current) {
          setIsFading(true);

          // Скрываем панель после анимации
          setTimeout(() => {
            setIsVisible(false);
            setIsFading(false);
          }, ANIMATION_DURATION);
        }
      }, AUTO_HIDE_DELAY);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [lines]);

  const handleMouseEnter = () => {
    isHoveredRef.current = true;
    // Очищаем таймер при наведении
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsFading(false);
  };

  const handleMouseLeave = () => {
    isHoveredRef.current = false;
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      ref={logRef}
      className={`${styles.log} ${lines.length > 3 ? styles.logFade : ''} ${isFading ? styles.fadeOut : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {lines.map((line, i) => (
        <div className={styles.logLine} key={`${line}-${i}`}>
          {line}
        </div>
      ))}
    </div>
  );
}
