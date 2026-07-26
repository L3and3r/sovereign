import { describe, expect, it } from 'vitest';
import { applyBuild } from '../src/engine/actions/build';
import type { GameAction } from '../src/types/actions';
import { giveCard, makeTestState, patchPlayer } from './fixtures/makeTestState';

function withRegionCard(seed?: number) {
  const state = makeTestState(undefined, seed);
  return giveCard(state, 'p1', 'card-region-zoutmeer-vrijhaven');
}

function buildAction(overrides: Partial<Extract<GameAction, { type: 'build' }>> = {}) {
  return {
    type: 'build' as const,
    playerId: 'p1',
    regionId: 'zoutmeer-vrijhaven',
    slotId: 'a',
    industryType: 'energiecentrale' as const,
    cardId: 'card-region-zoutmeer-vrijhaven',
    ...overrides,
  };
}

describe('applyBuild happy path', () => {
  it('builds a tile, pays sats + market-covered energy/bandwidth, and grants VP-relevant flags', () => {
    const state = withRegionCard();
    const result = applyBuild(state, buildAction());

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const player = result.state.players.find((p) => p.id === 'p1')!;
    // cost 5 sats + 1 bandwidth; player has 0 bandwidth, bought via fallback market at 3 sats/unit
    expect(player.sats).toBe(30 - (5 + 3));
    expect(player.bandwidth).toBe(0);
    expect(player.energy).toBe(2); // energiecentrale L1 produces 2 energy
    expect(player.incomePosition).toBe(11); // +1 incomeBump
    expect(player.hand).not.toContain('card-region-zoutmeer-vrijhaven');

    const tile = result.state.tiles[0]!;
    expect(tile.flipped).toBe(true); // energiecentrale auto-flips
    expect(tile.level).toBe(1);

    const region = result.state.regions.find((r) => r.id === 'zoutmeer-vrijhaven')!;
    const slot = region.slots.find((s) => s.id === 'a')!;
    expect(slot.occupiedByTileId).toBe(tile.id);

    expect(result.state.actionsTakenThisTurn).toBe(1);
  });

  it('applies the border-marker surcharge for bordered regions', () => {
    const state = makeTestState();
    const result = applyBuild(
      state,
      buildAction({ regionId: 'grensland', cardId: 'card-wildcard-region' }),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const player = result.state.players.find((p) => p.id === 'p1')!;
    // base cost 5 sats + 1 bandwidth, + surcharge 2 sats + 1 energy;
    // shortfalls: energy 1 * price 2 = 2, bandwidth 1 * price 3 = 3 -> total sats = 5+2+2+3 = 12
    expect(player.sats).toBe(30 - 12);
  });

  it('lets a region wildcard build any industry type in any region', () => {
    const state = makeTestState();
    const result = applyBuild(
      state,
      buildAction({ cardId: 'card-wildcard-region', industryType: 'kluis', slotId: 'c' }),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const player = result.state.players.find((p) => p.id === 'p1')!;
    expect(player.wildcardsAvailable.region).toBe(false);
    expect(player.hand).not.toContain('card-wildcard-region');
  });

  it('does not auto-flip sellable industry types', () => {
    const state = makeTestState();
    const result = applyBuild(
      state,
      buildAction({ cardId: 'card-wildcard-region', industryType: 'handelspost', slotId: 'b' }),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.tiles[0]!.flipped).toBe(false);
  });
});

describe('applyBuild rejections', () => {
  it('rejects when the region card does not match the region', () => {
    const state = withRegionCard();
    const result = applyBuild(state, buildAction({ regionId: 'grensland' }));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/komt niet overeen/);
    expect(result.state).toBe(state);
  });

  it('rejects when the industry card does not match the industry type', () => {
    const state = giveCard(makeTestState(), 'p1', 'card-industry-handelspost');
    const result = applyBuild(
      state,
      buildAction({ cardId: 'card-industry-handelspost', industryType: 'energiecentrale' }),
    );
    expect(result.ok).toBe(false);
  });

  it('rejects insufficient sats even after market fallback', () => {
    const state = patchPlayer(withRegionCard(), 'p1', { sats: 0 });
    const result = applyBuild(state, buildAction());
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/Onvoldoende sats/);
  });

  it('rejects building into an already-occupied slot', () => {
    const state = giveCard(withRegionCard(), 'p1', 'card-industry-infrastructuur');
    const first = applyBuild(state, buildAction());
    expect(first.ok).toBe(true);
    if (!first.ok) return;

    const second = applyBuild(
      first.state,
      buildAction({ industryType: 'infrastructuur', cardId: 'card-industry-infrastructuur' }),
    );
    expect(second.ok).toBe(false);
    if (second.ok) return;
    expect(second.error).toMatch(/al bezet/);
  });

  it('rejects when the industry stock is exhausted', () => {
    const base = withRegionCard();
    const state = patchPlayer(base, 'p1', {
      industryStock: { ...base.players[0]!.industryStock, energiecentrale: [] },
    });
    const result = applyBuild(state, buildAction());
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/Geen tegels/);
  });

  it('rejects when it is not the acting player\'s turn', () => {
    const state = makeTestState();
    const result = applyBuild(state, buildAction({ playerId: 'p2' }));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/niet aan zet/);
  });

  it('rejects an unknown slot', () => {
    const state = makeTestState();
    const result = applyBuild(state, buildAction({ slotId: 'nonexistent' }));
    expect(result.ok).toBe(false);
  });

  it('rejects an industry type not allowed in the chosen slot', () => {
    const state = makeTestState();
    const result = applyBuild(
      state,
      buildAction({ cardId: 'card-wildcard-region', industryType: 'handelspost', slotId: 'a' }),
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/niet toegestaan/);
  });
});
