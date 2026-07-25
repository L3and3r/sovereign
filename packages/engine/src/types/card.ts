import type { CardId, RegionId } from './ids';
import type { IndustryType } from './industry';

export type CardType = 'region' | 'industry' | 'wildcardRegion' | 'wildcardIndustry';

export interface CardDef {
  id: CardId;
  type: CardType;
  regionId?: RegionId;
  industryType?: IndustryType;
  flavorName: string;
}
