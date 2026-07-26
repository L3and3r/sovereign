import { INDUSTRIES, SELL_ENERGY_COST_PER_TILE } from '../../data/industries.data';
import { connectedRegionIds } from '../../selectors/network';
import { getPlayer } from '../../selectors/player';
import type { ActionResult, GameAction } from '../../types/actions';
import type { RegionId } from '../../types/ids';
import type { IndustryTileInstance } from '../../types/industry';
import type { GameState } from '../../types/state';
import { clampIncomePosition } from '../incomeTrack';
import { validateCanTakeAction } from '../turnGuard';
import { payResourceCost, resolveCostWithFallbackMarket } from '../validators';

type SellAction = Extract<GameAction, { type: 'sell' }>;

function fail(state: GameState, error: string): ActionResult {
  return { ok: false, error, state };
}

export function applySell(state: GameState, action: SellAction): ActionResult {
  const turnError = validateCanTakeAction(state, action.playerId);
  if (turnError) return fail(state, turnError);

  const player = getPlayer(state, action.playerId);

  if (action.tileIds.length === 0) return fail(state, 'Geen tegels geselecteerd om te verkopen');
  if (new Set(action.tileIds).size !== action.tileIds.length) return fail(state, 'Dubbele tegel in verkoopselectie');

  const tiles: IndustryTileInstance[] = [];
  for (const tileId of action.tileIds) {
    const tile = state.tiles.find((t) => t.id === tileId);
    if (!tile) return fail(state, `Onbekende tegel: ${tileId}`);
    if (tile.ownerId !== player.id) return fail(state, 'Tegel is niet van deze speler');
    if (tile.type !== 'handelspost' && tile.type !== 'mediaEnEducatie') {
      return fail(state, 'Alleen Handelspost- en Media & Educatie-tegels kunnen verkocht worden');
    }
    if (tile.flipped) return fail(state, 'Tegel is al verkocht');
    tiles.push(tile);
  }

  const reachable = new Set<RegionId>();
  for (const regionId of new Set(tiles.map((t) => t.regionId))) {
    for (const r of connectedRegionIds(state, regionId)) reachable.add(r);
  }

  const hubTiles = state.tiles
    .filter((t) => t.type === 'netwerkhub' && reachable.has(t.regionId) && (t.remainingOutput ?? 0) > 0)
    .sort((a, b) => (a.remainingOutput ?? 0) - (b.remainingOutput ?? 0));
  const totalCapacity = hubTiles.reduce((sum, t) => sum + (t.remainingOutput ?? 0), 0);
  if (totalCapacity < tiles.length) return fail(state, 'Onvoldoende verbonden Netwerkhub-verkoopcapaciteit');

  const energyCost = {
    sats: 0,
    energy: SELL_ENERGY_COST_PER_TILE.energy * tiles.length,
    bandwidth: 0,
  };
  const { totalSats } = resolveCostWithFallbackMarket(player, energyCost, state.market.energyPrice, state.market.bandwidthPrice);
  if (player.sats < totalSats) return fail(state, 'Onvoldoende sats (inclusief eventuele marktaankoop van energie)');

  let handelspostIndex = state.market.handelspostDemand.nextIndex;
  const mediaDemand = state.market.mediaEnEducatieDemand[player.id]!;
  let mediaIndex = mediaDemand.nextIndex;
  let totalSatsGained = 0;
  let totalIncomeBump = 0;

  for (const tile of tiles) {
    const levelDef = INDUSTRIES[tile.type].levels[tile.level - 1]!;
    if (tile.type === 'handelspost') {
      if (handelspostIndex >= state.market.handelspostDemand.rungs.length) {
        return fail(state, 'Handelspost-vraagbalk is uitgeput');
      }
      totalSatsGained += state.market.handelspostDemand.rungs[handelspostIndex]!;
      handelspostIndex += 1;
    } else {
      if (mediaIndex >= mediaDemand.rungs.length) {
        return fail(state, 'Media & Educatie-vraagbalk is uitgeput voor deze speler');
      }
      totalSatsGained += mediaDemand.rungs[mediaIndex]!;
      mediaIndex += 1;
    }
    totalIncomeBump += levelDef.incomeBump;
  }

  let remainingToConsume = tiles.length;
  const hubUpdates = new Map<string, { remainingOutput: number; flipped: boolean }>();
  for (const hub of hubTiles) {
    if (remainingToConsume <= 0) break;
    const available = hub.remainingOutput ?? 0;
    const consumed = Math.min(available, remainingToConsume);
    hubUpdates.set(hub.id, { remainingOutput: available - consumed, flipped: available - consumed === 0 });
    remainingToConsume -= consumed;
  }

  let updatedPlayer = payResourceCost(player, energyCost, totalSats);
  updatedPlayer = {
    ...updatedPlayer,
    sats: updatedPlayer.sats + totalSatsGained,
    incomePosition: clampIncomePosition(updatedPlayer.incomePosition + totalIncomeBump),
  };

  const soldTileIds = new Set(tiles.map((t) => t.id));
  const newTiles = state.tiles.map((t) => {
    if (soldTileIds.has(t.id)) return { ...t, flipped: true };
    const hubUpdate = hubUpdates.get(t.id);
    if (hubUpdate) return { ...t, remainingOutput: hubUpdate.remainingOutput, flipped: t.flipped || hubUpdate.flipped };
    return t;
  });

  return {
    ok: true,
    state: {
      ...state,
      tiles: newTiles,
      players: state.players.map((p) => (p.id === updatedPlayer.id ? updatedPlayer : p)),
      market: {
        ...state.market,
        handelspostDemand: { ...state.market.handelspostDemand, nextIndex: handelspostIndex },
        mediaEnEducatieDemand: {
          ...state.market.mediaEnEducatieDemand,
          [player.id]: { ...mediaDemand, nextIndex: mediaIndex },
        },
      },
      actionsTakenThisTurn: state.actionsTakenThisTurn + 1,
    },
  };
}
