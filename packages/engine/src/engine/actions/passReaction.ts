import type { ActionResult, GameAction } from '../../types/actions';
import type { GameState } from '../../types/state';

type PassReactionAction = Extract<GameAction, { type: 'passReaction' }>;

function fail(state: GameState, error: string): ActionResult {
  return { ok: false, error, state };
}

export function applyPassReaction(state: GameState, action: PassReactionAction): ActionResult {
  const pendingReaction = state.pendingReaction;
  if (!pendingReaction) return fail(state, 'Er is geen reactievenster actief');
  if (!pendingReaction.eligiblePlayerIds.includes(action.playerId)) {
    return fail(state, 'Je kunt nu niet reageren');
  }

  const remainingEligible = pendingReaction.eligiblePlayerIds.filter((id) => id !== action.playerId);

  return {
    ok: true,
    state: {
      ...state,
      pendingReaction:
        remainingEligible.length > 0 ? { ...pendingReaction, eligiblePlayerIds: remainingEligible } : undefined,
    },
  };
}
