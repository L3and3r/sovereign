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
    <g transform={`translate(${position.x}, ${position.y})`}>
      <circle
        r={46}
        fill="#1b1f27"
        stroke={region.hasBorderMarker ? '#e63946' : '#4a4f5a'}
        strokeWidth={region.hasBorderMarker ? 3 : 1.5}
      />
      <text y={-54} textAnchor="middle" fontSize={12} fill="#e5e7eb">
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
              <rect x={-11} y={-11} width={22} height={22} rx={4} fill="none" stroke="#4a4f5a" strokeDasharray="3 2" />
            )}
          </g>
        );
      })}
    </g>
  );
}
