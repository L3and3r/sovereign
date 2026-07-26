import type { IndustryType } from '@sovereign/engine';
import { INDUSTRY_COLORS } from '../../styles/tokens';
import { IndustryIconPaths } from './IndustryIconPaths';

export function IndustryTileIcon({
  type,
  level,
  flipped,
  size = 24,
}: {
  type: IndustryType;
  level: number;
  flipped: boolean;
  size?: number;
}) {
  const color = INDUSTRY_COLORS[type] ?? '#999999';
  const r = size / 2;

  return (
    <g filter="url(#tile-shadow)">
      <circle r={r} fill={color} stroke={flipped ? '#ffffff' : 'rgba(0,0,0,0.45)'} strokeWidth={flipped ? 2 : 1.2} />
      <g transform={`scale(${r / 12})`}>
        <IndustryIconPaths type={type} />
      </g>
      {Array.from({ length: level }).map((_, i) => (
        <circle key={i} cx={-((level - 1) * 3) / 2 + i * 3} cy={r + 4} r={1.3} fill="#e8e6e1" />
      ))}
    </g>
  );
}
