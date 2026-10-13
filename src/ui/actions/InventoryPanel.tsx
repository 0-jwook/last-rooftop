import { useGame } from '../../context/GameContext';
import { FACILITY_CATALOG } from '../../game/data/facilities';
import styles from './InventoryPanel.module.css';

export function InventoryPanel() {
  const { state, dispatch } = useGame();

  return (
    <div className={styles.panel}>
      <section>
        <h3 className={styles.sectionTitle}>보유 자원</h3>
        <ul className={styles.resourceList}>
          <li>
            <span>식량</span>
            <span>{state.inventory.food}</span>
          </li>
          <li>
            <span>식수</span>
            <span>{state.inventory.water}</span>
          </li>
          <li>
            <span>천</span>
            <span>{state.inventory.cloth}</span>
          </li>
          <li>
            <span>목재</span>
            <span>{state.inventory.wood}</span>
          </li>
          <li>
            <span>고철</span>
            <span>{state.inventory.scrap}</span>
          </li>
          <li>
            <span>씨앗</span>
            <span>{state.inventory.seeds}</span>
          </li>
          <li>
            <span>배터리</span>
            <span>{state.inventory.battery}</span>
          </li>
        </ul>
      </section>

      <section>
        <h3 className={styles.sectionTitle}>설치된 시설</h3>
        {state.facilities.length === 0 && <p className={styles.empty}>아직 설치한 시설이 없다.</p>}
        <ul className={styles.facilityList}>
          {state.facilities.map((facility) => {
            const def = FACILITY_CATALOG[facility.type];
            return (
              <li key={facility.id} className={styles.facilityItem}>
                <div>
                  <span className={styles.facilityName}>{def.name}</span>
                  {facility.state.kind === 'underConstruction' && (
                    <span className={styles.facilityMeta}>공사 중 (DAY {facility.state.completesOnDay}에 완성)</span>
                  )}
                  {facility.state.kind === 'garden' && (
                    <span className={styles.facilityMeta}>성장 단계 {facility.state.growthStage}/3</span>
                  )}
                </div>
                <div className={styles.facilityActions}>
                  {facility.state.kind === 'garden' && (
                    <button onClick={() => dispatch({ type: 'TEND_GARDEN', facilityId: facility.id })}>돌보기</button>
                  )}
                  <button onClick={() => dispatch({ type: 'DEMOLISH_FACILITY', facilityId: facility.id })}>철거</button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
