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
  const ownerColor = built ? colorForPlayerIndex(ownerIndex) : undefined;
  const midX = (a.x + b.x) / 2;
  const midY = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy) || 1;
  const ux = dx / length;
  const uy = dy / length;
  // Pads sit just outside the coin's edge (radius ~46-50), not at dead-center where the
  // region plate (drawn on top of links) would hide them entirely.
  const padOffset = 50;
  const padA = { x: a.x + ux * padOffset, y: a.y + uy * padOffset };
  const padB = { x: b.x - ux * padOffset, y: b.y - uy * padOffset };

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
        stroke={built ? ownerColor : highlighted ? '#f7931a' : '#3a4451'}
        strokeWidth={built ? 3 : highlighted ? 2.5 : 1.5}
        strokeLinecap="round"
        strokeDasharray={built ? undefined : '0.5 6'}
        filter={built ? 'url(#link-glow)' : undefined}
      />
      {/* Circuit-trace via pads at each end + the midpoint, echoing the network/ledger theme. */}
      {built && (
        <>
          <rect x={padA.x - 2.5} y={padA.y - 2.5} width={5} height={5} fill={ownerColor} />
          <rect x={padB.x - 2.5} y={padB.y - 2.5} width={5} height={5} fill={ownerColor} />
          <rect x={midX - 2} y={midY - 2} width={4} height={4} fill={ownerColor} opacity={0.85} />
        </>
      )}
      {/* wide invisible hit-area so a thin dashed line is still easy to click */}
      {!built && onClick && (
        <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="transparent" strokeWidth={16} />
      )}
    </g>
  );
}
