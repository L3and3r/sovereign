import type { IndustryTileInstance, Region } from '@sovereign/engine';
import { IndustryTileIcon } from './IndustryTileIcon';

export function RegionNode({
  region,
  position,
  tileById,
  highlightedSlotKeys,
  onSlotClick,
  selectableTileIds,
  selectedTileIds,
  onTileClick,
}: {
  region: Region;
  position: { x: number; y: number };
  tileById: Map<string, IndustryTileInstance>;
  highlightedSlotKeys?: Set<string>;
  onSlotClick?: (regionId: string, slotId: string) => void;
  selectableTileIds?: Set<string>;
  selectedTileIds?: Set<string>;
  onTileClick?: (tileId: string) => void;
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
        const slotKey = `${region.id}:${slot.id}`;
        const isHighlighted = !tile && !!highlightedSlotKeys?.has(slotKey);
        const isSelectableTile = !!tile && !!selectableTileIds?.has(tile.id);
        const isSelectedTile = !!tile && !!selectedTileIds?.has(tile.id);

        return (
          <g
            key={slot.id}
            transform={`translate(${sx}, ${sy})`}
            onClick={
              isHighlighted && onSlotClick
                ? () => onSlotClick(region.id, slot.id)
                : isSelectableTile && onTileClick && tile
                  ? () => onTileClick(tile.id)
                  : undefined
            }
            style={{ cursor: isHighlighted || isSelectableTile ? 'pointer' : 'default' }}
          >
            {tile ? (
              <>
                <IndustryTileIcon type={tile.type} level={tile.level} flipped={tile.flipped} />
                {isSelectableTile && (
                  <circle r={15} fill="none" stroke="#f7931a" strokeWidth={2} strokeDasharray="3 2" />
                )}
                {isSelectedTile && <circle r={15} fill="none" stroke="#f7931a" strokeWidth={2.5} />}
              </>
            ) : (
              <rect
                x={-11}
                y={-11}
                width={22}
                height={22}
                rx={4}
                fill={isHighlighted ? 'rgba(247,147,26,0.18)' : 'none'}
                stroke={isHighlighted ? '#f7931a' : '#3a4451'}
                strokeWidth={isHighlighted ? 2 : 1}
                strokeDasharray={isHighlighted ? undefined : '3 2'}
              />
            )}
          </g>
        );
      })}
    </g>
  );
}
