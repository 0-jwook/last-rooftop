import { createContext, useContext, useEffect, useReducer, type Dispatch, type ReactNode } from 'react';
import { MINUTES_PER_DAY } from '../game/domain/time';
import { loadGame, saveGame } from '../game/save/storage';
import type { GameAction } from '../game/state/actions';
import { createInitialState } from '../game/state/initialState';
import { gameReducer } from '../game/state/reducer';
import type { GameState } from '../game/state/types';

const REAL_SECONDS_PER_GAME_DAY = 90;
const TICK_INTERVAL_MS = 1000;
const GAME_MINUTES_PER_TICK = MINUTES_PER_DAY / REAL_SECONDS_PER_GAME_DAY;

interface GameContextValue {
  state: GameState;
  dispatch: Dispatch<GameAction>;
}

const GameContext = createContext<GameContextValue | null>(null);

function init(): GameState {
  return loadGame() ?? createInitialState();
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, init);

  useEffect(() => {
    saveGame(state);
  }, [state]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.hidden) return;
      dispatch({ type: 'TICK', minutes: GAME_MINUTES_PER_TICK });
    }, TICK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame은 GameProvider 내부에서만 사용할 수 있다.');
  return ctx;
}
