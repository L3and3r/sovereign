import { describe, expect, it } from 'vitest';
import { applyLoan } from '../src/engine/actions/loan';
import { makeTestState, patchPlayer } from './fixtures/makeTestState';

describe('applyLoan', () => {
  it('grants sats and permanently lowers the income position', () => {
    const state = makeTestState();
    const result = applyLoan(state, { type: 'loan', playerId: 'p1' });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const player = result.state.players.find((p) => p.id === 'p1')!;
    expect(player.sats).toBe(30 + 30);
    expect(player.incomePosition).toBe(10 - 3);
    expect(result.state.market.loanPoolRemaining).toBe(29);
    expect(result.state.actionsTakenThisTurn).toBe(1);
  });

  it('rejects when the shared loan pool is exhausted', () => {
    const state = { ...makeTestState(), market: { ...makeTestState().market, loanPoolRemaining: 0 } };
    const result = applyLoan(state, { type: 'loan', playerId: 'p1' });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/No loans remaining/);
  });

  it('rejects when it is not the acting player\'s turn', () => {
    const state = makeTestState();
    const result = applyLoan(state, { type: 'loan', playerId: 'p2' });
    expect(result.ok).toBe(false);
  });

  it('clamps the income position at the track floor', () => {
    const state = patchPlayer(makeTestState(), 'p1', { incomePosition: -9 });
    const result = applyLoan(state, { type: 'loan', playerId: 'p1' });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const player = result.state.players.find((p) => p.id === 'p1')!;
    expect(player.incomePosition).toBe(-10);
  });
});
