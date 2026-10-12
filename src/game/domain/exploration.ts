import { EVENTS_BY_ID, resolveEvent } from '../data/events';
import { LOCATIONS } from '../data/locations';
import type { GameState, LocationProgress } from '../state/types';
import { pushDiaryEntry } from './diary';
import { addResources } from './inventory';
import { advanceTime, getTimeOfDay } from './time';
import { clamp, type DomainResult } from './util';

export function getLocationProgress(state: GameState, locationId: string): LocationProgress {
  return (
    state.locations[locationId] ?? {
      locationId,
      unlocked: false,
      visitCount: 0,
      completedEventIds: [],
    }
  );
}

export function isLocationUnlocked(state: GameState, locationId: string): boolean {
  const location = LOCATIONS.find((l) => l.id === locationId);
  return location ? location.unlockCondition(state) : false;
}

export function pickEvent(state: GameState, locationId: string, rng: () => number = Math.random): string | null {
  const location = LOCATIONS.find((l) => l.id === locationId);
  if (!location) return null;
  const progress = getLocationProgress(state, locationId);
  const unseen = location.eventIds.filter((id) => !progress.completedEventIds.includes(id));
  const pool = unseen.length > 0 ? unseen : location.eventIds;
  if (pool.length === 0) return null;
  return pool[Math.floor(rng() * pool.length)];
}

export function exploreLocation(
  state: GameState,
  locationId: string,
  eventId: string,
  choiceId: string,
  rng: () => number = Math.random
): DomainResult {
  if (!isLocationUnlocked(state, locationId)) {
    return { ok: false, state, reason: '아직 갈 수 없는 장소다.' };
  }
  const event = EVENTS_BY_ID[eventId];
  if (!event || event.locationId !== locationId) {
    return { ok: false, state, reason: '그런 사건을 찾을 수 없다.' };
  }
  const choice = event.choices.find((c) => c.id === choiceId);
  if (!choice) {
    return { ok: false, state, reason: '그런 선택지가 없다.' };
  }

  const outcome = resolveEvent(event, choiceId, rng);
  const advanced = advanceTime(state, choice.timeCost);

  const prevProgress = getLocationProgress(advanced, locationId);
  const nextProgress: LocationProgress = {
    locationId,
    unlocked: true,
    visitCount: prevProgress.visitCount + 1,
    completedEventIds: prevProgress.completedEventIds.includes(eventId)
      ? prevProgress.completedEventIds
      : [...prevProgress.completedEventIds, eventId],
  };

  const nextState: GameState = {
    ...advanced,
    inventory: addResources(advanced.inventory, outcome.resourceDelta),
    stats: { ...advanced.stats, fatigue: clamp(advanced.stats.fatigue + choice.fatigueCost, 0, 100) },
    locations: { ...advanced.locations, [locationId]: nextProgress },
  };

  const diaryText = choice.diaryHook ? choice.diaryHook(outcome.success ? 'success' : 'failure') : outcome.text;
  const withDiary = pushDiaryEntry(nextState, getTimeOfDay(nextState.timeMinutes), diaryText, 'explore');

  return { ok: true, state: withDiary, message: outcome.text };
}
