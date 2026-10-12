import { createContext, useContext, useEffect, useReducer, type Dispatch, type ReactNode } from 'react';
import { loadGame, saveGame } from '../game/save/storage';
import type { GameAction } from '../game/state/actions';
import { createInitialState } from '../game/state/initialState';
import { gameReducer } from '../game/state/reducer';
import type { GameState } from '../game/state/types';

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

  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame은 GameProvider 내부에서만 사용할 수 있다.');
  return ctx;
}
