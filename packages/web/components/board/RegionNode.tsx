import type { IndustryTileInstance, Region } from '@sovereign/engine';
import { IndustryTileIcon } from './IndustryTileIcon';

export function RegionNode({
  region,
  position,
  tileById,
}: {
  region: Region;
  position: { x: number; y: number };
  tileById: Map<string, IndustryTileInstance>;
}) {
  return (
    <g transform={`translate(${position.x}, ${position.y})`} filter="url(#region-shadow)">
      <circle
        r={46}
        fill="url(#region-fill)"
        stroke={region.hasBorderMarker ? '#e5484d' : '#4a5568'}
        strokeWidth={region.hasBorderMarker ? 3 : 1.5}
      />
      <circle r={46} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={1} transform="translate(-1,-1)" />
      <text
        y={-54}
        textAnchor="middle"
        fontSize={11}
        fontFamily="var(--font-mono), ui-monospace, monospace"
        letterSpacing="0.02em"
        fill="#e8e6e1"
      >
        {region.name}
      </text>
      {region.slots.map((slot, i) => {
        const angle = (i / region.slots.length) * Math.PI * 2 - Math.PI / 2;
        const sx = Math.cos(angle) * 26;
        const sy = Math.sin(angle) * 26;
        const tile = slot.occupiedByTileId ? tileById.get(slot.occupiedByTileId) : undefined;
        return (
          <g key={slot.id} transform={`translate(${sx}, ${sy})`}>
            {tile ? (
              <IndustryTileIcon type={tile.type} level={tile.level} flipped={tile.flipped} />
            ) : (
              <rect x={-11} y={-11} width={22} height={22} rx={4} fill="none" stroke="#3a4451" strokeDasharray="3 2" />
            )}
          </g>
        );
      })}
    </g>
  );
}
