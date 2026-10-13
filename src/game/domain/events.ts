import { EXPLORE_MISHAP_CHANCE, EXPLORE_MISHAP_FATIGUE, LOCATION_POOL } from '../data/locationPool';
import type { GameState, Inventory, PendingEvent } from '../state/types';
import { pushDiaryEntry } from './diary';
import { addResources } from './inventory';
import { getTimeOfDay } from './time';
import { clamp, type DomainResult } from './util';

const EVENT_TRIGGER_CHANCE = 0.65;
const EXPLORE_INVITE_CHOICE_COUNT = 3;
const SURVIVOR_ACCEPT_GOOD_CHANCE = 0.7;
const ZOMBIE_LET_IN_SAFE_CHANCE = 0.5;
const ZOMBIE_DAMAGE_HEALTH = 20;
const ZOMBIE_DAMAGE_FATIGUE = 15;

function pickRandom<T>(items: T[], rng: () => number): T {
  return items[Math.floor(rng() * items.length)];
}

function sampleDistinct<T>(items: T[], count: number, rng: () => number): T[] {
  const pool = [...items];
  const result: T[] = [];
  while (pool.length > 0 && result.length < count) {
    const index = Math.floor(rng() * pool.length);
    result.push(pool.splice(index, 1)[0]);
  }
  return result;
}

function randomInRange([min, max]: [number, number], rng: () => number): number {
  return Math.round(min + rng() * (max - min));
}

export function rollForEvent(state: GameState, rng: () => number = Math.random): PendingEvent | null {
  if (state.pendingEvent) return null;
  if (rng() > EVENT_TRIGGER_CHANCE) return null;

  const roll = rng();
  if (roll < 0.7) {
    const choices = sampleDistinct(LOCATION_POOL, EXPLORE_INVITE_CHOICE_COUNT, rng).map((l) => l.id);
    return { type: 'explore_invite', locationChoices: choices };
  }
  if (roll < 0.85) {
    return { type: 'survivor_visit' };
  }
  return { type: 'zombie_disguise' };
}

export function resolveExploreChoice(state: GameState, locationId: string, rng: () => number = Math.random): DomainResult {
  if (state.pendingEvent?.type !== 'explore_invite') {
    return { ok: false, state, reason: '지금은 탐사를 나갈 상황이 아니다.' };
  }
  const location = LOCATION_POOL.find((l) => l.id === locationId);
  if (!location) {
    return { ok: false, state, reason: '그런 장소를 알지 못한다.' };
  }

  const mishap = rng() < EXPLORE_MISHAP_CHANCE;
  const gain: Partial<Inventory> = {};
  if (!mishap) {
    for (const key of Object.keys(location.resourceWeights) as (keyof Inventory)[]) {
      const range = location.resourceWeights[key];
      if (range) gain[key] = randomInRange(range, rng);
    }
  }

  const nextState: GameState = {
    ...state,
    inventory: addResources(state.inventory, gain),
    stats: mishap
      ? { ...state.stats, fatigue: clamp(state.stats.fatigue + EXPLORE_MISHAP_FATIGUE, 0, 100) }
      : state.stats,
    pendingEvent: null,
  };

  const text = mishap ? pickRandom(location.mishapLines, rng) : pickRandom(location.flavorLines, rng);
  const withDiary = pushDiaryEntry(nextState, getTimeOfDay(nextState.timeMinutes), text, 'explore');
  return { ok: true, state: withDiary, message: text };
}

export function declineExploreInvite(state: GameState): DomainResult {
  if (state.pendingEvent?.type !== 'explore_invite') {
    return { ok: false, state, reason: '지금은 탐사 제안이 없다.' };
  }
  const nextState: GameState = { ...state, pendingEvent: null };
  const withDiary = pushDiaryEntry(
    nextState,
    getTimeOfDay(nextState.timeMinutes),
    '밖에 나가볼까 했지만, 오늘은 옥상에 남기로 했다.',
    'explore'
  );
  return { ok: true, state: withDiary, message: '나가지 않기로 했다.' };
}

export function resolveSurvivorVisit(state: GameState, accept: boolean, rng: () => number = Math.random): DomainResult {
  if (state.pendingEvent?.type !== 'survivor_visit') {
    return { ok: false, state, reason: '지금은 찾아온 사람이 없다.' };
  }
  const base: GameState = { ...state, pendingEvent: null };

  if (!accept) {
    const withDiary = pushDiaryEntry(
      base,
      getTimeOfDay(base.timeMinutes),
      '낯선 사람이 찾아왔지만 문을 열어주지 않았다.',
      'explore'
    );
    return { ok: true, state: withDiary, message: '문을 열어주지 않았다.' };
  }

  const isGood = rng() < SURVIVOR_ACCEPT_GOOD_CHANCE;
  if (isGood) {
    const gain: Partial<Inventory> = { food: 1, cloth: 1 };
    const nextState: GameState = { ...base, inventory: addResources(base.inventory, gain) };
    const text = '떠돌이 생존자를 들였다. 고맙다며 가진 물자를 조금 나눠주고 떠났다.';
    const withDiary = pushDiaryEntry(nextState, getTimeOfDay(nextState.timeMinutes), text, 'explore');
    return { ok: true, state: withDiary, message: text };
  }

  const text = '낯선 생존자를 들였지만, 그는 말없이 머물다 조용히 떠났다.';
  const withDiary = pushDiaryEntry(base, getTimeOfDay(base.timeMinutes), text, 'explore');
  return { ok: true, state: withDiary, message: text };
}

export function resolveZombieDisguise(state: GameState, letIn: boolean, rng: () => number = Math.random): DomainResult {
  if (state.pendingEvent?.type !== 'zombie_disguise') {
    return { ok: false, state, reason: '지금은 그런 방문자가 없다.' };
  }
  const base: GameState = { ...state, pendingEvent: null };

  if (!letIn) {
    const text = '어딘가 이상한 낯선 이를 그냥 돌려보냈다.';
    const withDiary = pushDiaryEntry(base, getTimeOfDay(base.timeMinutes), text, 'explore');
    return { ok: true, state: withDiary, message: text };
  }

  const wasHuman = rng() < ZOMBIE_LET_IN_SAFE_CHANCE;
  if (wasHuman) {
    const gain: Partial<Inventory> = { water: 1 };
    const nextState: GameState = { ...base, inventory: addResources(base.inventory, gain) };
    const text = '다행히 진짜 사람이었다. 물을 나눠주고 떠났다.';
    const withDiary = pushDiaryEntry(nextState, getTimeOfDay(nextState.timeMinutes), text, 'explore');
    return { ok: true, state: withDiary, message: text };
  }

  const nextState: GameState = {
    ...base,
    stats: {
      ...base.stats,
      health: clamp(base.stats.health - ZOMBIE_DAMAGE_HEALTH, 0, 100),
      fatigue: clamp(base.stats.fatigue + ZOMBIE_DAMAGE_FATIGUE, 0, 100),
    },
    isGameOver: base.stats.health - ZOMBIE_DAMAGE_HEALTH <= 0,
  };
  const text = '사람인 줄 알았던 그것은 좀비였다! 겨우 몰아냈지만 크게 다쳤다.';
  const withDiary = pushDiaryEntry(nextState, getTimeOfDay(nextState.timeMinutes), text, 'explore');
  return { ok: true, state: withDiary, message: text };
}
