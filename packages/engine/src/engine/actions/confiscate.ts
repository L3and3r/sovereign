import { CARD_DEFS_BY_ID } from '../../data/cards.data';
import { CONFISCATE_INCOME_PENALTY } from '../../data/market.data';
import { getPlayer } from '../../selectors/player';
import type { ActionResult, GameAction } from '../../types/actions';
import type { GameState } from '../../types/state';
import { clampIncomePosition } from '../incomeTrack';
import { playerHasCard, removeCardFromHand } from '../validators';

type ConfiscateAction = Extract<GameAction, { type: 'confiscate' }>;

function fail(state: GameState, error: string): ActionResult {
  return { ok: false, error, state };
}

export function applyConfiscate(state: GameState, action: ConfiscateAction): ActionResult {
  const pendingReaction = state.pendingReaction;
  if (!pendingReaction) return fail(state, 'Er is geen reactievenster actief');
  if (!pendingReaction.eligiblePlayerIds.includes(action.playerId)) {
    return fail(state, 'Je kunt nu niet reageren');
  }

  const player = getPlayer(state, action.playerId);
  if (!playerHasCard(player, action.cardId)) return fail(state, 'Kaart niet op de hand');
  const card = CARD_DEFS_BY_ID[action.cardId];
  if (!card || card.type !== 'dreiging') return fail(state, 'Deze kaart is geen Dreigingskaart');

  const tile = state.tiles.find((t) => t.id === action.targetTileId);
  if (!tile) return fail(state, 'Onbekende tegel');
  if (tile.ownerId !== pendingReaction.triggerPlayerId) {
    return fail(state, 'Je kunt alleen de tegels van de verkopende speler doelwit maken');
  }
  if (tile.disabled) return fail(state, 'Deze tegel is al buiten werking gesteld');

  const hasProtectingKluis = state.tiles.some(
    (t) => t.regionId === tile.regionId && t.type === 'kluis' && t.ownerId === tile.ownerId,
  );
  if (hasProtectingKluis) return fail(state, 'Deze tegel is beschermd door een Kluis in deze regio');

  const targetOwner = getPlayer(state, tile.ownerId);
  const updatedTargetOwner = {
    ...targetOwner,
    incomePosition: clampIncomePosition(targetOwner.incomePosition - CONFISCATE_INCOME_PENALTY),
  };
  const updatedActingPlayer = removeCardFromHand(player, action.cardId);

  const remainingEligible = pendingReaction.eligiblePlayerIds.filter((id) => id !== action.playerId);

  return {
    ok: true,
    state: {
      ...state,
      tiles: state.tiles.map((t) => (t.id === tile.id ? { ...t, disabled: true } : t)),
      players: state.players.map((p) => {
        if (p.id === updatedTargetOwner.id) return updatedTargetOwner;
        if (p.id === updatedActingPlayer.id) return updatedActingPlayer;
        return p;
      }),
      discard: [...state.discard, action.cardId],
      pendingReaction:
        remainingEligible.length > 0 ? { ...pendingReaction, eligiblePlayerIds: remainingEligible } : undefined,
    },
  };
}
