import type { IndustryType } from '@sovereign/engine';
import { INDUSTRY_COLORS } from '../../styles/tokens';

export function IndustryTileIcon({
  type,
  level,
  flipped,
  size = 22,
}: {
  type: IndustryType;
  level: number;
  flipped: boolean;
  size?: number;
}) {
  const color = INDUSTRY_COLORS[type] ?? '#999999';
  const half = size / 2;

  return (
    <g>
      <rect
        x={-half}
        y={-half}
        width={size}
        height={size}
        rx={4}
        fill={color}
        stroke={flipped ? '#ffffff' : '#00000066'}
        strokeWidth={flipped ? 2 : 1}
      />
      {Array.from({ length: level }).map((_, i) => (
        <circle key={i} cx={-half + 5 + i * 6} cy={half - 5} r={1.6} fill="#ffffff" />
      ))}
    </g>
  );
}
