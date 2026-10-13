import { useState } from 'react';
import type { FacilityType, GridPosition } from '../../game/state/types';
import styles from './ActionPanel.module.css';
import { BuildPanel, type BuildModeState } from './BuildPanel';
import { DiaryPanel } from './DiaryPanel';
import { InventoryPanel } from './InventoryPanel';

type Tab = 'build' | 'inventory' | 'diary';

interface ActionPanelProps {
  buildMode: BuildModeState;
  onBuildModeChange: (next: BuildModeState) => void;
  hoveredCell: GridPosition | null;
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'build', label: '건설' },
  { id: 'inventory', label: '물자' },
  { id: 'diary', label: '일기' },
];

export function ActionPanel({ buildMode, onBuildModeChange, hoveredCell }: ActionPanelProps) {
  const [tab, setTab] = useState<Tab>('build');

  function selectTab(next: Tab) {
    setTab(next);
    if (next !== 'build' && buildMode.active) {
      onBuildModeChange({ active: false, selectedType: null as FacilityType | null });
    }
  }

  return (
    <div className={styles.panel}>
      <nav className={styles.tabs}>
        {TABS.map((item) => (
          <button
            key={item.id}
            className={`${styles.tab} ${tab === item.id ? styles.tabActive : ''}`}
            onClick={() => selectTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <div className={styles.content}>
        {tab === 'build' && (
          <BuildPanel buildMode={buildMode} onBuildModeChange={onBuildModeChange} hoveredCell={hoveredCell} />
        )}
        {tab === 'inventory' && <InventoryPanel />}
        {tab === 'diary' && <DiaryPanel />}
      </div>
    </div>
  );
}
