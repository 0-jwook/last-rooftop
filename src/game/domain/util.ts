import type { GameState, Inventory } from '../state/types';

export type DomainResult =
  | { ok: true; state: GameState; message: string }
  | { ok: false; state: GameState; reason: string };

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function applyDelta(inventory: Inventory, delta: Partial<Inventory>): Inventory {
  const next = { ...inventory };
  for (const key of Object.keys(delta) as (keyof Inventory)[]) {
    const amount = delta[key] ?? 0;
    next[key] = Math.max(0, Math.trunc(next[key] + amount));
  }
  return next;
}
