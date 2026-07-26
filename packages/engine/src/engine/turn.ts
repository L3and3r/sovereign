import { STARTING_HAND_SIZE, incomeTrackValueForPosition } from '../data/market.data';
import type { ActionResult, GameAction } from '../types/actions';
import type { GameState } from '../types/state';
import { scoreEra } from './era';

type EndTurnAction = Extract<GameAction, { type: 'endTurn' }>;

function fail(state: GameState, error: string): ActionResult {
  return { ok: false, error, state };
}

export function applyEndTurn(state: GameState, action: EndTurnAction): ActionResult {
  if (state.phase !== 'playing') return fail(state, 'Dit tijdperk is al afgelopen');
  const currentPlayer = state.players[state.currentPlayerIndex];
  if (!currentPlayer || currentPlayer.id !== action.playerId) return fail(state, 'Deze speler is niet aan zet');

  const needed = Math.max(0, STARTING_HAND_SIZE - currentPlayer.hand.length);
  const drawn = state.deck.slice(0, needed);
  const newDeck = state.deck.slice(needed);
  const refilledPlayer = { ...currentPlayer, hand: [...currentPlayer.hand, ...drawn] };
  const playersAfterDraw = state.players.map((p) => (p.id === refilledPlayer.id ? refilledPlayer : p));

  // Era ends once the deck can no longer refill hands (deck-exhaustion is the actual driver in
  // Brass Birmingham; requiring every hand to also empty risked a stall once the board fills up).
  const eraShouldEnd = newDeck.length === 0;
  if (eraShouldEnd) {
    return { ok: true, state: scoreEra({ ...state, players: playersAfterDraw, deck: newDeck }) };
  }

  const nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
  let players = playersAfterDraw;
  let roundNumber = state.roundNumber;

  if (nextPlayerIndex === 0) {
    players = players.map((p) => ({
      ...p,
      sats: Math.max(0, p.sats + incomeTrackValueForPosition(p.incomePosition)),
    }));
    roundNumber += 1;
  }

  return {
    ok: true,
    state: {
      ...state,
      players,
      deck: newDeck,
      currentPlayerIndex: nextPlayerIndex,
      actionsTakenThisTurn: 0,
      roundNumber,
    },
  };
}
