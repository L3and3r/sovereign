import { CARD_DEFS_BY_ID } from '../../data/cards.data';
import { BUILD_BORDER_SURCHARGE, INDUSTRIES } from '../../data/industries.data';
import { getPlayer } from '../../selectors/player';
import type { ActionResult, GameAction } from '../../types/actions';
import { ZERO_RESOURCES } from '../../types/resources';
import type { GameState } from '../../types/state';
import { clampIncomePosition } from '../incomeTrack';
import { validateCanTakeAction } from '../turnGuard';
import { payResourceCost, playerHasCard, removeCardFromHand, resolveCostWithFallbackMarket } from '../validators';

type BuildAction = Extract<GameAction, { type: 'build' }>;

const AUTO_FLIP_INDUSTRY_TYPES = new Set(['kluis', 'energiecentrale', 'infrastructuur']);

function fail(state: GameState, error: string): ActionResult {
  return { ok: false, error, state };
}

export function applyBuild(state: GameState, action: BuildAction): ActionResult {
  const turnError = validateCanTakeAction(state, action.playerId);
  if (turnError) return fail(state, turnError);

  const player = getPlayer(state, action.playerId);

  if (!playerHasCard(player, action.cardId)) return fail(state, 'Kaart niet op de hand');
  const card = CARD_DEFS_BY_ID[action.cardId];
  if (!card) return fail(state, 'Onbekende kaart');

  if (card.type === 'region') {
    if (card.regionId !== action.regionId) return fail(state, 'Regiokaart komt niet overeen met de gekozen regio');
  } else if (card.type === 'wildcardRegion') {
    if (!player.wildcardsAvailable.region) return fail(state, 'Regio-jokerkaart is dit tijdperk al gebruikt');
  } else if (card.type === 'industry') {
    if (card.industryType !== action.industryType) {
      return fail(state, 'Industriekaart komt niet overeen met het gekozen industrietype');
    }
  } else if (card.type === 'wildcardIndustry') {
    if (!player.wildcardsAvailable.industry) return fail(state, 'Industrie-jokerkaart is dit tijdperk al gebruikt');
  } else {
    return fail(state, 'Deze kaart kan niet gebruikt worden om te bouwen');
  }

  const regionIndex = state.regions.findIndex((r) => r.id === action.regionId);
  if (regionIndex === -1) return fail(state, 'Onbekende regio');
  const region = state.regions[regionIndex]!;

  const slotIndex = region.slots.findIndex((s) => s.id === action.slotId);
  if (slotIndex === -1) return fail(state, 'Onbekend slot');
  const slot = region.slots[slotIndex]!;

  if (slot.occupiedByTileId) return fail(state, 'Slot is al bezet');
  if (!slot.allowedTypes.includes(action.industryType)) {
    return fail(state, 'Dit industrietype is niet toegestaan in dit slot');
  }

  const stock = player.industryStock[action.industryType];
  if (!stock || stock.length === 0) return fail(state, 'Geen tegels van dit industrietype meer over');
  const level = stock[0]!;
  const levelDef = INDUSTRIES[action.industryType].levels[level - 1]!;

  const surcharge = region.hasBorderMarker ? BUILD_BORDER_SURCHARGE : ZERO_RESOURCES;
  const cost = {
    sats: levelDef.cost.sats + surcharge.sats,
    energy: levelDef.cost.energy + surcharge.energy,
    bandwidth: levelDef.cost.bandwidth + surcharge.bandwidth,
  };

  const { totalSats } = resolveCostWithFallbackMarket(player, cost, state.market.energyPrice, state.market.bandwidthPrice);
  if (player.sats < totalSats) return fail(state, 'Onvoldoende sats (inclusief eventuele marktaankoop van energie/bandbreedte)');

  const tileId = `tile-${state.tiles.length + 1}`;
  const flipped = AUTO_FLIP_INDUSTRY_TYPES.has(action.industryType);

  let updatedPlayer = payResourceCost(player, cost, totalSats);
  updatedPlayer = removeCardFromHand(updatedPlayer, action.cardId);
  updatedPlayer = {
    ...updatedPlayer,
    industryStock: { ...updatedPlayer.industryStock, [action.industryType]: stock.slice(1) },
    incomePosition: clampIncomePosition(updatedPlayer.incomePosition + levelDef.incomeBump),
  };
  if (levelDef.produces) {
    const resourceKey = levelDef.produces.resource;
    updatedPlayer = { ...updatedPlayer, [resourceKey]: updatedPlayer[resourceKey] + levelDef.produces.amount };
  }

  const newTile = {
    id: tileId,
    type: action.industryType,
    level,
    ownerId: player.id,
    regionId: action.regionId,
    slotId: action.slotId,
    remainingOutput: levelDef.produces?.amount ?? levelDef.saleCapacity,
    flipped,
  };

  const newSlots = region.slots.map((s, i) => (i === slotIndex ? { ...s, occupiedByTileId: tileId } : s));
  const newRegions = state.regions.map((r, i) => (i === regionIndex ? { ...region, slots: newSlots } : r));
  const newPlayers = state.players.map((p) => (p.id === updatedPlayer.id ? updatedPlayer : p));

  return {
    ok: true,
    state: {
      ...state,
      regions: newRegions,
      players: newPlayers,
      tiles: [...state.tiles, newTile],
      discard: [...state.discard, action.cardId],
      actionsTakenThisTurn: state.actionsTakenThisTurn + 1,
    },
  };
}
