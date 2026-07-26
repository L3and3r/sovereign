import { CARD_DEFS_BY_ID } from '../data/cards.data';
import { dispatch } from '../engine/reducer';
import type { GameAction } from '../types/actions';
import type { IndustryType } from '../types/industry';
import type { PlayerId } from '../types/ids';
import type { GameState } from '../types/state';
import type { AutomaActionKind, AutomaConfig } from './automaConfig';

function preferredIndustryType(candidates: IndustryType[], preference: IndustryType[]): IndustryType {
  for (const type of preference) {
    if (candidates.includes(type)) return type;
  }
  return candidates[0]!;
}

function trySell(state: GameState, playerId: PlayerId): GameAction | null {
  const candidates = state.tiles.filter(
    (t) => t.ownerId === playerId && !t.flipped && !t.disabled && (t.type === 'handelspost' || t.type === 'mediaEnEducatie'),
  );
  for (const tile of candidates) {
    const action: GameAction = { type: 'sell', playerId, tileIds: [tile.id] };
    if (dispatch(state, action).ok) return action;
  }
  return null;
}

function tryBuild(state: GameState, playerId: PlayerId, config: AutomaConfig): GameAction | null {
  const player = state.players.find((p) => p.id === playerId)!;

  for (const cardId of player.hand) {
    const card = CARD_DEFS_BY_ID[cardId];
    if (!card) continue;

    if (card.type === 'region' || card.type === 'wildcardRegion') {
      if (card.type === 'wildcardRegion' && !player.wildcardsAvailable.region) continue;
      const regions = card.type === 'region' ? state.regions.filter((r) => r.id === card.regionId) : state.regions;
      for (const region of regions) {
        const slot = region.slots.find(
          (s) => !s.occupiedByTileId && s.allowedTypes.some((t) => (player.industryStock[t]?.length ?? 0) > 0),
        );
        if (!slot) continue;
        const candidates = slot.allowedTypes.filter((t) => (player.industryStock[t]?.length ?? 0) > 0);
        const industryType = preferredIndustryType(candidates, config.industryPreference);
        const action: GameAction = { type: 'build', playerId, regionId: region.id, slotId: slot.id, industryType, cardId };
        if (dispatch(state, action).ok) return action;
      }
    } else if (card.type === 'industry' || card.type === 'wildcardIndustry') {
      if (card.type === 'wildcardIndustry' && !player.wildcardsAvailable.industry) continue;
      const industryTypes: IndustryType[] =
        card.type === 'industry' && card.industryType ? [card.industryType] : config.industryPreference;
      for (const industryType of industryTypes) {
        if ((player.industryStock[industryType]?.length ?? 0) === 0) continue;
        for (const region of state.regions) {
          const slot = region.slots.find((s) => !s.occupiedByTileId && s.allowedTypes.includes(industryType));
          if (!slot) continue;
          const action: GameAction = { type: 'build', playerId, regionId: region.id, slotId: slot.id, industryType, cardId };
          if (dispatch(state, action).ok) return action;
        }
      }
    }
  }
  return null;
}

function tryNetwork(state: GameState, playerId: PlayerId): GameAction | null {
  const player = state.players.find((p) => p.id === playerId)!;

  for (const cardId of player.hand) {
    const card = CARD_DEFS_BY_ID[cardId];
    if (!card || (card.type !== 'region' && card.type !== 'wildcardRegion')) continue;
    if (card.type === 'wildcardRegion' && !player.wildcardsAvailable.region) continue;

    for (const regionA of state.regions) {
      if (card.type === 'region' && card.regionId !== regionA.id) continue;
      for (const regionBId of regionA.adjacentRegionIds) {
        const alreadyLinked = state.links.some(
          (l) => (l.regionA === regionA.id && l.regionB === regionBId) || (l.regionA === regionBId && l.regionB === regionA.id),
        );
        if (alreadyLinked) continue;
        const action: GameAction = { type: 'network', playerId, regionA: regionA.id, regionB: regionBId, cardId };
        if (dispatch(state, action).ok) return action;
      }
    }
  }
  return null;
}

