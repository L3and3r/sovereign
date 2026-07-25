import { buildDeckCardIds } from '../data/cards.data';
import { createInitialIndustryStock } from '../data/industries.data';
import {
  BANDWIDTH_MARKET_PRICE,
  ENERGY_MARKET_PRICE,
  HANDELSPOST_DEMAND_RUNGS,
  INCOME_TRACK,
  LOAN_POOL_SIZE,
  MEDIA_EN_EDUCATIE_DEMAND_RUNGS,
  STARTING_INCOME_POSITION,
  STARTING_SATS,
} from '../data/market.data';
import { REGIONS } from '../data/regions.data';
import type { PlayerState } from '../types/player';
import type { GameState } from '../types/state';
import { createRng, shuffle } from './rng';

const NON_WILDCARD_HAND_SIZE = 6;

export function createInitialState(playerNames: string[], seed: number = Date.now()): GameState {
  if (playerNames.length < 1 || playerNames.length > 4) {
    throw new Error('Sovereign supports 1-4 players');
  }

  const rng = createRng(seed);
  const deck = shuffle(buildDeckCardIds(), rng);

  const players: PlayerState[] = playerNames.map((name, index) => {
    const hand = deck.splice(0, NON_WILDCARD_HAND_SIZE);
    hand.push('card-wildcard-region', 'card-wildcard-industry');
    return {
      id: `p${index + 1}`,
      name,
      sats: STARTING_SATS,
      energy: 0,
      bandwidth: 0,
      reputation: 0,
      incomePosition: STARTING_INCOME_POSITION,
      vp: 0,
      hand,
      wildcardsAvailable: { region: true, industry: true },
      industryStock: createInitialIndustryStock(),
    };
  });

  return {
    era: 'pioniersfase',
    regions: structuredClone(REGIONS),
    links: [],
    tiles: [],
    players,
    currentPlayerIndex: 0,
    actionsTakenThisTurn: 0,
    deck,
    discard: [],
    market: {
      handelspostDemand: { rungs: [...HANDELSPOST_DEMAND_RUNGS], nextIndex: 0 },
      mediaEnEducatieDemand: Object.fromEntries(
        players.map((p) => [p.id, { rungs: [...MEDIA_EN_EDUCATIE_DEMAND_RUNGS], nextIndex: 0 }]),
      ),
      energyPrice: ENERGY_MARKET_PRICE,
      bandwidthPrice: BANDWIDTH_MARKET_PRICE,
      incomeTrack: [...INCOME_TRACK],
      loanPoolRemaining: LOAN_POOL_SIZE,
    },
    roundNumber: 1,
    phase: 'playing',
  };
}
