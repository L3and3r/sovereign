import { CARD_DEFS_BY_ID } from '../../data/cards.data';
import { LINK_BUILD_COST, NETWORK_BORDER_SURCHARGE } from '../../data/industries.data';
import { getPlayer } from '../../selectors/player';
import type { ActionResult, GameAction } from '../../types/actions';
import { ZERO_RESOURCES } from '../../types/resources';
import type { GameState } from '../../types/state';
import { validateCanTakeAction } from '../turnGuard';
import { payResourceCost, playerHasCard, removeCardFromHand, resolveCostWithFallbackMarket } from '../validators';

type NetworkAction = Extract<GameAction, { type: 'network' }>;

function fail(state: GameState, error: string): ActionResult {
  return { ok: false, error, state };
}

export function applyNetwork(state: GameState, action: NetworkAction): ActionResult {
  const turnError = validateCanTakeAction(state, action.playerId);
  if (turnError) return fail(state, turnError);

  const player = getPlayer(state, action.playerId);

  if (!playerHasCard(player, action.cardId)) return fail(state, 'Card not in hand');
  const card = CARD_DEFS_BY_ID[action.cardId];
  if (!card) return fail(state, 'Unknown card');

  if (card.type === 'region') {
    if (card.regionId !== action.regionA && card.regionId !== action.regionB) {
      return fail(state, 'Region card does not match either endpoint of this link');
    }
  } else if (card.type === 'wildcardRegion') {
    if (!player.wildcardsAvailable.region) return fail(state, 'Region wildcard already used this era');
  } else {
    return fail(state, 'This card cannot be used to build a link');
  }

  const regionA = state.regions.find((r) => r.id === action.regionA);
  const regionB = state.regions.find((r) => r.id === action.regionB);
  if (!regionA || !regionB) return fail(state, 'Unknown region');

  if (!regionA.adjacentRegionIds.includes(action.regionB)) {
    return fail(state, 'These regions are not adjacent');
  }

  const alreadyLinked = state.links.some(
    (link) =>
      (link.regionA === action.regionA && link.regionB === action.regionB) ||
      (link.regionA === action.regionB && link.regionB === action.regionA),
  );
  if (alreadyLinked) return fail(state, 'A link already exists between these regions');

  const surcharge = regionA.hasBorderMarker || regionB.hasBorderMarker ? NETWORK_BORDER_SURCHARGE : ZERO_RESOURCES;
  const cost = {
    sats: LINK_BUILD_COST.sats + surcharge.sats,
    energy: LINK_BUILD_COST.energy + surcharge.energy,
    bandwidth: LINK_BUILD_COST.bandwidth + surcharge.bandwidth,
  };

  const { totalSats } = resolveCostWithFallbackMarket(player, cost, state.market.energyPrice, state.market.bandwidthPrice);
  if (player.sats < totalSats) return fail(state, 'Insufficient sats (including any market purchase of energy/bandwidth)');

  let updatedPlayer = payResourceCost(player, cost, totalSats);
  updatedPlayer = removeCardFromHand(updatedPlayer, action.cardId);

  const newLink = {
    id: `link-${state.links.length + 1}`,
    regionA: action.regionA,
    regionB: action.regionB,
    ownerId: player.id,
  };

  return {
    ok: true,
    state: {
      ...state,
      links: [...state.links, newLink],
      players: state.players.map((p) => (p.id === updatedPlayer.id ? updatedPlayer : p)),
      discard: [...state.discard, action.cardId],
      actionsTakenThisTurn: state.actionsTakenThisTurn + 1,
    },
  };
}
