import type { GameState, SurvivalStats, TimeOfDay } from '../state/types';
import { pushDiaryEntry } from './diary';
import { clamp, type DomainResult } from './util';

export const MINUTES_PER_DAY = 1440;
export const WAKE_MINUTES = 6 * 60;

const HUNGER_RATE_PER_MIN = 100 / 1440; // 24시간이면 포만 -> 기아
const THIRST_RATE_PER_MIN = 100 / 1200; // 20시간이면 갈증 최대
const FATIGUE_RATE_PER_MIN = 100 / 1080; // 18시간 활동이면 피로 최대
const STARVING_HEALTH_LOSS_PER_MIN = 100 / 1440; // 완전히 굶은 채 24시간이면 체력 소진
const DEHYDRATED_HEALTH_LOSS_PER_MIN = 100 / 960; // 완전히 탈수된 채 16시간이면 체력 소진
const SLEEP_DURATION_MINUTES = 480;
const SLEEP_FATIGUE_RECOVERY = 90;

export function getTimeOfDay(minutes: number): TimeOfDay {
  const m = ((minutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hour = m / 60;
  if (hour >= 5 && hour < 8) return 'dawn';
  if (hour >= 8 && hour < 18) return 'day';
  if (hour >= 18 && hour < 20) return 'sunset';
  return 'night';
}

export function applyPassiveDrain(stats: SurvivalStats, minutesElapsed: number): SurvivalStats {
  const hunger = clamp(stats.hunger + minutesElapsed * HUNGER_RATE_PER_MIN, 0, 100);
  const thirst = clamp(stats.thirst + minutesElapsed * THIRST_RATE_PER_MIN, 0, 100);
  const fatigue = clamp(stats.fatigue + minutesElapsed * FATIGUE_RATE_PER_MIN, 0, 100);
  let health = stats.health;
  if (stats.hunger >= 100) health -= minutesElapsed * STARVING_HEALTH_LOSS_PER_MIN;
  if (stats.thirst >= 100) health -= minutesElapsed * DEHYDRATED_HEALTH_LOSS_PER_MIN;
  return { health: clamp(health, 0, 100), hunger, thirst, fatigue };
}

export function advanceTime(state: GameState, minutes: number): GameState {
  if (minutes <= 0) return state;
  const totalMinutes = state.timeMinutes + minutes;
  const dayIncrease = Math.floor(totalMinutes / MINUTES_PER_DAY);
  const timeMinutes = totalMinutes % MINUTES_PER_DAY;
  const stats = applyPassiveDrain(state.stats, minutes);
  return {
    ...state,
    day: state.day + dayIncrease,
    timeMinutes,
    stats,
    isGameOver: stats.health <= 0,
  };
}

export function restIdle(state: GameState, minutes: number): DomainResult {
  return { ok: true, state: advanceTime(state, minutes), message: '시간을 보냈다.' };
}

export function sleep(state: GameState): DomainResult {
  const statsAfterNight = applyPassiveDrain(state.stats, SLEEP_DURATION_MINUTES);
  const stats: SurvivalStats = {
    ...statsAfterNight,
    fatigue: clamp(statsAfterNight.fatigue - SLEEP_FATIGUE_RECOVERY, 0, 100),
  };
  const nextState: GameState = {
    ...state,
    day: state.day + 1,
    timeMinutes: WAKE_MINUTES,
    stats,
    isGameOver: stats.health <= 0,
  };
  const withDiary = pushDiaryEntry(nextState, 'dawn', '하룻밤을 자고 새로운 아침을 맞았다.', 'survival');
  return { ok: true, state: withDiary, message: '잠을 자고 다음 날 아침이 되었다.' };
}
