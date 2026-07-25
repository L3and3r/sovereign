import { colorForPlayerIndex } from '../../styles/tokens';

export function LinkEdge({
  a,
  b,
  ownerIndex,
}: {
  a: { x: number; y: number };
  b: { x: number; y: number };
  ownerIndex?: number;
}) {
  const built = ownerIndex !== undefined;
  return (
    <line
      x1={a.x}
      y1={a.y}
      x2={b.x}
      y2={b.y}
      stroke={built ? colorForPlayerIndex(ownerIndex) : '#3a3f4a'}
      strokeWidth={built ? 4 : 1.5}
      strokeDasharray={built ? undefined : '4 4'}
    />
  );
}
