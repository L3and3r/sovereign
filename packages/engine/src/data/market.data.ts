// Trimmed ~12% (1.5.2026 balance pass): headless playtests showed Handelspost's sell-income
// stacking on top of an already-competitive VP/cost ratio created a runaway snowball no other
// industry could match (the Sell-first archetype averaged 2x the VP of the Build-first archetype
// across 180 games) - see tests/balance-report.test.ts.
export const HANDELSPOST_DEMAND_RUNGS: number[] = [
  14, 14, 12, 12, 10, 10, 8, 8, 6, 6, 4, 4, 2, 2, 2, 2,
];

export const MEDIA_EN_EDUCATIE_DEMAND_RUNGS: number[] = [6, 4, 2];

export const ENERGY_MARKET_PRICE = 2;
export const BANDWIDTH_MARKET_PRICE = 3;

/**
 * Index 0 = income-track position -10 (worst), index 39 = position 29 (best).
 * Use incomeTrackValueForPosition() rather than indexing this array directly.
 */
export const INCOME_TRACK: number[] = [
  -3, -3, -3, -3, -3, -3, -3, -3, -3, -3,
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
  10, 10, 12, 12, 14, 14, 16, 16, 18, 18,
  20, 20, 20, 24, 24, 24, 28, 28, 28, 32,
];

export const INCOME_TRACK_MIN_POSITION = -10;
export const INCOME_TRACK_MAX_POSITION = INCOME_TRACK_MIN_POSITION + INCOME_TRACK.length - 1;

export function incomeTrackValueForPosition(position: number): number {
  const clamped = Math.max(INCOME_TRACK_MIN_POSITION, Math.min(INCOME_TRACK_MAX_POSITION, position));
  return INCOME_TRACK[clamped - INCOME_TRACK_MIN_POSITION]!;
}

export const LOAN_AMOUNT_SATS = 30;
export const LOAN_PENALTY_INCOME_POSITIONS = 3;
export const LOAN_POOL_SIZE = 30;

export const LINK_VP = 1;

export const CONFISCATE_INCOME_PENALTY = 2;

export const STARTING_SATS = 30;
export const STARTING_INCOME_POSITION = 10;
export const STARTING_HAND_SIZE = 8;
