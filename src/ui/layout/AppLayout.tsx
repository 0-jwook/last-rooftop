import { useState } from 'react';
import { useGame } from '../../context/GameContext';
import type { GridPosition } from '../../game/state/types';
import { WorldCanvas } from '../../render/WorldCanvas';
import { buildWorldSnapshot, type BuildModeUiState } from '../../render/viewModel';
import { ActionPanel } from '../actions/ActionPanel';
import type { BuildModeState } from '../actions/BuildPanel';
import { Toast } from '../common/Toast';
import { EventModal } from '../events/EventModal';
import { StatusPanel } from '../status/StatusPanel';
import styles from './AppLayout.module.css';

export function AppLayout() {
  const { state, dispatch } = useGame();
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [buildMode, setBuildMode] = useState<BuildModeState>({ active: false, selectedType: null });
  const [hoveredCell, setHoveredCell] = useState<GridPosition | null>(null);

  const buildModeUi: BuildModeUiState | null = buildMode.active
    ? { active: true, selectedType: buildMode.selectedType, hoveredCell }
    : null;
  const snapshot = buildWorldSnapshot(state, buildModeUi);

  function handleCellClick(cell: GridPosition) {
    if (!buildMode.active || !buildMode.selectedType) return;
    dispatch({ type: 'BUILD_FACILITY', facilityType: buildMode.selectedType, position: cell });
  }

  return (
    <div className={styles.layout}>
      <button className={styles.drawerToggleLeft} onClick={() => setLeftOpen((v) => !v)}>
        상태
      </button>
      <button className={styles.drawerToggleRight} onClick={() => setRightOpen((v) => !v)}>
        행동
      </button>

      <aside className={`${styles.left} ${leftOpen ? styles.open : ''}`}>
        <StatusPanel />
      </aside>

      <main className={styles.center}>
        <div className={styles.canvasWrap}>
          <WorldCanvas
            snapshot={snapshot}
            onCellHover={setHoveredCell}
            onCellLeave={() => setHoveredCell(null)}
            onCellClick={handleCellClick}
          />
          <Toast />
        </div>
      </main>

      <aside className={`${styles.right} ${rightOpen ? styles.open : ''}`}>
        <ActionPanel buildMode={buildMode} onBuildModeChange={setBuildMode} hoveredCell={hoveredCell} />
      </aside>

      <EventModal />
    </div>
  );
}
