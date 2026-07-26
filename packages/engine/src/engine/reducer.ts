import type { ActionResult, GameAction } from '../types/actions';
import type { GameState } from '../types/state';
import { applyBuild } from './actions/build';
import { applyDevelop } from './actions/develop';
import { applyLoan } from './actions/loan';
import { applyNetwork } from './actions/network';
import { applySell } from './actions/sell';
import { applyStartNextEra } from './actions/startNextEra';
import { applyEndTurn } from './turn';

export function dispatch(state: GameState, action: GameAction): ActionResult {
  switch (action.type) {
    case 'build':
      return applyBuild(state, action);
    case 'network':
      return applyNetwork(state, action);
    case 'develop':
      return applyDevelop(state, action);
    case 'sell':
      return applySell(state, action);
    case 'loan':
      return applyLoan(state, action);
    case 'endTurn':
      return applyEndTurn(state, action);
    case 'startNextEra':
      return applyStartNextEra(state, action);
    default: {
      const exhaustive: never = action;
      throw new Error(`Unhandled action: ${JSON.stringify(exhaustive)}`);
    }
  }
}
