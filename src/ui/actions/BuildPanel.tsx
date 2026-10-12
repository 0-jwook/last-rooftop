import { useGame } from '../../context/GameContext';
import { FACILITY_CATALOG } from '../../game/data/facilities';
import { canPlaceFacility } from '../../game/domain/facilities';
import { canAfford } from '../../game/domain/inventory';
import type { FacilityType, GridPosition, Inventory } from '../../game/state/types';
import styles from './BuildPanel.module.css';

export interface BuildModeState {
  active: boolean;
  selectedType: FacilityType | null;
}

interface BuildPanelProps {
  buildMode: BuildModeState;
  onBuildModeChange: (next: BuildModeState) => void;
  hoveredCell: GridPosition | null;
}

const FACILITY_TYPES: FacilityType[] = ['tent', 'garden', 'rainCollector', 'solarPanel', 'lamp'];

const RESOURCE_LABELS: Record<keyof Inventory, string> = {
  food: '식량',
  water: '식수',
  cloth: '천',
  wood: '목재',
  scrap: '고철',
  seeds: '씨앗',
  battery: '배터리',
};

function formatCost(cost: Partial<Inventory>): string {
  return (Object.keys(cost) as (keyof Inventory)[]).map((key) => `${RESOURCE_LABELS[key]} ${cost[key]}`).join(', ');
}

export function BuildPanel({ buildMode, onBuildModeChange, hoveredCell }: BuildPanelProps) {
  const { state } = useGame();

  const placementCheck =
    buildMode.active && buildMode.selectedType && hoveredCell
      ? canPlaceFacility(state, buildMode.selectedType, hoveredCell)
      : null;
  const affordable = buildMode.selectedType ? canAfford(state.inventory, FACILITY_CATALOG[buildMode.selectedType].cost) : false;

  return (
    <div className={styles.panel}>
      <div className={styles.list}>
        {FACILITY_TYPES.map((type) => {
          const def = FACILITY_CATALOG[type];
          const selected = buildMode.selectedType === type;
          return (
            <button
              key={type}
              className={`${styles.item} ${selected ? styles.itemSelected : ''}`}
              onClick={() => onBuildModeChange({ active: true, selectedType: type })}
            >
              <span className={styles.itemName}>{def.name}</span>
              <span className={styles.itemCost}>{formatCost(def.cost)}</span>
            </button>
          );
        })}
      </div>

      {buildMode.active && buildMode.selectedType && (
        <div className={styles.placement}>
          <p className={styles.hint}>
            {!affordable
              ? '재료가 부족하다.'
              : placementCheck
                ? placementCheck.valid
                  ? '옥상에서 설치할 위치를 클릭하세요.'
                  : placementCheck.reason
                : '옥상 위에 커서를 올려 위치를 확인하세요.'}
          </p>
          <button className={styles.cancel} onClick={() => onBuildModeChange({ active: false, selectedType: null })}>
            취소
          </button>
        </div>
      )}
    </div>
  );
}
