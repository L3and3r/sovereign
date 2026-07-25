import { INCOME_TRACK_MAX_POSITION, INCOME_TRACK_MIN_POSITION } from '../data/market.data';

export function clampIncomePosition(position: number): number {
  return Math.max(INCOME_TRACK_MIN_POSITION, Math.min(INCOME_TRACK_MAX_POSITION, position));
}
