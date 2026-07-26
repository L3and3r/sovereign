import type { PlayerId, RegionId, SlotId, TileId } from './ids';
import type { ResourceBundle } from './resources';

export type IndustryType =
  | 'energiecentrale'
  | 'infrastructuur'
  | 'handelspost'
  | 'netwerkhub'
  | 'mediaEnEducatie'
  | 'kluis';

export const INDUSTRY_TYPES: IndustryType[] = [
  'energiecentrale',
  'infrastructuur',
  'handelspost',
  'netwerkhub',
  'mediaEnEducatie',
  'kluis',
];

export type IndustryLevel = 1 | 2 | 3 | 4;

export interface IndustryLevelDef {
  level: IndustryLevel;
  cost: ResourceBundle;
  produces?: { resource: 'energy' | 'bandwidth'; amount: number };
  saleCapacity?: number;
  vp: number;
  incomeBump: number;
  requiresConnectionToSell?: boolean;
}

export interface IndustryDef {
  type: IndustryType;
  displayName: string;
  levels: IndustryLevelDef[];
}

export interface IndustryTileInstance {
  id: TileId;
  type: IndustryType;
  level: IndustryLevel;
  ownerId: PlayerId;
  regionId: RegionId;
  slotId: SlotId;
  remainingOutput?: number;
  flipped: boolean;
  disabled?: boolean;
}
