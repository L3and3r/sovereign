import { CARD_DEFS_BY_ID } from '../../src/data/cards.data';
import { createInitialState } from '../../src/engine/createGame';
import { dispatch } from '../../src/engine/reducer';
import type { ActionResult, GameAction } from '../../src/types/actions';
import type { IndustryType } from '../../src/types/industry';
import type { PlayerId } from '../../src/types/ids';
import type { GameState } from '../../src/types/state';
import { INDUSTRY_TYPES } from '../../src/types/industry';

export type BotActionKind = 'sell' | 'build' | 'network' | 'develop' | 'loan';

export interface BotConfig {
  name: string;
  actionPriority: BotActionKind[];
  /** Used to break ties when a slot allows multiple industry types. */
  industryPreference: IndustryType[];
}

export const HANDELAAR_BOT: BotConfig = {
  name: 'Handelaar',
  actionPriority: ['sell', 'build', 'network', 'develop', 'loan'],
  industryPreference: ['handelspost', 'netwerkhub', 'kluis', 'infrastructuur', 'energiecentrale', 'mediaEnEducatie'],
};

export const INGENIEUR_BOT: BotConfig = {
  name: 'Ingenieur',
  actionPriority: ['build', 'develop', 'sell', 'network', 'loan'],
  industryPreference: ['energiecentrale', 'infrastructuur', 'netwerkhub', 'mediaEnEducatie', 'kluis', 'handelspost'],
};

export const NETWERKER_BOT: BotConfig = {
  name: 'Netwerker',
  actionPriority: ['network', 'sell', 'build', 'develop', 'loan'],
  industryPreference: [...INDUSTRY_TYPES],
};

export const ALL_BOT_ARCHETYPES: BotConfig[] = [HANDELAAR_BOT, INGENIEUR_BOT, NETWERKER_BOT];

function preferredIndustryType(candidates: IndustryType[], preference: IndustryType[]): IndustryType {
  for (const type of preference) {
    if (candidates.includes(type)) return type;
  }
  return candidates[0]!;
}

function trySell(state: GameState, playerId: PlayerId): ActionResult | null {
  const candidates = state.tiles.filter(
    (t) =>
      t.ownerId === playerId &&
      !t.flipped &&
      !t.disabled &&
      (t.type === 'handelspost' || t.type === 'mediaEnEducatie'),
  );
  for (const tile of candidates) {
    const result = dispatch(state, { type: 'sell', playerId, tileIds: [tile.id] });
    if (result.ok) return result;
  }
  return null;
}

function tryBuild(state: GameState, playerId: PlayerId, config: BotConfig): ActionResult | null {
  const player = state.players.find((p) => p.id === playerId)!;

  for (const cardId of player.hand) {
    const card = CARD_DEFS_BY_ID[cardId];
    if (!card) continue;

    if (card.type === 'region' || card.type === 'wildcardRegion') {
      if (card.type === 'wildcardRegion' && !player.wildcardsAvailable.region) continue;
      const regions =
        card.type === 'region' ? state.regions.filter((r) => r.id === card.regionId) : state.regions;
      for (const region of regions) {
        const slot = region.slots.find(
          (s) => !s.occupiedByTileId && s.allowedTypes.some((t) => (player.industryStock[t]?.length ?? 0) > 0),
        );
        if (!slot) continue;
        const candidates = slot.allowedTypes.filter((t) => (player.industryStock[t]?.length ?? 0) > 0);
        const industryType = preferredIndustryType(candidates, config.industryPreference);
        const result = dispatch(state, {
          type: 'build',
          playerId,
          regionId: region.id,
          slotId: slot.id,
          industryType,
          cardId,
        });
        if (result.ok) return result;
      }
    } else if (card.type === 'industry' || card.type === 'wildcardIndustry') {
      const industryTypes: IndustryType[] =
        card.type === 'industry' && card.industryType ? [card.industryType] : config.industryPreference;
      if (card.type === 'wildcardIndustry' && !player.wildcardsAvailable.industry) continue;
      for (const industryType of industryTypes) {
        if ((player.industryStock[industryType]?.length ?? 0) === 0) continue;
        for (const region of state.regions) {
          const slot = region.slots.find((s) => !s.occupiedByTileId && s.allowedTypes.includes(industryType));
          if (!slot) continue;
          const result = dispatch(state, {
            type: 'build',
            playerId,
            regionId: region.id,
            slotId: slot.id,
            industryType,
            cardId,
          });
          if (result.ok) return result;
        }
      }
    }
  }
  return null;
}

