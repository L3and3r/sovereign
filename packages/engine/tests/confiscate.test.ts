import { describe, expect, it } from 'vitest';
import { applyConfiscate } from '../src/engine/actions/confiscate';
import { applyPassReaction } from '../src/engine/actions/passReaction';
import { applySell } from '../src/engine/actions/sell';
import type { IndustryTileInstance } from '../src/types/industry';
import { giveCard, makeTestState, patchState } from './fixtures/makeTestState';

function tile(overrides: Partial<IndustryTileInstance> & Pick<IndustryTileInstance, 'id' | 'type' | 'regionId'>): IndustryTileInstance {
  return {
    level: 1,
    ownerId: 'p1',
    slotId: 'b',
    flipped: false,
    ...overrides,
  };
}

function stateWithOpenReactionWindow() {
  const base = makeTestState();
  const state = patchState(base, {
    tiles: [
      tile({ id: 'tile-hp', type: 'handelspost', regionId: 'zoutmeer-vrijhaven' }),
      tile({ id: 'tile-hub', type: 'netwerkhub', regionId: 'berghold', ownerId: 'p2', remainingOutput: 2 }),
    ],
    links: [{ id: 'link-1', regionA: 'zoutmeer-vrijhaven', regionB: 'berghold', ownerId: 'p1' }],
  });
  const result = applySell(state, { type: 'sell', playerId: 'p1', tileIds: ['tile-hp'] });
  if (!result.ok) throw new Error(`setup sell failed: ${result.error}`);
  return giveCard(result.state, 'p2', 'card-dreiging-belastingcontrole');
}

describe('Sell opens a reaction window', () => {
  it('sets pendingReaction with every other player eligible', () => {
    const state = stateWithOpenReactionWindow();
    expect(state.pendingReaction).toEqual({ triggerPlayerId: 'p1', eligiblePlayerIds: ['p2'] });
  });
});

