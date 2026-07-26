import type { AutomaConfig } from '../automa/automaConfig';
import type { CardId, PlayerId } from './ids';
import type { IndustryLevel, IndustryType } from './industry';

export interface PlayerState {
  id: PlayerId;
  name: string;
  sats: number;
  energy: number;
  bandwidth: number;
  reputation: number;
  incomePosition: number;
  vp: number;
  hand: CardId[];
  wildcardsAvailable: { region: boolean; industry: boolean };
  industryStock: Record<IndustryType, IndustryLevel[]>;
  isAutoma?: boolean;
  automaConfig?: AutomaConfig;
}
