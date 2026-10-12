import { useGame } from '../../context/GameContext';
import styles from './DiaryPanel.module.css';

export function DiaryPanel() {
  const { state } = useGame();
  const entries = [...state.diary].reverse();

  return (
    <div className={styles.panel}>
      {entries.length === 0 && <p className={styles.empty}>아직 쓴 일기가 없다.</p>}
      <ul className={styles.list}>
        {entries.map((entry) => (
          <li key={entry.id} className={styles.entry}>
            <div className={styles.meta}>DAY {entry.day}</div>
            <p className={styles.text}>{entry.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
