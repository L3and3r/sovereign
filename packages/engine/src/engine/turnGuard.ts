import type { PlayerId } from '../types/ids';
import type { GameState } from '../types/state';

export const MAX_ACTIONS_PER_TURN = 2;

export function validateCanTakeAction(state: GameState, playerId: PlayerId): string | null {
  if (state.phase !== 'playing') return 'Dit tijdperk is al afgelopen';
  const currentPlayer = state.players[state.currentPlayerIndex];
  if (!currentPlayer || currentPlayer.id !== playerId) return 'Deze speler is niet aan zet';
  if (state.actionsTakenThisTurn >= MAX_ACTIONS_PER_TURN) return 'Geen acties meer over deze beurt';
  return null;
}
