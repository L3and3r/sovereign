import type { GameState } from '@sovereign/engine';
import { colorForPlayerIndex } from '../../styles/tokens';

export function TurnBanner({ state }: { state: GameState }) {
  const player = state.players[state.currentPlayerIndex]!;
  return (
    <div className="turn-banner">
      <span
        className="player-portrait"
        style={{ background: colorForPlayerIndex(state.currentPlayerIndex), width: 22, height: 22, fontSize: '0.65rem' }}
      >
        {player.name.charAt(0).toUpperCase()}
      </span>
      <span>
        RONDE {String(state.roundNumber).padStart(2, '0')} — AAN ZET:{' '}
        <strong style={{ color: colorForPlayerIndex(state.currentPlayerIndex) }}>{player.name}</strong>
      </span>
      <span className="turn-cursor" style={{ color: colorForPlayerIndex(state.currentPlayerIndex) }} />
      <span style={{ marginLeft: 'auto' }}>
        {state.actionsTakenThisTurn}/2 acties &middot; {state.deck.length} kaarten in stapel
      </span>
    </div>
  );
}
