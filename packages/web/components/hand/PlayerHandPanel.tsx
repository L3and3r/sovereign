import type { PlayerState } from '@sovereign/engine';
import { CardIcon } from './CardIcon';

export function PlayerHandPanel({ player }: { player: PlayerState }) {
  return (
    <div style={{ marginTop: '0.5rem' }}>
      <strong>Hand van {player.name}:</strong>
      <div>
        {player.hand.map((cardId, i) => (
          <CardIcon key={`${cardId}-${i}`} cardId={cardId} />
        ))}
        {player.hand.length === 0 && <em>leeg</em>}
      </div>
    </div>
  );
}
