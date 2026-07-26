import { buildDeckCardIds } from '../../data/cards.data';
import { createInitialIndustryStock } from '../../data/industries.data';
import { LOAN_POOL_SIZE, STARTING_HAND_SIZE } from '../../data/market.data';
import type { ActionResult, GameAction } from '../../types/actions';
import type { GameState } from '../../types/state';
import { createRng, shuffle } from '../rng';

type StartNextEraAction = Extract<GameAction, { type: 'startNextEra' }>;

function fail(state: GameState, error: string): ActionResult {
  return { ok: false, error, state };
}

export function applyStartNextEra(state: GameState, action: StartNextEraAction): ActionResult {
  if (state.phase !== 'eraTransition') return fail(state, 'Er is geen tijdperkovergang actief');

  const deck = shuffle(buildDeckCardIds(), createRng(action.seed));

  const players = state.players.map((player) => {
    const hand = deck.splice(0, STARTING_HAND_SIZE - 2);
    hand.push('card-wildcard-region', 'card-wildcard-industry');
    return {
      ...player,
      hand,
      wildcardsAvailable: { region: true, industry: true },
      industryStock: createInitialIndustryStock(),
    };
  });

  const regions = state.regions.map((region) => ({
    ...region,
    slots: region.slots.map((slot) => ({ ...slot, occupiedByTileId: undefined })),
  }));

  const halveDemand = (rungsLength: number, nextIndex: number) =>
    Math.max(0, nextIndex - Math.floor(rungsLength / 2));

  return {
    ok: true,
    state: {
      ...state,
      era: 'netwerkfase',
      phase: 'playing',
      regions,
      tiles: [],
      players,
      currentPlayerIndex: 0,
      actionsTakenThisTurn: 0,
      deck,
      discard: [],
      roundNumber: state.roundNumber + 1,
      market: {
        ...state.market,
        handelspostDemand: {
          ...state.market.handelspostDemand,
          nextIndex: halveDemand(state.market.handelspostDemand.rungs.length, state.market.handelspostDemand.nextIndex),
        },
        mediaEnEducatieDemand: Object.fromEntries(
          Object.entries(state.market.mediaEnEducatieDemand).map(([playerId, track]) => [
            playerId,
            { ...track, nextIndex: halveDemand(track.rungs.length, track.nextIndex) },
          ]),
        ),
        energyPrice: state.market.energyPrice + 1,
        bandwidthPrice: state.market.bandwidthPrice + 1,
        loanPoolRemaining: LOAN_POOL_SIZE,
      },
    },
  };
}
