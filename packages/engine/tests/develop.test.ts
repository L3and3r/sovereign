import { describe, expect, it } from 'vitest';
import { applyDevelop } from '../src/engine/actions/develop';
import type { GameAction } from '../src/types/actions';
import { giveCard, makeTestState, patchPlayer } from './fixtures/makeTestState';

function developAction(overrides: Partial<Extract<GameAction, { type: 'develop' }>> = {}) {
  return {
    type: 'develop' as const,
    playerId: 'p1',
    industryType: 'energiecentrale' as const,
    cardId: 'card-industry-handelspost',
    ...overrides,
  };
}

describe('applyDevelop', () => {
  it('discards the given card and skips exactly the next stock level, paying energy via the fallback market', () => {
    const state = giveCard(makeTestState(), 'p1', 'card-industry-handelspost');
    const result = applyDevelop(state, developAction());

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const player = result.state.players.find((p) => p.id === 'p1')!;
    // 1 energy shortfall * price 2 = 2 sats
    expect(player.sats).toBe(30 - 2);
    expect(player.energy).toBe(0);
    expect(player.industryStock.energiecentrale).toEqual([2, 3, 4]);
    expect(player.hand).not.toContain('card-industry-handelspost');
    expect(result.state.actionsTakenThisTurn).toBe(1);
  });

  it('marks a wildcard as used when it is discarded for Develop', () => {
    const state = makeTestState();
    const result = applyDevelop(state, developAction({ cardId: 'card-wildcard-industry' }));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const player = result.state.players.find((p) => p.id === 'p1')!;
    expect(player.wildcardsAvailable.industry).toBe(false);
  });

  it('rejects when the card is not in hand', () => {
    const state = makeTestState();
    const result = applyDevelop(state, developAction({ cardId: 'card-industry-handelspost' }));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/niet op de hand/);
  });

  it('rejects when the industry stock is already fully developed', () => {
    const base = giveCard(makeTestState(), 'p1', 'card-industry-handelspost');
    const state = patchPlayer(base, 'p1', {
      industryStock: { ...base.players[0]!.industryStock, energiecentrale: [] },
    });
    const result = applyDevelop(state, developAction());
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/Geen tegels/);
  });

  it('rejects insufficient sats', () => {
    const base = giveCard(makeTestState(), 'p1', 'card-industry-handelspost');
    const state = patchPlayer(base, 'p1', { sats: 0 });
    const result = applyDevelop(state, developAction());
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/Onvoldoende sats/);
  });

  it('rejects when it is not the acting player\'s turn', () => {
    const state = makeTestState();
    const result = applyDevelop(state, developAction({ playerId: 'p2' }));
    expect(result.ok).toBe(false);
  });
});
