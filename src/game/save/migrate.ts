import { clamp } from '../domain/util';
import { createInitialState } from '../state/initialState';
import type {
  DiaryEntry,
  FacilityInstance,
  GameState,
  Inventory,
  LocationProgress,
  SurvivalStats,
  Weather,
} from '../state/types';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function num(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function str(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
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

function mergeLocations(raw: unknown): Record<string, LocationProgress> {
  if (!isObject(raw)) return {};
  const result: Record<string, LocationProgress> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (!isObject(value)) continue;
    result[key] = {
      locationId: str(value.locationId, key),
      unlocked: Boolean(value.unlocked),
      visitCount: Math.max(0, Math.trunc(num(value.visitCount, 0))),
      completedEventIds: Array.isArray(value.completedEventIds)
        ? value.completedEventIds.filter((id): id is string => typeof id === 'string')
        : [],
    };
  }
  return result;
}

function mergeDiary(raw: unknown): DiaryEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((d): d is DiaryEntry => isObject(d) && typeof d.id === 'string' && typeof d.text === 'string');
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
    locations: mergeLocations(payload.locations),
    diary: mergeDiary(payload.diary),
    isGameOver: Boolean(payload.isGameOver),
    lastMessage: null,
  };
}
