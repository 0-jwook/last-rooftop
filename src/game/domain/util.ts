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

export function particleEulReul(word: string): '을' | '를' {
  const lastChar = word.charCodeAt(word.length - 1);
  if (lastChar < 0xac00 || lastChar > 0xd7a3) return '를';
  const hasBatchim = (lastChar - 0xac00) % 28 !== 0;
  return hasBatchim ? '을' : '를';
}

export function applyDelta(inventory: Inventory, delta: Partial<Inventory>): Inventory {
  const next = { ...inventory };
  for (const key of Object.keys(delta) as (keyof Inventory)[]) {
    const amount = delta[key] ?? 0;
    next[key] = Math.max(0, Math.trunc(next[key] + amount));
  }
  return next;
}
