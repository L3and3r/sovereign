import type { IndustryType } from '@sovereign/engine';

/** Small geometric vector icons per industry type, drawn on a -12..12 grid so they can be
 * scaled/reused both inside the SVG board and inside an HTML card's inline <svg>. */
export function IndustryIconPaths({ type, color = '#141a20' }: { type: IndustryType; color?: string }) {
  switch (type) {
    case 'energiecentrale':
      return <path d="M1,-7 L-4,1.5 L-0.5,1.5 L-1.5,7 L4.5,-1.5 L1,-1.5 Z" fill={color} />;
    case 'infrastructuur':
      return (
        <g fill={color}>
          <circle r={3.2} fill="none" stroke={color} strokeWidth={1.8} />
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <rect key={deg} x={-0.8} y={-6.2} width={1.6} height={2.4} transform={`rotate(${deg})`} />
          ))}
        </g>
      );
    case 'handelspost':
      return (
        <g fill="none" stroke={color} strokeWidth={1.5}>
          <ellipse cx={0} cy={3.2} rx={4.4} ry={1.5} />
          <ellipse cx={0} cy={0} rx={4.4} ry={1.5} />
          <ellipse cx={0} cy={-3.2} rx={4.4} ry={1.5} />
        </g>
      );
    case 'netwerkhub':
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
      return (
        <g fill="none" stroke={color} strokeWidth={1.4}>
          <path d="M0,-3.5 C-2,-4.8 -4.6,-4.6 -4.6,-3.2 L-4.6,3.5 C-4.6,2.2 -2,2.2 0,3.5 Z" />
          <path d="M0,-3.5 C2,-4.8 4.6,-4.6 4.6,-3.2 L4.6,3.5 C4.6,2.2 2,2.2 0,3.5 Z" />
        </g>
      );
    case 'kluis':
      return (
        <g>
          <path d="M-2.2,-1.2 L-2.2,-3.2 a2.2,2.2 0 0 1 4.4,0 L2.2,-1.2" fill="none" stroke={color} strokeWidth={1.5} />
          <rect x={-3.4} y={-1.2} width={6.8} height={5.4} rx={1} fill={color} />
        </g>
      );
    default:
      return null;
  }
}
