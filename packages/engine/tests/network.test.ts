import { describe, expect, it } from 'vitest';
import { applyNetwork } from '../src/engine/actions/network';
import type { GameAction } from '../src/types/actions';
import { giveCard, makeTestState } from './fixtures/makeTestState';

function networkAction(overrides: Partial<Extract<GameAction, { type: 'network' }>> = {}) {
  return {
    type: 'network' as const,
    playerId: 'p1',
    regionA: 'zoutmeer-vrijhaven',
    regionB: 'berghold',
    cardId: 'card-wildcard-region',
    ...overrides,
  };
}

describe('applyNetwork', () => {
  it('builds a link between adjacent regions, buying bandwidth shortfall via the fallback market', () => {
    const state = makeTestState();
    const result = applyNetwork(state, networkAction());

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const player = result.state.players.find((p) => p.id === 'p1')!;
    // cost 3 sats + 2 bandwidth; player has 0 bandwidth -> shortfall 2 * 3 sats/unit = 6 -> total 9
    expect(player.sats).toBe(30 - 9);
    expect(player.bandwidth).toBe(0);
    expect(result.state.links).toHaveLength(1);
    expect(result.state.links[0]).toMatchObject({ regionA: 'zoutmeer-vrijhaven', regionB: 'berghold' });
    expect(result.state.actionsTakenThisTurn).toBe(1);
  });

  it('applies the border surcharge when either endpoint has a border marker', () => {
    const state = makeTestState();
    const result = applyNetwork(state, networkAction({ regionA: 'berghold', regionB: 'grensland' }));

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const player = result.state.players.find((p) => p.id === 'p1')!;
    // base 3 sats + 2 bandwidth, + surcharge 2 sats + 1 bandwidth = 5 sats + 3 bandwidth
    // shortfall 3 bandwidth * 3 sats/unit = 9 -> total 14
    expect(player.sats).toBe(30 - 14);
  });

  it('rejects non-adjacent regions', () => {
    const state = makeTestState();
    const result = applyNetwork(state, networkAction({ regionA: 'zoutmeer-vrijhaven', regionB: 'cryptavallei' }));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/grenzen niet aan elkaar/);
  });

  it('rejects building a duplicate link', () => {
    const state = makeTestState();
    const first = applyNetwork(state, networkAction());
    expect(first.ok).toBe(true);
    if (!first.ok) return;

    const stateWithCard = giveCard(first.state, 'p1', 'card-region-berghold');
    const second = applyNetwork(
      stateWithCard,
      networkAction({ regionA: 'berghold', regionB: 'zoutmeer-vrijhaven', cardId: 'card-region-berghold' }),
    );
    expect(second.ok).toBe(false);
    if (second.ok) return;
    expect(second.error).toMatch(/bestaat al/);
  });

  it('rejects a region card that matches neither endpoint', () => {
    const state = giveCard(makeTestState(), 'p1', 'card-region-zoutmeer-vrijhaven');
    const result = applyNetwork(
      state,
      networkAction({ regionA: 'berghold', regionB: 'grensland', cardId: 'card-region-zoutmeer-vrijhaven' }),
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/komt niet overeen/);
  });

  it('rejects industry cards for building links', () => {
    const state = giveCard(makeTestState(), 'p1', 'card-industry-handelspost');
    const result = applyNetwork(state, networkAction({ cardId: 'card-industry-handelspost' }));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/kan niet gebruikt worden/);
  });
});
