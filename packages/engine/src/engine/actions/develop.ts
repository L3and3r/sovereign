import { DEVELOP_ENERGY_COST } from '../../data/industries.data';
import { getPlayer } from '../../selectors/player';
import type { ActionResult, GameAction } from '../../types/actions';
import type { GameState } from '../../types/state';
import { validateCanTakeAction } from '../turnGuard';
import { payResourceCost, playerHasCard, removeCardFromHand, resolveCostWithFallbackMarket } from '../validators';

type DevelopAction = Extract<GameAction, { type: 'develop' }>;

function fail(state: GameState, error: string): ActionResult {
  return { ok: false, error, state };
}

export function applyDevelop(state: GameState, action: DevelopAction): ActionResult {
  const turnError = validateCanTakeAction(state, action.playerId);
  if (turnError) return fail(state, turnError);

  const player = getPlayer(state, action.playerId);

  if (!playerHasCard(player, action.cardId)) return fail(state, 'Card not in hand');

  const stock = player.industryStock[action.industryType];
  if (!stock || stock.length === 0) return fail(state, 'No remaining tiles of this industry type to develop past');

  const { totalSats } = resolveCostWithFallbackMarket(
    player,
    DEVELOP_ENERGY_COST,
    state.market.energyPrice,
    state.market.bandwidthPrice,
  );
  if (player.sats < totalSats) return fail(state, 'Insufficient sats (including any market purchase of energy)');

  let updatedPlayer = payResourceCost(player, DEVELOP_ENERGY_COST, totalSats);
  updatedPlayer = removeCardFromHand(updatedPlayer, action.cardId);
  updatedPlayer = {
    ...updatedPlayer,
    industryStock: { ...updatedPlayer.industryStock, [action.industryType]: stock.slice(1) },
  };

  return {
    ok: true,
    state: {
      ...state,
      players: state.players.map((p) => (p.id === updatedPlayer.id ? updatedPlayer : p)),
      discard: [...state.discard, action.cardId],
      actionsTakenThisTurn: state.actionsTakenThisTurn + 1,
    },
  };
}
