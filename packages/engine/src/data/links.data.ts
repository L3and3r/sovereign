import type { RegionId } from '../types/ids';

export interface MapEdgeDef {
  id: string;
  regionA: RegionId;
  regionB: RegionId;
}

export const MAP_EDGES: MapEdgeDef[] = [
  { id: 'edge-zoutmeer-berghold', regionA: 'zoutmeer-vrijhaven', regionB: 'berghold' },
  { id: 'edge-zoutmeer-deltahaven', regionA: 'zoutmeer-vrijhaven', regionB: 'deltahaven' },
  { id: 'edge-zoutmeer-ijzerkust', regionA: 'zoutmeer-vrijhaven', regionB: 'ijzerkust' },
  { id: 'edge-berghold-grensland', regionA: 'berghold', regionB: 'grensland' },
  { id: 'edge-berghold-vrijstad', regionA: 'berghold', regionB: 'vrijstad' },
  { id: 'edge-deltahaven-vrijstad', regionA: 'deltahaven', regionB: 'vrijstad' },
  { id: 'edge-deltahaven-haviksrots', regionA: 'deltahaven', regionB: 'haviksrots' },
  { id: 'edge-vrijstad-cryptavallei', regionA: 'vrijstad', regionB: 'cryptavallei' },
  { id: 'edge-vrijstad-ijzerkust', regionA: 'vrijstad', regionB: 'ijzerkust' },
  { id: 'edge-grensland-cryptavallei', regionA: 'grensland', regionB: 'cryptavallei' },
  { id: 'edge-grensland-ijzerkust', regionA: 'grensland', regionB: 'ijzerkust' },
  { id: 'edge-cryptavallei-haviksrots', regionA: 'cryptavallei', regionB: 'haviksrots' },
  { id: 'edge-haviksrots-ijzerkust', regionA: 'haviksrots', regionB: 'ijzerkust' },
];

export function adjacentRegionIdsFor(regionId: RegionId): RegionId[] {
  const neighbors = new Set<RegionId>();
  for (const edge of MAP_EDGES) {
    if (edge.regionA === regionId) neighbors.add(edge.regionB);
    if (edge.regionB === regionId) neighbors.add(edge.regionA);
  }
  return [...neighbors];
}
