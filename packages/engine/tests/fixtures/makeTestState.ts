import { createInitialState } from '../../src/engine/createGame';
import type { PlayerState } from '../../src/types/player';
import type { GameState } from '../../src/types/state';

export const TEST_SEED = 12345;

export function makeTestState(playerNames: string[] = ['Alice', 'Bob'], seed = TEST_SEED): GameState {
  return createInitialState(playerNames, seed);
}

export function patchPlayer(state: GameState, playerId: string, patch: Partial<PlayerState>): GameState {
  return {
    ...state,
    players: state.players.map((p) => (p.id === playerId ? { ...p, ...patch } : p)),
  };
}

export function giveCard(state: GameState, playerId: string, cardId: string): GameState {
  const player = state.players.find((p) => p.id === playerId)!;
  return patchPlayer(state, playerId, { hand: [...player.hand, cardId] });
}

export function patchState(state: GameState, patch: Partial<GameState>): GameState {
  return { ...state, ...patch };
}
