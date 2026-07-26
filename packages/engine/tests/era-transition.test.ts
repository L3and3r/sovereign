import { describe, expect, it } from 'vitest';
import { endNetwerkfase, endPioniersfase } from '../src/engine/era';
import { applyStartNextEra } from '../src/engine/actions/startNextEra';
import { makeTestState, patchState } from './fixtures/makeTestState';

describe('endPioniersfase', () => {
  it('only counts flipped tiles and freezes the board for the transition screen', () => {
    const base = makeTestState();
    const state = patchState(base, {
      deck: [],
      tiles: [
        {
          id: 'tile-1',
          type: 'handelspost',
          level: 2,
          ownerId: 'p1',
          regionId: 'zoutmeer-vrijhaven',
          slotId: 'b',
          flipped: true,
        },
        {
          id: 'tile-2',
          type: 'energiecentrale',
          level: 1,
          ownerId: 'p1',
          regionId: 'berghold',
          slotId: 'a',
          flipped: false,
        },
      ],
      links: [{ id: 'link-1', regionA: 'zoutmeer-vrijhaven', regionB: 'berghold', ownerId: 'p1' }],
    });

    const result = endPioniersfase(state);

    expect(result.phase).toBe('eraTransition');
    expect(result.eraScores!.pioniersfase!.p1).toEqual({ flippedVp: 5 });
    expect(result.eraScores!.pioniersfase!.p2).toEqual({ flippedVp: 0 });
    // Board stays untouched until the player confirms the transition.
    expect(result.tiles).toHaveLength(2);
    expect(result.links).toHaveLength(1);
  });
});

describe('applyStartNextEra', () => {
  it('rejects when no era transition is active', () => {
    const state = makeTestState();
    const result = applyStartNextEra(state, { type: 'startNextEra', seed: 1 });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/tijdperkovergang/);
  });

  it('resets the board and player state for the new era', () => {
    const base = makeTestState();
    const transitioned = endPioniersfase(
      patchState(base, {
        tiles: [
          {
            id: 'tile-1',
            type: 'handelspost',
            level: 1,
            ownerId: 'p1',
            regionId: 'zoutmeer-vrijhaven',
            slotId: 'b',
            flipped: true,
          },
        ],
        links: [{ id: 'link-1', regionA: 'zoutmeer-vrijhaven', regionB: 'berghold', ownerId: 'p1' }],
        players: base.players.map((p) => ({ ...p, wildcardsAvailable: { region: false, industry: false } })),
      }),
    );

    const result = applyStartNextEra(transitioned, { type: 'startNextEra', seed: 999 });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.state.era).toBe('netwerkfase');
    expect(result.state.phase).toBe('playing');
    expect(result.state.tiles).toHaveLength(0);
    for (const region of result.state.regions) {
      for (const slot of region.slots) {
        expect(slot.occupiedByTileId).toBeUndefined();
      }
    }
    // Links persist across the transition (assumption #1 in the plan).
    expect(result.state.links).toHaveLength(1);

    for (const player of result.state.players) {
      expect(player.hand).toHaveLength(8);
      expect(player.wildcardsAvailable).toEqual({ region: true, industry: true });
      expect(player.industryStock.energiecentrale).toHaveLength(4);
    }

    expect(result.state.market.loanPoolRemaining).toBe(30);
    expect(result.state.market.energyPrice).toBe(base.market.energyPrice + 1);
    expect(result.state.market.bandwidthPrice).toBe(base.market.bandwidthPrice + 1);
  });
});

describe('endNetwerkfase', () => {
  it('combines both eras industry VP with a single link VP tally', () => {
    const base = makeTestState();
    const withEra1Score = patchState(base, {
      era: 'netwerkfase',
      eraScores: { pioniersfase: { p1: { flippedVp: 5 }, p2: { flippedVp: 2 } } },
      tiles: [
        {
          id: 'tile-2',
          type: 'energiecentrale',
          level: 1,
          ownerId: 'p1',
          regionId: 'berghold',
          slotId: 'a',
          flipped: true,
        },
      ],
      links: [{ id: 'link-1', regionA: 'zoutmeer-vrijhaven', regionB: 'berghold', ownerId: 'p1' }],
    });

    const result = endNetwerkfase(withEra1Score);

    expect(result.phase).toBe('gameEnded');
    // p1: 5 (era 1) + 2 (era 2, energiecentrale lvl 1) + 1 link = 8
    expect(result.finalScores!.p1).toEqual({ flippedVp: 7, linkVp: 1, total: 8 });
    // p2: 2 (era 1) + 0 (era 2) + 0 links = 2
    expect(result.finalScores!.p2).toEqual({ flippedVp: 2, linkVp: 0, total: 2 });
  });
});
