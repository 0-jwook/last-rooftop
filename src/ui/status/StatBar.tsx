import styles from './StatBar.module.css';

interface StatBarProps {
  label: string;
  value: number;
  tone: 'health' | 'warn';
}

export function StatBar({ label, value, tone }: StatBarProps) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={styles.row}>
      <div className={styles.labelRow}>
        <span>{label}</span>
        <span>{Math.round(pct)}</span>
      </div>
      <div className={styles.track}>
        <div
          className={`${styles.fill} ${tone === 'health' ? styles.health : styles.warn}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
