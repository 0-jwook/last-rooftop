import { useGame } from '../../context/GameContext';
import { LOCATION_POOL } from '../../game/data/locationPool';
import styles from './EventModal.module.css';

export function EventModal() {
  const { state, dispatch } = useGame();
  const event = state.pendingEvent;
  if (!event) return null;

  if (event.type === 'explore_invite') {
    const locations = event.locationChoices
      .map((id) => LOCATION_POOL.find((location) => location.id === id))
      .filter((location): location is NonNullable<typeof location> => Boolean(location));

    return (
      <div className={styles.overlay}>
        <div className={styles.dialog}>
          <h3 className={styles.title}>탐사 제안</h3>
          <p className={styles.message}>밖으로 나가볼 기회가 생겼다. 어디로 가볼까?</p>
          <div className={styles.choices}>
            {locations.map((location) => (
              <button
                key={location.id}
                className={styles.choice}
                onClick={() => dispatch({ type: 'RESOLVE_EXPLORE_CHOICE', locationId: location.id })}
              >
                {location.name}
              </button>
            ))}
          </div>
          <button className={styles.skip} onClick={() => dispatch({ type: 'DECLINE_EXPLORE_INVITE' })}>
            나가지 않는다
          </button>
        </div>
      </div>
    );
  }

  if (event.type === 'survivor_visit') {
    return (
      <div className={styles.overlay}>
        <div className={styles.dialog}>
          <h3 className={styles.title}>낯선 방문자</h3>
          <p className={styles.message}>
            누군가 옥상 아래에서 들여보내 달라고 외친다. 같이 지내고 싶다는 생존자인 듯하다.
          </p>
          <div className={styles.actions}>
            <button
              className={styles.primary}
              onClick={() => dispatch({ type: 'RESOLVE_SURVIVOR_VISIT', accept: true })}
            >
              받아들인다
            </button>
            <button
              className={styles.secondary}
              onClick={() => dispatch({ type: 'RESOLVE_SURVIVOR_VISIT', accept: false })}
            >
              거절한다
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <h3 className={styles.title}>수상한 방문자</h3>
        <p className={styles.message}>문밖의 누군가가 사람이라며 들여보내 달라 한다. 어딘가 행동이 이상하다.</p>
        <div className={styles.actions}>
          <button className={styles.primary} onClick={() => dispatch({ type: 'RESOLVE_ZOMBIE_DISGUISE', letIn: true })}>
            들인다
          </button>
          <button
            className={styles.secondary}
            onClick={() => dispatch({ type: 'RESOLVE_ZOMBIE_DISGUISE', letIn: false })}
          >
            쫓아낸다
          </button>
        </div>
      </div>
    </div>
  );
}
