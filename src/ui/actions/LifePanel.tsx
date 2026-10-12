import { useGame } from '../../context/GameContext';
import styles from './LifePanel.module.css';

export function LifePanel() {
  const { state, dispatch } = useGame();

  return (
    <div className={styles.panel}>
      <button className={styles.action} disabled={state.inventory.food <= 0} onClick={() => dispatch({ type: 'EAT' })}>
        음식 먹기
      </button>
      <button
        className={styles.action}
        disabled={state.inventory.water <= 0}
        onClick={() => dispatch({ type: 'DRINK' })}
      >
        물 마시기
      </button>
      <button className={styles.action} onClick={() => dispatch({ type: 'REST_IDLE', minutes: 60 })}>
        짧은 휴식
      </button>
      <button className={styles.action} onClick={() => dispatch({ type: 'SLEEP' })}>
        잠자기
      </button>
      <button className={styles.action} onClick={() => dispatch({ type: 'CLEAN_ROOFTOP' })}>
        옥상 정리
      </button>
      <button className={styles.action} onClick={() => dispatch({ type: 'REST_IDLE', minutes: 120 })}>
        시간 보내기
      </button>
    </div>
  );
}
