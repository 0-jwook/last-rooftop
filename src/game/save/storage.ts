import type { GameState } from '../state/types';
import { migrateSave } from './migrate';
import { CURRENT_SAVE_VERSION, type SaveFileV1 } from './schema';

const SAVE_KEY = 'lastRooftop.save';

export function saveGame(state: GameState): boolean {
  try {
    const payload: SaveFileV1 = {
      version: CURRENT_SAVE_VERSION,
      savedAt: new Date().toISOString(),
      state: {
        saveVersion: state.saveVersion,
        day: state.day,
        timeMinutes: state.timeMinutes,
        weather: state.weather,
        stats: state.stats,
        inventory: state.inventory,
        facilities: state.facilities,
        diary: state.diary,
        isGameOver: state.isGameOver,
        pendingEvent: state.pendingEvent,
      },
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
    return true;
  } catch (error) {
    console.error('게임 저장 실패:', error);
    return false;
  }
}

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return migrateSave(JSON.parse(raw));
  } catch (error) {
    console.error('게임 불러오기 실패, 새로 시작합니다:', error);
    return null;
  }
}

export function hasSaveGame(): boolean {
  try {
    return localStorage.getItem(SAVE_KEY) !== null;
  } catch {
    return false;
  }
}

export function resetGame(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    // ignore
  }
}
