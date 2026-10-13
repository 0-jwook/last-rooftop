import { createDiaryEntry } from '../domain/diary';
import type { GameState } from './types';

export const CURRENT_SAVE_VERSION = 1;

export function createInitialState(): GameState {
  return {
    saveVersion: CURRENT_SAVE_VERSION,
    day: 1,
    timeMinutes: 17 * 60 + 30,
    weather: 'clear',
    stats: { health: 100, hunger: 15, thirst: 10, fatigue: 20 },
    inventory: { food: 3, water: 3, cloth: 2, wood: 1, scrap: 1, seeds: 0, battery: 0 },
    facilities: [],
    diary: [createDiaryEntry(1, 'sunset', '좀비 사태를 피해 간신히 이 옥상에 도착했다. 오늘은 여기서 밤을 보내야겠다.', 'milestone')],
    isGameOver: false,
    lastMessage: null,
    pendingEvent: null,
  };
}
