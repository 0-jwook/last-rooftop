import { AMBIENT_FLAVORS } from '../data/ambientFlavors';
import type { GameState } from '../state/types';
import { pushDiaryEntry } from './diary';
import { rollForEvent } from './events';
import { completeConstructions } from './facilities';
import { autoDrinkIfThirsty, autoEatIfHungry } from './survival';
import { advanceTime, applyNightRecovery, getTimeOfDay } from './time';

const AMBIENT_FLAVOR_CHANCE_PER_TICK = 0.015;

export function applyTick(state: GameState, minutes: number, rng: () => number = Math.random): GameState {
  if (minutes <= 0 || state.isGameOver || state.pendingEvent) return state;

  const prevDay = state.day;
  let next = advanceTime(state, minutes);
  next = applyNightRecovery(next, minutes);
  next = autoEatIfHungry(next);
  next = autoDrinkIfThirsty(next);

  if (next.day > prevDay) {
    next = completeConstructions(next);
    if (!next.pendingEvent) {
      const event = rollForEvent(next, rng);
      if (event) next = { ...next, pendingEvent: event };
    }
  }

  if (!next.isGameOver && !next.pendingEvent && rng() < AMBIENT_FLAVOR_CHANCE_PER_TICK) {
    const line = AMBIENT_FLAVORS[Math.floor(rng() * AMBIENT_FLAVORS.length)];
    next = pushDiaryEntry(next, getTimeOfDay(next.timeMinutes), line, 'ambient');
  }

  return next;
}
