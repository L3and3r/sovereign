import type { LinkId, PlayerId, RegionId, SlotId, TileId } from './ids';
import type { IndustryType } from './industry';

export interface IndustrySlot {
  id: SlotId;
  allowedTypes: IndustryType[];
  occupiedByTileId?: TileId;
}

export interface Region {
  id: RegionId;
  name: string;
  hasBorderMarker: boolean;
  slots: IndustrySlot[];
  adjacentRegionIds: RegionId[];
}

export interface LinkInstance {
  id: LinkId;
  regionA: RegionId;
  regionB: RegionId;
  ownerId: PlayerId;
}
