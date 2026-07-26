import type { DemandTrack } from '@sovereign/engine';

export function DemandTrackView({ track, label }: { track: DemandTrack; label: string }) {
  return (
    <div>
      <p className="panel-title" style={{ marginBottom: '0.4rem' }}>
        {label}
      </p>
      <div>
        {track.rungs.map((value, i) => (
          <span
            key={i}
            className="track-rung"
            style={{
              background: i < track.nextIndex ? 'var(--surface-raised)' : 'var(--accent-soft)',
              color: i < track.nextIndex ? 'var(--text-faint)' : 'var(--accent)',
              textDecoration: i < track.nextIndex ? 'line-through' : 'none',
              border: `1px solid ${i < track.nextIndex ? 'var(--border)' : 'var(--accent)'}`,
            }}
          >
            {value}
          </span>
        ))}
      </div>
    </div>
  );
}
