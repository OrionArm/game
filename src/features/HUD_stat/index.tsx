import { useEffect, useRef, useState } from 'react';
import styles from './HUD_stat.module.css';
import ValueChangeIndicator from './value_change_indicator';

type Props = {
  icon: string;
  label: string;
  value: number | string;
  align?: 'left' | 'right';
  className?: string;
};

export default function HUDStat({ icon, label, value, align = 'left', className }: Props) {
  const [previousValue, setPreviousValue] = useState<number | string>(value);
  const [animationClass, setAnimationClass] = useState<string>('');
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const alignClass = align === 'left' ? styles.left : styles.right;

  useEffect(() => {
    if (value !== previousValue) {
      // Очищаем предыдущий таймаут
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Определяем тип изменения
      const oldNum = typeof previousValue === 'number' ? previousValue : 0;
      const newNum = typeof value === 'number' ? value : 0;

      if (typeof value === 'number' && typeof previousValue === 'number') {
        if (newNum > oldNum) {
          setAnimationClass(styles.increase);
        } else if (newNum < oldNum) {
          setAnimationClass(styles.decrease);
        }
      } else {
        // Для строковых значений просто показываем общую анимацию изменения
        setAnimationClass(styles.change);
      }

      setIsAnimating(true);

      // Сбрасываем анимацию через 1 секунду
      timeoutRef.current = setTimeout(() => {
        setAnimationClass('');
        setIsAnimating(false);
        setPreviousValue(value);
      }, 1000);
    }
  }, [value, previousValue]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`${styles.item} ${alignClass} ${className ?? ''} ${animationClass}`}>
      <span className={styles.icon} aria-hidden>
        {icon}
      </span>
      <span className={`${styles.text} ${isAnimating ? styles.textAnimating : ''}`}>
        {label}: {value}
      </span>
      <ValueChangeIndicator value={value} previousValue={previousValue} isVisible={isAnimating} />
    </div>
  );
}
