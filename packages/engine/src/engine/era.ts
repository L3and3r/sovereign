import { INDUSTRIES } from '../data/industries.data';
import { LINK_VP } from '../data/market.data';
import type { PlayerId } from '../types/ids';
import type { EraFinalScore, EraIndustryScore, GameState } from '../types/state';

function industryVpForPlayer(state: GameState, playerId: PlayerId): number {
  return state.tiles
    .filter((tile) => tile.ownerId === playerId && tile.flipped)
    .reduce((sum, tile) => sum + INDUSTRIES[tile.type].levels[tile.level - 1]!.vp, 0);
}

export function endPioniersfase(state: GameState): GameState {
  const pioniersfaseScores: Record<PlayerId, EraIndustryScore> = {};

  const players = state.players.map((player) => {
    const flippedVp = industryVpForPlayer(state, player.id);
    pioniersfaseScores[player.id] = { flippedVp };
    return { ...player, vp: flippedVp };
  });

  return {
    ...state,
    players,
    phase: 'eraTransition',
    eraScores: { ...state.eraScores, pioniersfase: pioniersfaseScores },
  };
}

export function endNetwerkfase(state: GameState): GameState {
  const finalScores: Record<PlayerId, EraFinalScore> = {};

  const players = state.players.map((player) => {
    const pioniersfaseVp = state.eraScores?.pioniersfase?.[player.id]?.flippedVp ?? 0;
    const netwerkfaseVp = industryVpForPlayer(state, player.id);
    const flippedVp = pioniersfaseVp + netwerkfaseVp;
    const linkVp = state.links.filter((link) => link.ownerId === player.id).length * LINK_VP;
    const total = flippedVp + linkVp;
    finalScores[player.id] = { flippedVp, linkVp, total };
    return { ...player, vp: total };
  });

  return { ...state, players, phase: 'gameEnded', finalScores };
}
