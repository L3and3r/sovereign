import type { PlayerId } from './ids';

export interface DemandTrack {
  rungs: number[];
  nextIndex: number;
}

export interface MarketState {
  handelspostDemand: DemandTrack;
  mediaEnEducatieDemand: Record<PlayerId, DemandTrack>;
  energyPrice: number;
  bandwidthPrice: number;
  incomeTrack: number[];
  loanPoolRemaining: number;
}
