import { describe, expect, it } from 'vitest';
import { pickAutomaAction, pickAutomaReaction } from '../src/automa/automa';
import { AUTOMA_PRESETS } from '../src/automa/automaConfig';
import { applyAutomaUndercut } from '../src/engine/actions/automaUndercut';
import { HANDELAAR_BOT, simulateGame } from './fixtures/bot';
import { makeTestState, patchPlayer, patchState } from './fixtures/makeTestState';

function withAutoma(difficulty: keyof typeof AUTOMA_PRESETS = 'gemiddeld') {
  const base = patchState(makeTestState(), { currentPlayerIndex: 1 });
  return patchPlayer(base, 'p2', { isAutoma: true, automaConfig: AUTOMA_PRESETS[difficulty] });
}

/** The seeded starting deck can coincidentally deal a dreiging card to a hand already - strip
 * any before attaching the one a test cares about, so assertions don't depend on shuffle luck. */
function withoutDreigingCards(state: ReturnType<typeof makeTestState>, playerId: string) {
  const player = state.players.find((p) => p.id === playerId)!;
  return patchPlayer(state, playerId, {
    hand: player.hand.filter((id) => !id.startsWith('card-dreiging-')),
  });
}

describe('pickAutomaAction', () => {
  it('follows the configured priority order (build before develop for makkelijk)', () => {
    const state = withAutoma('makkelijk');
    const action = pickAutomaAction(state, 'p2');
    expect(action).not.toBeNull();
    expect(['build', 'develop', 'network', 'sell', 'loan']).toContain(action!.type);
  });

  it('never picks undercut when it is not in the priority list', () => {
    const state = patchState(withAutoma('makkelijk'), {
      market: {
        ...withAutoma('makkelijk').market,
        handelspostDemand: { rungs: [16], nextIndex: 0 },
      },
    });
    for (let i = 0; i < 20; i += 1) {
      const action = pickAutomaAction(state, 'p2');
      expect(action?.type).not.toBe('automaUndercut');
    }
  });

  it('picks undercut for moeilijk when the demand track still has room', () => {
    // Strip p2's hand and stock so every other action kind is impossible, isolating undercut.
    const base = withAutoma('moeilijk');
    const state = patchPlayer(base, 'p2', {
      hand: [],
      industryStock: { energiecentrale: [], infrastructuur: [], handelspost: [], netwerkhub: [], mediaEnEducatie: [], kluis: [] },
    });
    const action = pickAutomaAction(state, 'p2');
    expect(action).toEqual({ type: 'automaUndercut', playerId: 'p2' });
  });

  it('returns null for a non-automa player', () => {
    const state = makeTestState();
    expect(pickAutomaAction(state, 'p1')).toBeNull();
  });
});

describe('applyAutomaUndercut', () => {
  it('rejects a non-automa player', () => {
    const state = makeTestState();
    const result = applyAutomaUndercut(state, { type: 'automaUndercut', playerId: 'p1' });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/Alleen de automa/);
  });

  it('rejects when the demand track is already exhausted', () => {
    const base = withAutoma('gemiddeld');
    const state = patchState(base, {
      market: { ...base.market, handelspostDemand: { rungs: [16, 14], nextIndex: 2 } },
    });
    const result = applyAutomaUndercut(state, { type: 'automaUndercut', playerId: 'p2' });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/uitgeput/);
  });

  it('advances the demand track by the configured rung count and consumes an action', () => {
    const state = withAutoma('moeilijk'); // undercutRungsPerUse: 2
    const result = applyAutomaUndercut(state, { type: 'automaUndercut', playerId: 'p2' });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.market.handelspostDemand.nextIndex).toBe(2);
    expect(result.state.actionsTakenThisTurn).toBe(1);
  });
});

describe('pickAutomaReaction', () => {
  function reactionState(confiscateChance: number) {
    const base = withoutDreigingCards(withAutoma('gemiddeld'), 'p2');
    const withConfig = patchPlayer(base, 'p2', {
      automaConfig: { ...AUTOMA_PRESETS.gemiddeld, confiscateChance },
      hand: [...base.players[1]!.hand, 'card-dreiging-belastingcontrole'],
    });
    return patchState(withConfig, {
      pendingReaction: { triggerPlayerId: 'p1', eligiblePlayerIds: ['p2'] },
      tiles: [
        { id: 'tile-hp', type: 'handelspost', level: 1, ownerId: 'p1', regionId: 'zoutmeer-vrijhaven', slotId: 'b', flipped: false },
      ],
    });
  }

  it('always passes when confiscateChance is 0', () => {
    const state = reactionState(0);
    for (let i = 0; i < 10; i += 1) {
      expect(pickAutomaReaction(state, 'p2')).toEqual({ type: 'passReaction', playerId: 'p2' });
    }
  });

  it('always confiscates when confiscateChance is 1 and a valid target+card exist', () => {
    const state = reactionState(1);
    const action = pickAutomaReaction(state, 'p2');
    expect(action).toEqual({
      type: 'confiscate',
      playerId: 'p2',
      cardId: 'card-dreiging-belastingcontrole',
      targetTileId: 'tile-hp',
    });
  });

  it('passes regardless of chance when the automa has no dreiging card', () => {
    const base = withoutDreigingCards(withAutoma('gemiddeld'), 'p2');
    const withChance = patchPlayer(base, 'p2', { automaConfig: { ...AUTOMA_PRESETS.gemiddeld, confiscateChance: 1 } });
    const state = patchState(withChance, {
      pendingReaction: { triggerPlayerId: 'p1', eligiblePlayerIds: ['p2'] },
      tiles: [
        { id: 'tile-hp', type: 'handelspost', level: 1, ownerId: 'p1', regionId: 'zoutmeer-vrijhaven', slotId: 'b', flipped: false },
      ],
    });
    expect(pickAutomaReaction(state, 'p2')).toEqual({ type: 'passReaction', playerId: 'p2' });
  });

  it('passes when every tile of the trigger player is Kluis-protected', () => {
    const state = patchState(reactionState(1), {
      tiles: [
        { id: 'tile-hp', type: 'handelspost', level: 1, ownerId: 'p1', regionId: 'zoutmeer-vrijhaven', slotId: 'b', flipped: false },
        { id: 'tile-kluis', type: 'kluis', level: 1, ownerId: 'p1', regionId: 'zoutmeer-vrijhaven', slotId: 'c', flipped: true },
      ],
    });
    expect(pickAutomaReaction(state, 'p2')).toEqual({ type: 'passReaction', playerId: 'p2' });
  });
});

describe('automa vs. bot full-game simulation', () => {
  for (const difficulty of ['makkelijk', 'gemiddeld', 'moeilijk'] as const) {
    for (const seed of [1, 2, 3]) {
      it(`completes without crashing on ${difficulty} (seed ${seed})`, () => {
        const { state } = simulateGame(seed, ['Mens', 'Automa'], [HANDELAAR_BOT, HANDELAAR_BOT], {
          playerIndex: 1,
          config: AUTOMA_PRESETS[difficulty],
        });
        expect(state.phase).toBe('gameEnded');
      });
    }
  }
});
