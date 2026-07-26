import { describe, expect, it } from 'vitest';
import { applySell } from '../src/engine/actions/sell';
import type { IndustryTileInstance } from '../src/types/industry';
import { makeTestState, patchState } from './fixtures/makeTestState';

function tile(overrides: Partial<IndustryTileInstance> & Pick<IndustryTileInstance, 'id' | 'type' | 'regionId'>): IndustryTileInstance {
  return {
    level: 1,
    ownerId: 'p1',
    slotId: 'b',
    flipped: false,
    ...overrides,
  };
}

function stateWithHandelspostAndHub() {
  const state = makeTestState();
  return patchState(state, {
    tiles: [
      tile({ id: 'tile-hp', type: 'handelspost', regionId: 'zoutmeer-vrijhaven' }),
      tile({ id: 'tile-hub', type: 'netwerkhub', regionId: 'berghold', ownerId: 'p2', remainingOutput: 2 }),
    ],
    links: [{ id: 'link-1', regionA: 'zoutmeer-vrijhaven', regionB: 'berghold', ownerId: 'p1' }],
  });
}

describe('applySell', () => {
  it('sells a connected handelspost tile: consumes demand + hub capacity, pays sats, flips the tile', () => {
    const state = stateWithHandelspostAndHub();
    const result = applySell(state, { type: 'sell', playerId: 'p1', tileIds: ['tile-hp'] });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const player = result.state.players.find((p) => p.id === 'p1')!;
    // +14 sats from the first demand rung, -2 sats for the 1-energy fallback-market purchase
    expect(player.sats).toBe(30 + 14 - 2);
    expect(player.incomePosition).toBe(10 + 2); // handelspost L1 incomeBump

    const soldTile = result.state.tiles.find((t) => t.id === 'tile-hp')!;
    expect(soldTile.flipped).toBe(true);

    const hub = result.state.tiles.find((t) => t.id === 'tile-hub')!;
    expect(hub.remainingOutput).toBe(1);
    expect(hub.flipped).toBe(false);

    expect(result.state.market.handelspostDemand.nextIndex).toBe(1);

    // A successful Sell opens a reaction window for every other player.
    expect(result.state.pendingReaction).toEqual({ triggerPlayerId: 'p1', eligiblePlayerIds: ['p2'] });
  });

  it('fully depletes and flips the netwerkhub tile once its capacity reaches zero', () => {
    const state = patchState(stateWithHandelspostAndHub(), {
      tiles: [
        tile({ id: 'tile-hp', type: 'handelspost', regionId: 'zoutmeer-vrijhaven' }),
        tile({ id: 'tile-hp2', type: 'handelspost', regionId: 'zoutmeer-vrijhaven', slotId: 'a' }),
        tile({ id: 'tile-hub', type: 'netwerkhub', regionId: 'berghold', ownerId: 'p2', remainingOutput: 2 }),
      ],
      links: [{ id: 'link-1', regionA: 'zoutmeer-vrijhaven', regionB: 'berghold', ownerId: 'p1' }],
    });
    const result = applySell(state, { type: 'sell', playerId: 'p1', tileIds: ['tile-hp', 'tile-hp2'] });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const hub = result.state.tiles.find((t) => t.id === 'tile-hub')!;
    expect(hub.remainingOutput).toBe(0);
    expect(hub.flipped).toBe(true);
    expect(result.state.market.handelspostDemand.nextIndex).toBe(2);
  });

  it('sells a Media & Educatie tile from the seller\'s private demand track', () => {
    const state = patchState(stateWithHandelspostAndHub(), {
      tiles: [
        tile({ id: 'tile-media', type: 'mediaEnEducatie', regionId: 'zoutmeer-vrijhaven' }),
        tile({ id: 'tile-hub', type: 'netwerkhub', regionId: 'berghold', ownerId: 'p2', remainingOutput: 2 }),
      ],
      links: [{ id: 'link-1', regionA: 'zoutmeer-vrijhaven', regionB: 'berghold', ownerId: 'p1' }],
    });
    const result = applySell(state, { type: 'sell', playerId: 'p1', tileIds: ['tile-media'] });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.market.mediaEnEducatieDemand.p1!.nextIndex).toBe(1);
    expect(result.state.market.mediaEnEducatieDemand.p2!.nextIndex).toBe(0);
  });

  it('rejects when there is not enough connected Netwerkhub capacity', () => {
    const state = patchState(makeTestState(), {
      tiles: [tile({ id: 'tile-hp', type: 'handelspost', regionId: 'zoutmeer-vrijhaven' })],
    });
    const result = applySell(state, { type: 'sell', playerId: 'p1', tileIds: ['tile-hp'] });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/Netwerkhub-verkoopcapaciteit/);
  });

  it('rejects selling a tile owned by another player', () => {
    const state = patchState(stateWithHandelspostAndHub(), {
      tiles: [
        tile({ id: 'tile-hp', type: 'handelspost', regionId: 'zoutmeer-vrijhaven', ownerId: 'p2' }),
        tile({ id: 'tile-hub', type: 'netwerkhub', regionId: 'berghold', ownerId: 'p2', remainingOutput: 2 }),
      ],
    });
    const result = applySell(state, { type: 'sell', playerId: 'p1', tileIds: ['tile-hp'] });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/niet van deze speler/);
  });

  it('rejects selling an already-flipped tile', () => {
    const state = patchState(stateWithHandelspostAndHub(), {
      tiles: [
        tile({ id: 'tile-hp', type: 'handelspost', regionId: 'zoutmeer-vrijhaven', flipped: true }),
        tile({ id: 'tile-hub', type: 'netwerkhub', regionId: 'berghold', ownerId: 'p2', remainingOutput: 2 }),
      ],
    });
    const result = applySell(state, { type: 'sell', playerId: 'p1', tileIds: ['tile-hp'] });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/al verkocht/);
  });

  it('rejects non-sellable industry types', () => {
    const state = patchState(stateWithHandelspostAndHub(), {
      tiles: [
        tile({ id: 'tile-ec', type: 'energiecentrale', regionId: 'zoutmeer-vrijhaven' }),
        tile({ id: 'tile-hub', type: 'netwerkhub', regionId: 'berghold', ownerId: 'p2', remainingOutput: 2 }),
      ],
    });
    const result = applySell(state, { type: 'sell', playerId: 'p1', tileIds: ['tile-ec'] });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/Alleen Handelspost/);
  });

  it('rejects duplicate tile ids in one batch', () => {
    const state = stateWithHandelspostAndHub();
    const result = applySell(state, { type: 'sell', playerId: 'p1', tileIds: ['tile-hp', 'tile-hp'] });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/Dubbele/);
  });

  it('rejects when the shared demand track is exhausted', () => {
    const state = patchState(stateWithHandelspostAndHub(), {
      market: {
        ...stateWithHandelspostAndHub().market,
        handelspostDemand: { rungs: stateWithHandelspostAndHub().market.handelspostDemand.rungs, nextIndex: 16 },
      },
    });
    const result = applySell(state, { type: 'sell', playerId: 'p1', tileIds: ['tile-hp'] });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/uitgeput/);
  });

  it('rejects when it is not the acting player\'s turn', () => {
    const state = stateWithHandelspostAndHub();
    const result = applySell(state, { type: 'sell', playerId: 'p2', tileIds: ['tile-hp'] });
    expect(result.ok).toBe(false);
  });

  it('rejects selling a tile disabled by a Dreigingskaart', () => {
    const state = patchState(stateWithHandelspostAndHub(), {
      tiles: [
        tile({ id: 'tile-hp', type: 'handelspost', regionId: 'zoutmeer-vrijhaven', disabled: true }),
        tile({ id: 'tile-hub', type: 'netwerkhub', regionId: 'berghold', ownerId: 'p2', remainingOutput: 2 }),
      ],
    });
    const result = applySell(state, { type: 'sell', playerId: 'p1', tileIds: ['tile-hp'] });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/buiten werking gesteld/);
  });

  it('does not count a disabled Netwerkhub toward sale capacity', () => {
    const state = patchState(stateWithHandelspostAndHub(), {
      tiles: [
        tile({ id: 'tile-hp', type: 'handelspost', regionId: 'zoutmeer-vrijhaven' }),
        tile({ id: 'tile-hub', type: 'netwerkhub', regionId: 'berghold', ownerId: 'p2', remainingOutput: 2, disabled: true }),
      ],
    });
    const result = applySell(state, { type: 'sell', playerId: 'p1', tileIds: ['tile-hp'] });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/Netwerkhub-verkoopcapaciteit/);
  });
});
