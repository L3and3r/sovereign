import type { PlayerState } from '@sovereign/engine';
import { CardIcon } from './CardIcon';

export function PlayerHandPanel({ player }: { player: PlayerState }) {
  return (
    <div>
      <p className="panel-title" style={{ marginBottom: '0.2rem' }}>
        Hand van {player.name}
      </p>
      <div className="hand-row">
        {player.hand.map((cardId, i) => (
          <CardIcon key={`${cardId}-${i}`} cardId={cardId} />
        ))}
        {player.hand.length === 0 && <em style={{ color: 'var(--text-muted)' }}>leeg</em>}
      </div>
    </div>
  );
}
