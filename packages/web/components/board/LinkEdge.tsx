import { colorForPlayerIndex } from '../../styles/tokens';

export function LinkEdge({
  a,
  b,
  ownerIndex,
  highlighted = false,
  onClick,
}: {
  a: { x: number; y: number };
  b: { x: number; y: number };
  ownerIndex?: number;
  highlighted?: boolean;
  onClick?: () => void;
}) {
  const built = ownerIndex !== undefined;
  return (
    <g onClick={!built && onClick ? onClick : undefined} style={{ cursor: !built && onClick ? 'pointer' : 'default' }}>
      {!built && highlighted && (
        <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#f7931a" strokeWidth={8} strokeLinecap="round" opacity={0.25} />
      )}
      <line
        x1={a.x}
        y1={a.y}
        x2={b.x}
        y2={b.y}
        stroke={built ? colorForPlayerIndex(ownerIndex) : highlighted ? '#f7931a' : '#3a4451'}
        strokeWidth={built ? 4 : highlighted ? 2.5 : 1.5}
        strokeLinecap="round"
        strokeDasharray={built ? undefined : '4 5'}
        filter={built ? 'url(#link-glow)' : undefined}
      />
      {/* wide invisible hit-area so a thin dashed line is still easy to click */}
      {!built && onClick && (
        <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="transparent" strokeWidth={16} />
      )}
    </g>
  );
}
