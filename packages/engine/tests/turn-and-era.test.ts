import { describe, expect, it } from 'vitest';
import { applyEndTurn } from '../src/engine/turn';
import { makeTestState, patchPlayer, patchState } from './fixtures/makeTestState';

describe('applyEndTurn', () => {
  it('refills the hand up to the starting hand size and advances to the next player', () => {
    const base = makeTestState(['Alice', 'Bob']);
    const player = base.players[0]!;
    const state = patchPlayer(base, 'p1', { hand: player.hand.slice(0, 6) });
    const deckLengthBefore = state.deck.length;

    const result = applyEndTurn(state, { type: 'endTurn', playerId: 'p1' });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const refilled = result.state.players.find((p) => p.id === 'p1')!;
    expect(refilled.hand).toHaveLength(8);
    expect(result.state.deck).toHaveLength(deckLengthBefore - 2);
    expect(result.state.currentPlayerIndex).toBe(1);
    expect(result.state.actionsTakenThisTurn).toBe(0);
  });

  it('runs the income phase and increments the round number when wrapping back to player 0', () => {
    const base = makeTestState(['Alice', 'Bob']);
    const state = patchState(base, { currentPlayerIndex: 1 });

    const result = applyEndTurn(state, { type: 'endTurn', playerId: 'p2' });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.state.currentPlayerIndex).toBe(0);
    expect(result.state.roundNumber).toBe(2);
    const p1 = result.state.players.find((p) => p.id === 'p1')!;
    // starting incomePosition 10 -> income track value 10 for that position
    expect(p1.sats).toBe(30 + 10);
  });

  it('ends the era once the deck and all hands are empty, and scores VP from flipped tiles + links', () => {
    const base = makeTestState(['Alice', 'Bob']);
    const state = patchState(base, {
      deck: [],
      players: base.players.map((p) => ({ ...p, hand: [] })),
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
          flipped: false, // unflipped -> should NOT count toward VP
        },
      ],
      links: [{ id: 'link-1', regionA: 'zoutmeer-vrijhaven', regionB: 'berghold', ownerId: 'p1' }],
    });

    const result = applyEndTurn(state, { type: 'endTurn', playerId: 'p1' });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.state.phase).toBe('eraEnded');
    // handelspost level 2 = 5 VP (see industries.data.ts), + 1 link VP = 6
    expect(result.state.finalScores!.p1).toEqual({ flippedVp: 5, linkVp: 1, total: 6 });
    const p1 = result.state.players.find((p) => p.id === 'p1')!;
    expect(p1.vp).toBe(6);
    const p2 = result.state.players.find((p) => p.id === 'p2')!;
    expect(p2.vp).toBe(0);
  });

  it('rejects ending the turn when it is not the acting player\'s turn', () => {
    const state = makeTestState();
    const result = applyEndTurn(state, { type: 'endTurn', playerId: 'p2' });
    expect(result.ok).toBe(false);
  });

  it('rejects ending the turn once the era has already ended', () => {
    const state = patchState(makeTestState(), { phase: 'eraEnded' });
    const result = applyEndTurn(state, { type: 'endTurn', playerId: 'p1' });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/al afgelopen/);
  });
});
