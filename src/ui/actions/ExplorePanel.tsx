import { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { EVENTS_BY_ID } from '../../game/data/events';
import { LOCATIONS } from '../../game/data/locations';
import { isLocationUnlocked, pickEvent } from '../../game/domain/exploration';
import styles from './ExplorePanel.module.css';

interface Visiting {
  locationId: string;
  eventId: string;
}

export function ExplorePanel() {
  const { state, dispatch } = useGame();
  const [visiting, setVisiting] = useState<Visiting | null>(null);

  function visit(locationId: string) {
    const eventId = pickEvent(state, locationId);
    if (!eventId) return;
    setVisiting({ locationId, eventId });
  }

  function choose(choiceId: string) {
    if (!visiting) return;
    dispatch({ type: 'EXPLORE', locationId: visiting.locationId, eventId: visiting.eventId, choiceId });
    setVisiting(null);
  }

  if (visiting) {
    const event = EVENTS_BY_ID[visiting.eventId];
    return (
      <div className={styles.panel}>
        <p className={styles.flavor}>{event.flavorText}</p>
        <div className={styles.choices}>
          {event.choices.map((choice) => (
            <button key={choice.id} className={styles.choiceButton} onClick={() => choose(choice.id)}>
              {choice.label}
            </button>
          ))}
        </div>
        <button className={styles.cancel} onClick={() => setVisiting(null)}>
          돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      {LOCATIONS.map((location) => {
        const unlocked = isLocationUnlocked(state, location.id);
        return (
          <button
            key={location.id}
            className={styles.locationButton}
            disabled={!unlocked}
            onClick={() => visit(location.id)}
          >
            <span className={styles.locationName}>{location.name}</span>
            <span className={styles.locationDesc}>{unlocked ? location.description : '아직 알 수 없는 장소다.'}</span>
          </button>
        );
      })}
    </div>
  );
}
