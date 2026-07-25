import type { PlayerId } from '../types/ids';
import type { PlayerState } from '../types/player';
import type { GameState } from '../types/state';

export function getPlayer(state: GameState, playerId: PlayerId): PlayerState {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) throw new Error(`Unknown player ${playerId}`);
  return player;
}

export function getCurrentPlayer(state: GameState): PlayerState {
  const player = state.players[state.currentPlayerIndex];
  if (!player) throw new Error('No current player');
  return player;
}
