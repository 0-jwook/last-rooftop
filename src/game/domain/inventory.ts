import type { Inventory } from '../state/types';
import { applyDelta } from './util';

export function canAfford(inventory: Inventory, cost: Partial<Inventory>): boolean {
  return (Object.keys(cost) as (keyof Inventory)[]).every(
    (key) => inventory[key] >= (cost[key] ?? 0)
  );
}

export function deductResources(inventory: Inventory, cost: Partial<Inventory>): Inventory {
  const negated: Partial<Inventory> = {};
  for (const key of Object.keys(cost) as (keyof Inventory)[]) {
    negated[key] = -(cost[key] ?? 0);
  }
  return applyDelta(inventory, negated);
}

export function addResources(inventory: Inventory, gain: Partial<Inventory>): Inventory {
  return applyDelta(inventory, gain);
}
