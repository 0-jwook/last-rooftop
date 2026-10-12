import { useEffect, useRef, useState } from 'react';
import { useGame } from '../../context/GameContext';
import type { LastMessage } from '../../game/state/types';
import styles from './Toast.module.css';

export function Toast() {
  const { state } = useGame();
  const [visible, setVisible] = useState(false);
  const seenRef = useRef<LastMessage | null>(null);

  useEffect(() => {
    if (state.lastMessage && state.lastMessage !== seenRef.current) {
      seenRef.current = state.lastMessage;
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 3200);
      return () => clearTimeout(timer);
    }
  }, [state.lastMessage]);

  if (!visible || !state.lastMessage) return null;

  return (
    <div className={`${styles.toast} ${state.lastMessage.kind === 'error' ? styles.error : styles.success}`}>
      {state.lastMessage.text}
    </div>
  );
}
