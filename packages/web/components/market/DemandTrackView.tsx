import type { DemandTrack } from '@sovereign/engine';

export function DemandTrackView({ track, label }: { track: DemandTrack; label: string }) {
  return (
    <div style={{ marginTop: '0.5rem' }}>
      <strong>{label}:</strong>{' '}
      <span style={{ fontFamily: 'monospace' }}>
        {track.rungs.map((value, i) => (
          <span
            key={i}
            style={{
              display: 'inline-block',
              width: 24,
              textAlign: 'center',
              padding: '2px 0',
              margin: '0 1px',
              borderRadius: 3,
              background: i < track.nextIndex ? '#2a2f3a' : '#4caf50',
              color: i < track.nextIndex ? '#666' : '#0a0a0a',
              textDecoration: i < track.nextIndex ? 'line-through' : 'none',
            }}
          >
            {value}
          </span>
        ))}
      </span>
    </div>
  );
}
