import { MAP_EDGES, type GameState } from '@sovereign/engine';
import { LinkEdge } from './LinkEdge';
import { REGION_POSITIONS } from './regionLayout';
import { RegionNode } from './RegionNode';

export function BoardSvg({ state }: { state: GameState }) {
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
          <radialGradient id="region-fill" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#232c37" />
            <stop offset="100%" stopColor="#171d24" />
          </radialGradient>
          <filter id="region-shadow" x="-60%" y="-60%" width="220%" height="220%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.55" />
          </filter>
          <filter id="tile-shadow" x="-80%" y="-80%" width="260%" height="260%">
            <feDropShadow dx="0" dy="1.2" stdDeviation="1" floodOpacity="0.55" />
          </filter>
          <filter id="link-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodOpacity="0.7" />
          </filter>
        </defs>

        <rect x={0} y={0} width={800} height={550} fill="url(#board-bg)" />

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
            <LinkEdge key={edge.id} a={a} b={b} ownerIndex={built ? playerIndexById.get(built.ownerId) : undefined} />
          );
        })}
        {state.regions.map((region) => {
          const position = REGION_POSITIONS[region.id];
          if (!position) return null;
          return <RegionNode key={region.id} region={region} position={position} tileById={tileById} />;
        })}
      </svg>
    </div>
  );
}
