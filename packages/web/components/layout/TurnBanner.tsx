import type { GameState } from '@sovereign/engine';
import { colorForPlayerIndex } from '../../styles/tokens';

export function TurnBanner({ state }: { state: GameState }) {
  const player = state.players[state.currentPlayerIndex]!;
  return (
    <p>
      Ronde {state.roundNumber} — Aan zet:{' '}
      <strong style={{ color: colorForPlayerIndex(state.currentPlayerIndex) }}>{player.name}</strong> (
      {state.actionsTakenThisTurn}/2 acties, {state.deck.length} kaarten in stapel)
    </p>
  );
}
