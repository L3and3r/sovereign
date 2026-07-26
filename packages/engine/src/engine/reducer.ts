import type { ActionResult, GameAction } from '../types/actions';
import type { GameState } from '../types/state';
import { applyAutomaUndercut } from './actions/automaUndercut';
import { applyBuild } from './actions/build';
import { applyConfiscate } from './actions/confiscate';
import { applyDevelop } from './actions/develop';
import { applyLoan } from './actions/loan';
import { applyNetwork } from './actions/network';
import { applyPassReaction } from './actions/passReaction';
import { applySell } from './actions/sell';
import { applyStartNextEra } from './actions/startNextEra';
import { applyEndTurn } from './turn';

export function dispatch(state: GameState, action: GameAction): ActionResult {
  if (state.pendingReaction && action.type !== 'confiscate' && action.type !== 'passReaction') {
    return { ok: false, error: 'Er is een reactievenster actief — wacht tot alle spelers hebben gereageerd', state };
  }

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
    case 'confiscate':
      return applyConfiscate(state, action);
    case 'passReaction':
      return applyPassReaction(state, action);
    case 'automaUndercut':
      return applyAutomaUndercut(state, action);
    default: {
      const exhaustive: never = action;
      throw new Error(`Unhandled action: ${JSON.stringify(exhaustive)}`);
    }
  }
}
