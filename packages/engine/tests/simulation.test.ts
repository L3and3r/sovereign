import { describe, expect, it } from 'vitest';
import { CARD_DEFS_BY_ID } from '../src/data/cards.data';
import { createInitialState } from '../src/engine/createGame';
import { dispatch } from '../src/engine/reducer';
import type { GameState } from '../src/types/state';

const MAX_ITERATIONS = 10000;

/**
 * Minimal rule-following bot: build whatever a hand card allows if a slot is free and stock
 * remains, else take a loan, else end the turn. Exercises the full turn/round/era loop without
 * needing real strategy - unit tests already cover each action's rules in isolation.
 */
function simulateRandomGame(seed: number, playerNames: string[]): { state: GameState; iterations: number } {
  let state = createInitialState(playerNames, seed);
  let iterations = 0;

  while ((state.phase === 'playing' || state.phase === 'eraTransition') && iterations < MAX_ITERATIONS) {
    iterations += 1;

    if (state.phase === 'eraTransition') {
      const result = dispatch(state, { type: 'startNextEra' });
      if (!result.ok) throw new Error(`startNextEra unexpectedly failed: ${result.error}`);
      state = result.state;
      continue;
    }

    if (state.pendingReaction) {
      // Simplest bot behavior: always pass on Dreigingskaart reactions, same as the bot not
      // needing real Sell/Develop strategy elsewhere in this simulation.
      const reactingPlayerId = state.pendingReaction.eligiblePlayerIds[0]!;
      const result = dispatch(state, { type: 'passReaction', playerId: reactingPlayerId });
      if (!result.ok) throw new Error(`passReaction unexpectedly failed: ${result.error}`);
      state = result.state;
      continue;
    }

    const player = state.players[state.currentPlayerIndex]!;

    if (state.actionsTakenThisTurn >= 2) {
      const result = dispatch(state, { type: 'endTurn', playerId: player.id });
      if (!result.ok) throw new Error(`endTurn unexpectedly failed: ${result.error}`);
      state = result.state;
      continue;
    }

    let acted = false;
    for (const cardId of player.hand) {
      const card = CARD_DEFS_BY_ID[cardId];
      if (!card) continue;

      if (card.type === 'region') {
        const region = state.regions.find((r) => r.id === card.regionId)!;
        const slot = region.slots.find(
          (s) => !s.occupiedByTileId && s.allowedTypes.some((t) => (player.industryStock[t]?.length ?? 0) > 0),
        );
        if (slot) {
          const industryType = slot.allowedTypes.find((t) => (player.industryStock[t]?.length ?? 0) > 0)!;
          const result = dispatch(state, {
            type: 'build',
            playerId: player.id,
            regionId: region.id,
            slotId: slot.id,
            industryType,
            cardId,
          });
          if (result.ok) {
            state = result.state;
            acted = true;
            break;
          }
        }
      } else if (card.type === 'industry' && card.industryType) {
        const industryType = card.industryType;
        if ((player.industryStock[industryType]?.length ?? 0) === 0) continue;
        for (const region of state.regions) {
          const slot = region.slots.find((s) => !s.occupiedByTileId && s.allowedTypes.includes(industryType));
          if (slot) {
            const result = dispatch(state, {
              type: 'build',
              playerId: player.id,
              regionId: region.id,
              slotId: slot.id,
              industryType,
              cardId,
            });
            if (result.ok) {
              state = result.state;
              acted = true;
              break;
            }
          }
        }
        if (acted) break;
      }
    }

    if (!acted) {
      // Develop: discard any hand card to skip the next stock level of some industry type.
      // Doesn't need a board slot, so it keeps hands (and the deck) moving once the board fills up.
      const industryType = (Object.keys(player.industryStock) as Array<keyof typeof player.industryStock>).find(
        (t) => (player.industryStock[t]?.length ?? 0) > 0,
      );
      const cardId = player.hand[0];
      if (industryType && cardId) {
        const result = dispatch(state, { type: 'develop', playerId: player.id, industryType, cardId });
        if (result.ok) {
          state = result.state;
          acted = true;
        }
      }
    }

    if (!acted) {
      // Network: link any adjacent, not-yet-linked region pair using a matching region card.
      outer: for (const cardId2 of player.hand) {
        const card = CARD_DEFS_BY_ID[cardId2];
        if (!card || (card.type !== 'region' && card.type !== 'wildcardRegion')) continue;
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
              playerId: player.id,
              regionA: regionA.id,
              regionB: regionBId,
              cardId: cardId2,
            });
            if (result.ok) {
              state = result.state;
              acted = true;
              break outer;
            }
          }
        }
      }
    }

    if (!acted) {
      const loanResult = dispatch(state, { type: 'loan', playerId: player.id });
      if (loanResult.ok) {
        state = loanResult.state;
        acted = true;
      }
    }

    if (!acted) {
      const endResult = dispatch(state, { type: 'endTurn', playerId: player.id });
      if (!endResult.ok) throw new Error(`Bot stuck: cannot build, loan, or end turn: ${endResult.error}`);
      state = endResult.state;
    }
  }

  return { state, iterations };
}

describe('headless randomized game simulation', () => {
  for (const seed of [1, 2, 3]) {
    it(`reaches era end within ${MAX_ITERATIONS} iterations for seed ${seed}`, () => {
      const { state, iterations } = simulateRandomGame(seed, ['Alice', 'Bob']);

      expect(iterations).toBeLessThan(MAX_ITERATIONS);
      expect(state.phase).toBe('gameEnded');
      expect(state.finalScores).toBeDefined();
      for (const player of state.players) {
        expect(state.finalScores![player.id]).toBeDefined();
        expect(player.vp).toBe(state.finalScores![player.id]!.total);
      }
    });
  }

  it('also terminates correctly with 4 players', () => {
    const { state, iterations } = simulateRandomGame(42, ['Alice', 'Bob', 'Cara', 'Dave']);
    expect(iterations).toBeLessThan(MAX_ITERATIONS);
    expect(state.phase).toBe('gameEnded');
    expect(state.players).toHaveLength(4);
  });
});
