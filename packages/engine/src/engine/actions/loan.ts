import { LOAN_AMOUNT_SATS, LOAN_PENALTY_INCOME_POSITIONS } from '../../data/market.data';
import { getPlayer } from '../../selectors/player';
import type { ActionResult, GameAction } from '../../types/actions';
import type { GameState } from '../../types/state';
import { clampIncomePosition } from '../incomeTrack';
import { validateCanTakeAction } from '../turnGuard';

type LoanAction = Extract<GameAction, { type: 'loan' }>;

function fail(state: GameState, error: string): ActionResult {
  return { ok: false, error, state };
}

export function applyLoan(state: GameState, action: LoanAction): ActionResult {
  const turnError = validateCanTakeAction(state, action.playerId);
  if (turnError) return fail(state, turnError);

  if (state.market.loanPoolRemaining <= 0) return fail(state, 'No loans remaining in the shared pool');

  const player = getPlayer(state, action.playerId);
  const updatedPlayer = {
    ...player,
    sats: player.sats + LOAN_AMOUNT_SATS,
    incomePosition: clampIncomePosition(player.incomePosition - LOAN_PENALTY_INCOME_POSITIONS),
  };

  return {
    ok: true,
    state: {
      ...state,
      players: state.players.map((p) => (p.id === updatedPlayer.id ? updatedPlayer : p)),
      market: { ...state.market, loanPoolRemaining: state.market.loanPoolRemaining - 1 },
      actionsTakenThisTurn: state.actionsTakenThisTurn + 1,
    },
  };
}
