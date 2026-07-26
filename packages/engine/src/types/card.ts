import type { CardId, RegionId } from './ids';
import type { IndustryType } from './industry';

export type CardType = 'region' | 'industry' | 'wildcardRegion' | 'wildcardIndustry';

export interface CardQuote {
  text: string;
  author: string;
}

export interface CardDef {
  id: CardId;
  type: CardType;
  regionId?: RegionId;
  industryType?: IndustryType;
  flavorName: string;
  quote: CardQuote;
}
