import type { PlayerId } from '../types/ids';
import type { GameState } from '../types/state';

export const MAX_ACTIONS_PER_TURN = 2;

export function validateCanTakeAction(state: GameState, playerId: PlayerId): string | null {
  if (state.phase !== 'playing') return 'The era has already ended';
  const currentPlayer = state.players[state.currentPlayerIndex];
  if (!currentPlayer || currentPlayer.id !== playerId) return "It is not this player's turn";
  if (state.actionsTakenThisTurn >= MAX_ACTIONS_PER_TURN) return 'No actions remaining this turn';
  return null;
}
