import { CURRENT_SAVE_VERSION } from '../state/initialState';
import type { GameState } from '../state/types';

export { CURRENT_SAVE_VERSION };

export interface SaveFileV1 {
  version: 1;
  savedAt: string;
  state: Omit<GameState, 'lastMessage'>;
}
