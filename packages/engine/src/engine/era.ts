import { INDUSTRIES } from '../data/industries.data';
import { LINK_VP } from '../data/market.data';
import type { EraFinalScore, GameState } from '../types/state';

export function scoreEra(state: GameState): GameState {
  const finalScores: Record<string, EraFinalScore> = {};

  const players = state.players.map((player) => {
    const flippedVp = state.tiles
      .filter((tile) => tile.ownerId === player.id && tile.flipped)
      .reduce((sum, tile) => sum + INDUSTRIES[tile.type].levels[tile.level - 1]!.vp, 0);
    const linkVp = state.links.filter((link) => link.ownerId === player.id).length * LINK_VP;
    const total = flippedVp + linkVp;
    finalScores[player.id] = { flippedVp, linkVp, total };
    return { ...player, vp: total };
  });

  return { ...state, players, phase: 'eraEnded', finalScores };
}
