import type { IndustryType } from '@sovereign/engine';

/** Small geometric vector illustrations per industry type, drawn on a roughly -12..12 grid so
 * they can be scaled/reused both inside the SVG board and inside an HTML card's inline <svg>.
 * Deliberately abstract/vector (no illustrative art) per the game's art direction, but each one
 * reads as a distinct silhouette rather than a generic glyph. */
export function IndustryIconPaths({ type, color = '#141a20' }: { type: IndustryType; color?: string }) {
  switch (type) {
    case 'energiecentrale':
      // Wind turbine: tower + hub + three angled blades.
      return (
        <g>
          <rect x={-0.7} y={-2} width={1.4} height={9} rx={0.4} fill={color} />
          <path d="M0,-2 L-1.1,-9.3 L0.9,-8.2 Z" fill={color} transform="rotate(-10 0 -2)" />
          <path d="M0,-2 L-1.1,-9.3 L0.9,-8.2 Z" fill={color} transform="rotate(110 0 -2)" />
          <path d="M0,-2 L-1.1,-9.3 L0.9,-8.2 Z" fill={color} transform="rotate(230 0 -2)" />
          <circle cx={0} cy={-2} r={1.1} fill={color} />
        </g>
      );
    case 'infrastructuur':
      // A road receding to the horizon, with a dashed centerline.
      return (
        <g>
          <path d="M-6.5,7 L-1.6,-7 L1.6,-7 L6.5,7 Z" fill={color} />
          <line x1={0} y1={6.5} x2={0} y2={-6.5} stroke="#0000004d" strokeWidth={1.1} strokeDasharray="1.6 1.6" />
        </g>
      );
    case 'handelspost':
      // Market stall: triangular awning over a counter, small pennant flag.
      return (
        <g fill={color}>
          <path d="M-6.2,-2.6 L0,-8.4 L6.2,-2.6 Z" />
          <rect x={-4.6} y={-2.6} width={9.2} height={5.4} opacity={0.85} />
          <line x1={0} y1={-8.4} x2={0} y2={-10.4} stroke={color} strokeWidth={1} />
          <path d="M0,-10.4 L3,-9.4 L0,-8.4 Z" />
        </g>
      );
    case 'netwerkhub':
      // Three-node relay network.
      return (
        <g stroke={color} strokeWidth={1.3} fill={color}>
          <line x1={0} y1={0} x2={-4} y2={3.5} />
          <line x1={0} y1={0} x2={4} y2={3.5} />
          <line x1={0} y1={0} x2={0} y2={-4.5} />
          <circle cx={0} cy={-4.5} r={1.4} />
          <circle cx={-4} cy={3.5} r={1.4} />
          <circle cx={4} cy={3.5} r={1.4} />
          <circle cx={0} cy={0} r={1.7} />
        </g>
      );
    case 'mediaEnEducatie':
      // Open book with broadcast arcs radiating above it.
      return (
        <g>
          <g fill="none" stroke={color} strokeWidth={1.3}>
            <path d="M0,-2.5 C-1.5,-3.5 -4,-3.5 -4,-2.5 L-4,3.5 C-4,2.5 -1.5,2.5 0,3.5 Z" />
            <path d="M0,-2.5 C1.5,-3.5 4,-3.5 4,-2.5 L4,3.5 C4,2.5 1.5,2.5 0,3.5 Z" />
          </g>
          <path d="M-2.2,-6 A3.1,3.1 0 0 1 2.2,-6" fill="none" stroke={color} strokeWidth={1} opacity={0.75} />
          <path d="M-3.6,-7.6 A5.2,5.2 0 0 1 3.6,-7.6" fill="none" stroke={color} strokeWidth={1} opacity={0.45} />
        </g>
      );
    case 'kluis':
      // Vault door: bolt wheel with radiating locking bars.
      return (
        <g stroke={color} strokeWidth={1.3}>
          <circle r={5.2} fill="none" />
          <circle r={1.6} fill={color} stroke="none" />
          {[0, 60, 120, 180, 240, 300].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <line
                key={deg}
                x1={Math.cos(rad) * 1.9}
                y1={Math.sin(rad) * 1.9}
                x2={Math.cos(rad) * 4.6}
                y2={Math.sin(rad) * 4.6}
              />
            );
          })}
        </g>
      );
    default:
      return null;
  }
}
