import { CARD_DEFS_BY_ID } from '../data/cards.data';
import type { CardId } from '../types/ids';
import type { PlayerState } from '../types/player';
import type { ResourceBundle } from '../types/resources';

/**
 * Energy/Bandwidth shortfalls are covered by a fixed-price, unlimited-supply fallback market
 * (v0.1 simplification — see plan assumption #2), so the only hard constraint is total sats.
 */
export function resolveCostWithFallbackMarket(
  player: PlayerState,
  cost: ResourceBundle,
  energyPrice: number,
  bandwidthPrice: number,
): { totalSats: number } {
  const energyShortfall = Math.max(0, cost.energy - player.energy);
  const bandwidthShortfall = Math.max(0, cost.bandwidth - player.bandwidth);
  const totalSats = cost.sats + energyShortfall * energyPrice + bandwidthShortfall * bandwidthPrice;
  return { totalSats };
}

export function payResourceCost(player: PlayerState, cost: ResourceBundle, totalSats: number): PlayerState {
  return {
    ...player,
    sats: player.sats - totalSats,
    energy: Math.max(0, player.energy - cost.energy),
    bandwidth: Math.max(0, player.bandwidth - cost.bandwidth),
  };
}

export function playerHasCard(player: PlayerState, cardId: CardId): boolean {
  return player.hand.includes(cardId);
}

export function removeCardFromHand(player: PlayerState, cardId: CardId): PlayerState {
  const index = player.hand.indexOf(cardId);
  if (index === -1) return player;
  const hand = [...player.hand];
  hand.splice(index, 1);

  const wildcardsAvailable = { ...player.wildcardsAvailable };
  const def = CARD_DEFS_BY_ID[cardId];
  if (def?.type === 'wildcardRegion') wildcardsAvailable.region = false;
  if (def?.type === 'wildcardIndustry') wildcardsAvailable.industry = false;

  return { ...player, hand, wildcardsAvailable };
}