function tryDevelop(state: GameState, playerId: PlayerId, config: AutomaConfig): GameAction | null {
  const player = state.players.find((p) => p.id === playerId)!;
  const industryType = config.industryPreference.find((t) => (player.industryStock[t]?.length ?? 0) > 0);
  const cardId = player.hand[0];
  if (!industryType || !cardId) return null;
  const action: GameAction = { type: 'develop', playerId, industryType, cardId };
  return dispatch(state, action).ok ? action : null;
}

function tryLoan(state: GameState, playerId: PlayerId): GameAction | null {
  const action: GameAction = { type: 'loan', playerId };
  return dispatch(state, action).ok ? action : null;
}

function tryUndercut(state: GameState, playerId: PlayerId): GameAction | null {
  const action: GameAction = { type: 'automaUndercut', playerId };
  return dispatch(state, action).ok ? action : null;
}

/**
 * Picks the automa's next action for this turn by trying each kind in its configured priority
 * order, returning the first that would succeed. Does not dispatch - the caller (the web store,
 * so the move gets persisted the same way a human's move does) dispatches the returned action.
 */
export function pickAutomaAction(state: GameState, playerId: PlayerId): GameAction | null {
  const player = state.players.find((p) => p.id === playerId);
  const config = player?.automaConfig;
  if (!config) return null;

  for (const kind of config.actionPriority) {
    const action = pickByKind(state, playerId, kind, config);
    if (action) return action;
  }
  return null;
}

function pickByKind(state: GameState, playerId: PlayerId, kind: AutomaActionKind, config: AutomaConfig): GameAction | null {
  switch (kind) {
    case 'sell':
      return trySell(state, playerId);
    case 'build':
      return tryBuild(state, playerId, config);
    case 'network':
      return tryNetwork(state, playerId);
    case 'develop':
      return tryDevelop(state, playerId, config);
    case 'loan':
      return tryLoan(state, playerId);
    case 'undercut':
      return tryUndercut(state, playerId);
    default: {
      const exhaustive: never = kind;
      return exhaustive;
    }
  }
}

/** Cheap deterministic pseudo-random float in [0,1), derived from state that already changes
 * every decision - avoids threading extra RNG state through GameState just for this flavor knob. */
function pseudoRandom(state: GameState): number {
  const seedInput = state.roundNumber * 7919 + state.discard.length * 104729 + state.tiles.length * 4177;
  const x = Math.sin(seedInput) * 10000;
  return x - Math.floor(x);
}

/**
 * Decides the automa's move during a Dreigingskaart reaction window: confiscate a valid,
 * unprotected tile of the triggering player if it has a dreiging card and its confiscateChance
 * roll succeeds, otherwise pass.
 */
export function pickAutomaReaction(state: GameState, playerId: PlayerId): GameAction {
  const player = state.players.find((p) => p.id === playerId);
  const config = player?.automaConfig;
  const pendingReaction = state.pendingReaction;
  if (!player || !config || !pendingReaction) return { type: 'passReaction', playerId };

  const dreigingCardId = player.hand.find((id) => CARD_DEFS_BY_ID[id]?.type === 'dreiging');
  if (!dreigingCardId) return { type: 'passReaction', playerId };

  const protectedRegionIds = new Set(
    state.tiles.filter((t) => t.type === 'kluis' && t.ownerId === pendingReaction.triggerPlayerId).map((t) => t.regionId),
  );
  const target = state.tiles.find(
    (t) => t.ownerId === pendingReaction.triggerPlayerId && !t.disabled && !protectedRegionIds.has(t.regionId),
  );
  if (!target) return { type: 'passReaction', playerId };

  if (pseudoRandom(state) >= config.confiscateChance) return { type: 'passReaction', playerId };

  return { type: 'confiscate', playerId, cardId: dreigingCardId, targetTileId: target.id };
}
