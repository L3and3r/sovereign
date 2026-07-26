import type { CardId, PlayerId } from './ids';
import type { LinkInstance, Region } from './board';
import type { IndustryTileInstance } from './industry';
import type { MarketState } from './market';
import type { PlayerState } from './player';

export type Era = 'pioniersfase' | 'netwerkfase';
export type GamePhase = 'playing' | 'eraTransition' | 'gameEnded';

export interface EraFinalScore {
  flippedVp: number;
  linkVp: number;
  total: number;
}

export interface EraIndustryScore {
  flippedVp: number;
}

export interface GameState {
  era: Era;
  regions: Region[];
  links: LinkInstance[];
  tiles: IndustryTileInstance[];
  players: PlayerState[];
  currentPlayerIndex: number;
  actionsTakenThisTurn: number;
  deck: CardId[];
  discard: CardId[];
  market: MarketState;
  roundNumber: number;
  phase: GamePhase;
  eraScores?: Partial<Record<Era, Record<PlayerId, EraIndustryScore>>>;
  finalScores?: Record<PlayerId, EraFinalScore>;
  pendingReaction?: { triggerPlayerId: PlayerId; eligiblePlayerIds: PlayerId[] };
}
