import { INCOME_TRACK_MAX_POSITION, INCOME_TRACK_MIN_POSITION, type PlayerState } from '@sovereign/engine';
import { colorForPlayerIndex } from '../../styles/tokens';

export function IncomeTrackView({ players }: { players: PlayerState[] }) {
  const min = INCOME_TRACK_MIN_POSITION;
  const max = INCOME_TRACK_MAX_POSITION;
  const range = max - min;

  return (
    <div>
      <p className="panel-title" style={{ marginBottom: '0.4rem' }}>
        Inkomenstrack
      </p>
      <div style={{ position: 'relative', height: 24, background: 'var(--surface-raised)', borderRadius: 999, border: '1px solid var(--border)' }}>
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
                border: '2px solid var(--bg)',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
