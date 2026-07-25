import type { RegionId } from '../types/ids';
import type { GameState } from '../types/state';

/** BFS over built Links (shared infrastructure, any owner) from a starting region. */
export function connectedRegionIds(state: GameState, startRegionId: RegionId): Set<RegionId> {
  const adjacency = new Map<RegionId, RegionId[]>();
  for (const link of state.links) {
    if (!adjacency.has(link.regionA)) adjacency.set(link.regionA, []);
    if (!adjacency.has(link.regionB)) adjacency.set(link.regionB, []);
    adjacency.get(link.regionA)!.push(link.regionB);
    adjacency.get(link.regionB)!.push(link.regionA);
  }

  const visited = new Set<RegionId>([startRegionId]);
  const queue: RegionId[] = [startRegionId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const neighbor of adjacency.get(current) ?? []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return visited;
}