function tryNetwork(state: GameState, playerId: PlayerId): ActionResult | null {
  const player = state.players.find((p) => p.id === playerId)!;

  for (const cardId of player.hand) {
    const card = CARD_DEFS_BY_ID[cardId];
    if (!card || (card.type !== 'region' && card.type !== 'wildcardRegion')) continue;
    if (card.type === 'wildcardRegion' && !player.wildcardsAvailable.region) continue;

    for (const regionA of state.regions) {
      if (card.type === 'region' && card.regionId !== regionA.id) continue;
      for (const regionBId of regionA.adjacentRegionIds) {
        const alreadyLinked = state.links.some(
          (l) =>
            (l.regionA === regionA.id && l.regionB === regionBId) ||
            (l.regionA === regionBId && l.regionB === regionA.id),
        );
        if (alreadyLinked) continue;
        const result = dispatch(state, {
          type: 'network',
          playerId,
          regionA: regionA.id,
          regionB: regionBId,
          cardId,
        });
        if (result.ok) return result;
      }
    }
  }
  return null;
}

function tryDevelop(state: GameState, playerId: PlayerId, config: BotConfig): ActionResult | null {
  const player = state.players.find((p) => p.id === playerId)!;
  const industryType = config.industryPreference.find((t) => (player.industryStock[t]?.length ?? 0) > 0);
  const cardId = player.hand[0];
  if (!industryType || !cardId) return null;
  const result = dispatch(state, { type: 'develop', playerId, industryType, cardId });
  return result.ok ? result : null;
}

function tryLoan(state: GameState, playerId: PlayerId): ActionResult | null {
  const result = dispatch(state, { type: 'loan', playerId });
  return result.ok ? result : null;
}

/** Attempts each action kind in the config's priority order; returns the first that succeeds. */
function playOneAction(
  state: GameState,
  playerId: PlayerId,
  config: BotConfig,
): { result: ActionResult; kind: BotActionKind } | null {
  for (const kind of config.actionPriority) {
    const result =
      kind === 'sell'
        ? trySell(state, playerId)
        : kind === 'build'
          ? tryBuild(state, playerId, config)
          : kind === 'network'
            ? tryNetwork(state, playerId)
            : kind === 'develop'
              ? tryDevelop(state, playerId, config)
              : tryLoan(state, playerId);
    if (result) return { result, kind };
  }
  return null;
}

export interface SimulationStats {
  actionCounts: Record<PlayerId, Record<BotActionKind, number>>;
}

export interface SimulationResult {
  state: GameState;
  iterations: number;
  stats: SimulationStats;
}

const MAX_ITERATIONS = 15000;

/**
 * Drives a full game (both eras) to completion using one BotConfig per player. Not a strategy
 * solver - a heuristic priority chain, just enough to exercise every action type (including Sell,
 * which the original single-strategy bot never touched) so balance data reflects the whole ruleset.
 */
export function simulateGame(
  seed: number,
  playerNames: string[],
  playerConfigs: BotConfig[],
): SimulationResult {
  let state = createInitialState(playerNames, seed);
  let iterations = 0;

  const actionCounts: Record<PlayerId, Record<BotActionKind, number>> = {};
  for (const player of state.players) {
    actionCounts[player.id] = { sell: 0, build: 0, network: 0, develop: 0, loan: 0 };
  }

  while ((state.phase === 'playing' || state.phase === 'eraTransition') && iterations < MAX_ITERATIONS) {
    iterations += 1;

    if (state.phase === 'eraTransition') {
      const result = dispatch(state, { type: 'startNextEra' });
      if (!result.ok) throw new Error(`startNextEra unexpectedly failed: ${result.error}`);
      state = result.state;
      continue;
    }

    if (state.pendingReaction) {
      const reactingPlayerId = state.pendingReaction.eligiblePlayerIds[0]!;
      const result = dispatch(state, { type: 'passReaction', playerId: reactingPlayerId });
      if (!result.ok) throw new Error(`passReaction unexpectedly failed: ${result.error}`);
      state = result.state;
      continue;
    }

    const playerIndex = state.currentPlayerIndex;
    const player = state.players[playerIndex]!;
    const config = playerConfigs[playerIndex] ?? playerConfigs[0]!;

    if (state.actionsTakenThisTurn >= 2) {
      const result = dispatch(state, { type: 'endTurn', playerId: player.id });
      if (!result.ok) throw new Error(`endTurn unexpectedly failed: ${result.error}`);
      state = result.state;
      continue;
    }

    const action = playOneAction(state, player.id, config);
    if (action) {
      state = action.result.state;
      actionCounts[player.id]![action.kind] += 1;
      continue;
    }

    const endResult = dispatch(state, { type: 'endTurn', playerId: player.id });
    if (!endResult.ok) throw new Error(`Bot stuck: cannot act or end turn: ${endResult.error}`);
    state = endResult.state;
  }

  return { state, iterations, stats: { actionCounts } };
}
