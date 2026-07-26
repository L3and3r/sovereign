import { getPlayer } from '../../selectors/player';
import type { ActionResult, GameAction } from '../../types/actions';
import type { GameState } from '../../types/state';
import { validateCanTakeAction } from '../turnGuard';

type AutomaUndercutAction = Extract<GameAction, { type: 'automaUndercut' }>;

function fail(state: GameState, error: string): ActionResult {
  return { ok: false, error, state };
}

/**
 * Automa-only "marktverdringing": directly worsens the shared Handelspost demand track,
 * simulating a phantom sale without needing a real connected Handelspost - the automa doesn't
 * need real economic logic (game-concept.md §11), just a way to create scarcity for the human.
 */
export function applyAutomaUndercut(state: GameState, action: AutomaUndercutAction): ActionResult {
  const turnError = validateCanTakeAction(state, action.playerId);
  if (turnError) return fail(state, turnError);

  const player = getPlayer(state, action.playerId);
  if (!player.isAutoma) return fail(state, 'Alleen de automa kan de markt verdringen');

  const track = state.market.handelspostDemand;
  if (track.nextIndex >= track.rungs.length) return fail(state, 'Handelspost-vraagbalk is uitgeput');

  const rungs = player.automaConfig?.undercutRungsPerUse ?? 1;
  const nextIndex = Math.min(track.rungs.length, track.nextIndex + rungs);

  return {
    ok: true,
    state: {
      ...state,
      market: { ...state.market, handelspostDemand: { ...track, nextIndex } },
      actionsTakenThisTurn: state.actionsTakenThisTurn + 1,
    },
  };
}
