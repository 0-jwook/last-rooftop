import { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { getTimeOfDay } from '../../game/domain/time';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { StatBar } from './StatBar';
import styles from './StatusPanel.module.css';

const WEATHER_LABEL: Record<string, string> = { clear: '맑음', cloudy: '흐림', rain: '비' };
const TIME_LABEL: Record<string, string> = { dawn: '새벽', day: '낮', sunset: '노을', night: '밤' };

function formatClock(minutes: number): string {
  const hour = Math.floor(minutes / 60) % 24;
  const minute = Math.floor(minutes % 60);
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function StatusPanel() {
  const { state, dispatch } = useGame();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const timeOfDay = getTimeOfDay(state.timeMinutes);

  return (
    <div className={styles.panel}>
      <div>
        <div className={styles.header}>
          <span className={styles.day}>DAY {state.day}</span>
          <span className={styles.clock}>{formatClock(state.timeMinutes)}</span>
        </div>
        <div className={styles.meta}>
          <span>{TIME_LABEL[timeOfDay]}</span>
          <span>{WEATHER_LABEL[state.weather]}</span>
        </div>
      </div>

      <div className={styles.stats}>
        <StatBar label="체력" value={state.stats.health} tone="health" />
        <StatBar label="허기" value={state.stats.hunger} tone="warn" />
        <StatBar label="갈증" value={state.stats.thirst} tone="warn" />
        <StatBar label="피로" value={state.stats.fatigue} tone="warn" />
      </div>

      <div className={styles.resources}>
        <div className={styles.resourceRow}>
          <span>식량</span>
          <span>{state.inventory.food}</span>
        </div>
        <div className={styles.resourceRow}>
          <span>식수</span>
          <span>{state.inventory.water}</span>
        </div>
        <div className={styles.resourceRow}>
          <span>천</span>
          <span>{state.inventory.cloth}</span>
        </div>
        <div className={styles.resourceRow}>
          <span>목재</span>
          <span>{state.inventory.wood}</span>
        </div>
        <div className={styles.resourceRow}>
          <span>고철</span>
          <span>{state.inventory.scrap}</span>
        </div>
        <div className={styles.resourceRow}>
          <span>씨앗</span>
          <span>{state.inventory.seeds}</span>
        </div>
        <div className={styles.resourceRow}>
          <span>배터리</span>
          <span>{state.inventory.battery}</span>
        </div>
      </div>

      {state.isGameOver && <div className={styles.gameOver}>체력이 다했다... 새 게임을 시작해야 한다.</div>}

      <div className={styles.footer}>
        <button className={styles.resetButton} onClick={() => setConfirmOpen(true)}>
          새 게임 시작
        </button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="새 게임을 시작할까요?"
        message="현재 진행 상황이 모두 사라지고 처음부터 다시 시작합니다."
        onConfirm={() => {
          dispatch({ type: 'NEW_GAME' });
          setConfirmOpen(false);
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
