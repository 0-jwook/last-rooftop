import type { GameState, SurvivalStats, TimeOfDay } from '../state/types';
import { clamp } from './util';

export const MINUTES_PER_DAY = 1440;

const HUNGER_RATE_PER_MIN = 100 / 1440; // 24시간이면 포만 -> 기아
const THIRST_RATE_PER_MIN = 100 / 1200; // 20시간이면 갈증 최대
const FATIGUE_RATE_PER_MIN = 100 / 1080; // 18시간 활동이면 피로 최대
const STARVING_HEALTH_LOSS_PER_MIN = 100 / 1440; // 완전히 굶은 채 24시간이면 체력 소진
const DEHYDRATED_HEALTH_LOSS_PER_MIN = 100 / 960; // 완전히 탈수된 채 16시간이면 체력 소진

const NIGHT_REST_START_HOUR = 0;
const NIGHT_REST_END_HOUR = 6;
const NIGHT_REST_RECOVERY_PER_MIN = 100 / 240; // 심야 시간대 4시간이면 피로 완전 회복

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

/** 심야 시간대(00:00~06:00)에는 캐릭터가 알아서 쉬며 피로가 자동으로 회복된다. */
export function applyNightRecovery(state: GameState, minutes: number): GameState {
  const hour = state.timeMinutes / 60;
  if (hour < NIGHT_REST_START_HOUR || hour >= NIGHT_REST_END_HOUR) return state;
  return {
    ...state,
    stats: { ...state.stats, fatigue: clamp(state.stats.fatigue - minutes * NIGHT_REST_RECOVERY_PER_MIN, 0, 100) },
  };
}
