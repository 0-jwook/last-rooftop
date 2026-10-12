import type { GameState } from '../state/types';
import { deductResources } from './inventory';
import { advanceTime } from './time';
import { clamp, type DomainResult } from './util';

const EAT_HUNGER_RELIEF = 35;
const EAT_TIME_MINUTES = 10;
const DRINK_THIRST_RELIEF = 35;
const DRINK_TIME_MINUTES = 5;

export function eatFood(state: GameState): DomainResult {
  if (state.inventory.food <= 0) {
    return { ok: false, state, reason: '먹을 음식이 없다.' };
  }
  const advanced = advanceTime(state, EAT_TIME_MINUTES);
  const nextState: GameState = {
    ...advanced,
    inventory: deductResources(advanced.inventory, { food: 1 }),
    stats: { ...advanced.stats, hunger: clamp(advanced.stats.hunger - EAT_HUNGER_RELIEF, 0, 100) },
  };
  return { ok: true, state: nextState, message: '음식을 먹었다.' };
}

export function drinkWater(state: GameState): DomainResult {
  if (state.inventory.water <= 0) {
    return { ok: false, state, reason: '마실 물이 없다.' };
  }
  const advanced = advanceTime(state, DRINK_TIME_MINUTES);
  const nextState: GameState = {
    ...advanced,
    inventory: deductResources(advanced.inventory, { water: 1 }),
    stats: { ...advanced.stats, thirst: clamp(advanced.stats.thirst - DRINK_THIRST_RELIEF, 0, 100) },
  };
  return { ok: true, state: nextState, message: '물을 마셨다.' };
}
