import type { GameState } from '../state/types';
import { deductResources } from './inventory';
import { clamp } from './util';

const EAT_HUNGER_THRESHOLD = 70;
const EAT_HUNGER_RELIEF = 35;
const DRINK_THIRST_THRESHOLD = 70;
const DRINK_THIRST_RELIEF = 35;

export function autoEatIfHungry(state: GameState): GameState {
  if (state.stats.hunger < EAT_HUNGER_THRESHOLD || state.inventory.food <= 0) return state;
  return {
    ...state,
    inventory: deductResources(state.inventory, { food: 1 }),
    stats: { ...state.stats, hunger: clamp(state.stats.hunger - EAT_HUNGER_RELIEF, 0, 100) },
  };
}

export function autoDrinkIfThirsty(state: GameState): GameState {
  if (state.stats.thirst < DRINK_THIRST_THRESHOLD || state.inventory.water <= 0) return state;
  return {
    ...state,
    inventory: deductResources(state.inventory, { water: 1 }),
    stats: { ...state.stats, thirst: clamp(state.stats.thirst - DRINK_THIRST_RELIEF, 0, 100) },
  };
}
