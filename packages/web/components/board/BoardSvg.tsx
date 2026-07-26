import { MAP_EDGES, type GameState } from '@sovereign/engine';
import { LinkEdge } from './LinkEdge';
import { REGION_POSITIONS } from './regionLayout';
import { RegionNode } from './RegionNode';

export function BoardSvg({ state }: { state: GameState }) {
  const tileById = new Map(state.tiles.map((t) => [t.id, t]));
  const playerIndexById = new Map(state.players.map((p, i) => [p.id, i]));

  return (
    <svg viewBox="0 0 800 550" width="100%" style={{ maxWidth: 800, background: '#0e1217', borderRadius: 12 }}>
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
  );
}
