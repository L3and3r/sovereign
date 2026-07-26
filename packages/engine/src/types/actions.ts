import type { CardId, PlayerId, RegionId, SlotId, TileId } from './ids';
import type { IndustryType } from './industry';
import type { GameState } from './state';

export type GameAction =
  | {
      type: 'build';
      playerId: PlayerId;
      regionId: RegionId;
      slotId: SlotId;
      industryType: IndustryType;
      cardId: CardId;
    }
  | { type: 'network'; playerId: PlayerId; regionA: RegionId; regionB: RegionId; cardId: CardId }
  | { type: 'develop'; playerId: PlayerId; industryType: IndustryType; cardId: CardId }
  | { type: 'sell'; playerId: PlayerId; tileIds: TileId[] }
  | { type: 'loan'; playerId: PlayerId }
  | { type: 'endTurn'; playerId: PlayerId }
  | { type: 'startNextEra' }
  | { type: 'confiscate'; playerId: PlayerId; cardId: CardId; targetTileId: TileId }
  | { type: 'passReaction'; playerId: PlayerId }
  | { type: 'automaUndercut'; playerId: PlayerId };

export type ActionResult = { ok: true; state: GameState } | { ok: false; error: string; state: GameState };
