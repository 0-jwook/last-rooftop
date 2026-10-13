import { clamp } from '../domain/util';
import { createInitialState } from '../state/initialState';
import type { DiaryEntry, FacilityInstance, GameState, Inventory, PendingEvent, SurvivalStats, Weather } from '../state/types';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function num(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function mergeStats(raw: unknown, fallback: SurvivalStats): SurvivalStats {
  if (!isObject(raw)) return fallback;
  return {
    health: clamp(num(raw.health, fallback.health), 0, 100),
    hunger: clamp(num(raw.hunger, fallback.hunger), 0, 100),
    thirst: clamp(num(raw.thirst, fallback.thirst), 0, 100),
    fatigue: clamp(num(raw.fatigue, fallback.fatigue), 0, 100),
  };
}

function mergeInventory(raw: unknown, fallback: Inventory): Inventory {
  if (!isObject(raw)) return fallback;
  const keys: (keyof Inventory)[] = ['food', 'water', 'cloth', 'wood', 'scrap', 'seeds', 'battery'];
  const result = { ...fallback };
  for (const key of keys) {
    result[key] = Math.max(0, Math.trunc(num(raw[key], fallback[key])));
  }
  return result;
}

function mergeFacilities(raw: unknown): FacilityInstance[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (f): f is FacilityInstance => isObject(f) && typeof f.id === 'string' && typeof f.type === 'string'
  );
}

function mergeDiary(raw: unknown): DiaryEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((d): d is DiaryEntry => isObject(d) && typeof d.id === 'string' && typeof d.text === 'string');
}

function mergePendingEvent(raw: unknown): PendingEvent | null {
  if (!isObject(raw)) return null;
  if (raw.type === 'explore_invite') {
    const locationChoices = Array.isArray(raw.locationChoices)
      ? raw.locationChoices.filter((id): id is string => typeof id === 'string')
      : [];
    return locationChoices.length > 0 ? { type: 'explore_invite', locationChoices } : null;
  }
  if (raw.type === 'survivor_visit') return { type: 'survivor_visit' };
  if (raw.type === 'zombie_disguise') return { type: 'zombie_disguise' };
  return null;
}

export function migrateSave(raw: unknown): GameState {
  const fallback = createInitialState();
  if (!isObject(raw)) return fallback;

  const payload = isObject(raw.state) ? raw.state : raw;

  const weather: Weather = payload.weather === 'cloudy' || payload.weather === 'rain' ? payload.weather : 'clear';

  return {
    saveVersion: fallback.saveVersion,
    day: Math.max(1, Math.trunc(num(payload.day, fallback.day))),
    timeMinutes: clamp(num(payload.timeMinutes, fallback.timeMinutes), 0, 1439),
    weather,
    stats: mergeStats(payload.stats, fallback.stats),
    inventory: mergeInventory(payload.inventory, fallback.inventory),
    facilities: mergeFacilities(payload.facilities),
    diary: mergeDiary(payload.diary),
    isGameOver: Boolean(payload.isGameOver),
    lastMessage: null,
    pendingEvent: mergePendingEvent(payload.pendingEvent),
  };
}