describe('applyConfiscate', () => {
  it('rejects when no reaction window is active', () => {
    const state = giveCard(makeTestState(), 'p2', 'card-dreiging-belastingcontrole');
    const result = applyConfiscate(state, {
      type: 'confiscate',
      playerId: 'p2',
      cardId: 'card-dreiging-belastingcontrole',
      targetTileId: 'tile-hp',
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/reactievenster/);
  });

  it('rejects a player who is not eligible to react', () => {
    const state = stateWithOpenReactionWindow();
    const result = applyConfiscate(state, {
      type: 'confiscate',
      playerId: 'p1',
      cardId: 'card-dreiging-belastingcontrole',
      targetTileId: 'tile-hp',
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/niet reageren/);
  });

  it('rejects when the card is not in hand', () => {
    const base = makeTestState();
    const state = patchState(base, {
      tiles: [tile({ id: 'tile-hp', type: 'handelspost', regionId: 'zoutmeer-vrijhaven' })],
      pendingReaction: { triggerPlayerId: 'p1', eligiblePlayerIds: ['p2'] },
    });
    const result = applyConfiscate(state, {
      type: 'confiscate',
      playerId: 'p2',
      cardId: 'card-dreiging-belastingcontrole',
      targetTileId: 'tile-hp',
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/niet op de hand/);
  });

  it('rejects a card that is not a Dreigingskaart', () => {
    const base = makeTestState();
    const state = giveCard(
      patchState(base, {
        tiles: [tile({ id: 'tile-hp', type: 'handelspost', regionId: 'zoutmeer-vrijhaven' })],
        pendingReaction: { triggerPlayerId: 'p1', eligiblePlayerIds: ['p2'] },
      }),
      'p2',
      'card-region-berghold',
    );
    const result = applyConfiscate(state, {
      type: 'confiscate',
      playerId: 'p2',
      cardId: 'card-region-berghold',
      targetTileId: 'tile-hp',
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/geen Dreigingskaart/);
  });

  it('rejects a target tile not owned by the triggering player', () => {
    const base = makeTestState();
    const state = giveCard(
      patchState(base, {
        tiles: [tile({ id: 'tile-hp2', type: 'handelspost', regionId: 'berghold', ownerId: 'p2' })],
        pendingReaction: { triggerPlayerId: 'p1', eligiblePlayerIds: ['p2'] },
      }),
      'p2',
      'card-dreiging-belastingcontrole',
    );
    const result = applyConfiscate(state, {
      type: 'confiscate',
      playerId: 'p2',
      cardId: 'card-dreiging-belastingcontrole',
      targetTileId: 'tile-hp2',
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/verkopende speler/);
  });

  it('rejects an already-disabled tile', () => {
    const base = makeTestState();
    const state = giveCard(
      patchState(base, {
        tiles: [tile({ id: 'tile-hp', type: 'handelspost', regionId: 'zoutmeer-vrijhaven', disabled: true })],
        pendingReaction: { triggerPlayerId: 'p1', eligiblePlayerIds: ['p2'] },
      }),
      'p2',
      'card-dreiging-belastingcontrole',
    );
    const result = applyConfiscate(state, {
      type: 'confiscate',
      playerId: 'p2',
      cardId: 'card-dreiging-belastingcontrole',
      targetTileId: 'tile-hp',
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/al buiten werking gesteld/);
  });

  it('rejects a tile protected by a Kluis owned by the same player in the same region', () => {
    const base = makeTestState();
    const state = giveCard(
      patchState(base, {
        tiles: [
          tile({ id: 'tile-hp', type: 'handelspost', regionId: 'zoutmeer-vrijhaven' }),
          tile({ id: 'tile-kluis', type: 'kluis', regionId: 'zoutmeer-vrijhaven', slotId: 'c' }),
        ],
        pendingReaction: { triggerPlayerId: 'p1', eligiblePlayerIds: ['p2'] },
      }),
      'p2',
      'card-dreiging-belastingcontrole',
    );
    const result = applyConfiscate(state, {
      type: 'confiscate',
      playerId: 'p2',
      cardId: 'card-dreiging-belastingcontrole',
      targetTileId: 'tile-hp',
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/beschermd door een Kluis/);
  });

  it('succeeds: disables the tile, docks income, discards the card, and closes the window', () => {
    const state = stateWithOpenReactionWindow();
    const targetBefore = state.players.find((p) => p.id === 'p1')!;

    const result = applyConfiscate(state, {
      type: 'confiscate',
      playerId: 'p2',
      cardId: 'card-dreiging-belastingcontrole',
      targetTileId: 'tile-hp',
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const tileAfter = result.state.tiles.find((t) => t.id === 'tile-hp')!;
    expect(tileAfter.disabled).toBe(true);

    const targetAfter = result.state.players.find((p) => p.id === 'p1')!;
    expect(targetAfter.incomePosition).toBe(targetBefore.incomePosition - 2);

    const actingPlayer = result.state.players.find((p) => p.id === 'p2')!;
    expect(actingPlayer.hand).not.toContain('card-dreiging-belastingcontrole');
    expect(result.state.discard).toContain('card-dreiging-belastingcontrole');

    // Only p2 was eligible, so the window closes after they act.
    expect(result.state.pendingReaction).toBeUndefined();
  });
});

describe('applyPassReaction', () => {
  it('rejects when no reaction window is active', () => {
    const result = applyPassReaction(makeTestState(), { type: 'passReaction', playerId: 'p2' });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/reactievenster/);
  });

  it('rejects a player who is not eligible to react', () => {
    const state = stateWithOpenReactionWindow();
    const result = applyPassReaction(state, { type: 'passReaction', playerId: 'p1' });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/niet reageren/);
  });

  it('closes the window without any side effect once everyone has passed', () => {
    const state = stateWithOpenReactionWindow();
    const result = applyPassReaction(state, { type: 'passReaction', playerId: 'p2' });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.state.pendingReaction).toBeUndefined();
    expect(result.state.tiles).toEqual(state.tiles);
    expect(result.state.players).toEqual(state.players);
  });
});
