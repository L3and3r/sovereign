import { INCOME_TRACK_MAX_POSITION, INCOME_TRACK_MIN_POSITION, type PlayerState } from '@sovereign/engine';
import { colorForPlayerIndex } from '../../styles/tokens';

export function IncomeTrackView({ players }: { players: PlayerState[] }) {
  const min = INCOME_TRACK_MIN_POSITION;
  const max = INCOME_TRACK_MAX_POSITION;
  const range = max - min;

  return (
    <div style={{ marginTop: '0.5rem' }}>
      <strong>Inkomenstrack:</strong>
      <div style={{ position: 'relative', height: 28, background: '#1b1f27', borderRadius: 4, marginTop: 4 }}>
        {players.map((p, i) => {
          const pct = ((p.incomePosition - min) / range) * 100;
          return (
            <div
              key={p.id}
              title={`${p.name}: ${p.incomePosition}`}
              style={{
                position: 'absolute',
                left: `calc(${pct}% - 6px)`,
                top: 2,
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: colorForPlayerIndex(i),
                border: '2px solid #fff',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
