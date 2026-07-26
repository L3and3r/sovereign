import { MAP_EDGES, type GameState, type MapEdgeDef } from '@sovereign/engine';
import { LinkEdge } from './LinkEdge';
import { REGION_POSITIONS } from './regionLayout';
import { RegionNode } from './RegionNode';

export function BoardSvg({
  state,
  highlightedSlotKeys,
  onSlotClick,
  highlightedEdgeIds,
  onEdgeClick,
  selectableTileIds,
  selectedTileIds,
  onTileClick,
}: {
  state: GameState;
  highlightedSlotKeys?: Set<string>;
  onSlotClick?: (regionId: string, slotId: string) => void;
  highlightedEdgeIds?: Set<string>;
  onEdgeClick?: (edge: MapEdgeDef) => void;
  selectableTileIds?: Set<string>;
  selectedTileIds?: Set<string>;
  onTileClick?: (tileId: string) => void;
}) {
  const tileById = new Map(state.tiles.map((t) => [t.id, t]));
  const playerIndexById = new Map(state.players.map((p, i) => [p.id, i]));

  return (
    <div className="board-frame">
      <svg viewBox="0 0 800 550" width="100%" style={{ display: 'block' }}>
        <defs>
          <radialGradient id="board-bg" cx="35%" cy="25%" r="90%">
            <stop offset="0%" stopColor="#161c24" />
            <stop offset="55%" stopColor="#0f141a" />
            <stop offset="100%" stopColor="#0a0d11" />
          </radialGradient>
          {/* Regions read as struck brass sat-coins, not generic wireframe nodes — the game's
              currency is literally coin-shaped, so the board leans into that rather than an
              abstract network diagram. */}
          <radialGradient id="region-fill" cx="35%" cy="28%" r="75%">
            <stop offset="0%" stopColor="#7a5b34" />
            <stop offset="45%" stopColor="#4f3a20" />
            <stop offset="100%" stopColor="#2c2013" />
          </radialGradient>
          <pattern id="ledger-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0 L0 0 0 40" fill="none" stroke="#e8e6e1" strokeWidth="1" opacity="0.035" />
          </pattern>
          <filter id="region-shadow" x="-60%" y="-60%" width="220%" height="220%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.55" />
          </filter>
          <filter id="tile-shadow" x="-80%" y="-80%" width="260%" height="260%">
            <feDropShadow dx="0" dy="1.2" stdDeviation="1" floodOpacity="0.55" />
          </filter>
          {/* userSpaceOnUse + fixed bounds: perfectly horizontal/vertical links have a
              zero-width or zero-height bounding box, which collapses the default
              percentage-based (objectBoundingBox) filter region to nothing and hides
              the line entirely. */}
          <filter id="link-glow" filterUnits="userSpaceOnUse" x="-20" y="-20" width="840" height="590">
            <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodOpacity="0.7" />
          </filter>
        </defs>

        <rect x={0} y={0} width={800} height={550} fill="url(#board-bg)" />
        <rect x={0} y={0} width={800} height={550} fill="url(#ledger-grid)" />

        {MAP_EDGES.map((edge) => {
          const a = REGION_POSITIONS[edge.regionA];
          const b = REGION_POSITIONS[edge.regionB];
          if (!a || !b) return null;
          const built = state.links.find(
            (l) =>
              (l.regionA === edge.regionA && l.regionB === edge.regionB) ||
              (l.regionA === edge.regionB && l.regionB === edge.regionA),
          );
          return (
            <LinkEdge
              key={edge.id}
              a={a}
              b={b}
              ownerIndex={built ? playerIndexById.get(built.ownerId) : undefined}
              highlighted={!built && !!highlightedEdgeIds?.has(edge.id)}
              onClick={!built && highlightedEdgeIds?.has(edge.id) && onEdgeClick ? () => onEdgeClick(edge) : undefined}
            />
          );
        })}
        {state.regions.map((region) => {
          const position = REGION_POSITIONS[region.id];
          if (!position) return null;
          return (
            <RegionNode
              key={region.id}
              region={region}
              position={position}
              tileById={tileById}
              highlightedSlotKeys={highlightedSlotKeys}
              onSlotClick={onSlotClick}
              selectableTileIds={selectableTileIds}
              selectedTileIds={selectedTileIds}
              onTileClick={onTileClick}
            />
          );
        })}
      </svg>
    </div>
  );
}
