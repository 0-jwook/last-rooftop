import type { DiaryEntry, GameState, TimeOfDay } from '../state/types';
import { generateId } from './util';

export function createDiaryEntry(
  day: number,
  timeOfDay: TimeOfDay,
  text: string,
  tag?: DiaryEntry['tag']
): DiaryEntry {
  return { id: generateId(), day, timeOfDay, text, tag };
}

export function pushDiaryEntry(
  state: GameState,
  timeOfDay: TimeOfDay,
  text: string,
  tag?: DiaryEntry['tag']
): GameState {
  return { ...state, diary: [...state.diary, createDiaryEntry(state.day, timeOfDay, text, tag)] };
}
