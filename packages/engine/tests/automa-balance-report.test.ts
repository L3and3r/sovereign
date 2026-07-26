import { describe, expect, it } from 'vitest';
import { AUTOMA_PRESETS, type AutomaDifficulty } from '../src/automa/automaConfig';
import { CONFISCATE_INCOME_PENALTY } from '../src/data/market.data';
import { ALL_BOT_ARCHETYPES, simulateGame } from './fixtures/bot';

const SEEDS_PER_MATCHUP = 20;
const DIFFICULTIES: AutomaDifficulty[] = ['makkelijk', 'gemiddeld', 'moeilijk'];

interface DifficultyStats {
  difficulty: AutomaDifficulty;
  games: number;
  wins: number;
  totalAutomaVp: number;
  totalOpponentVp: number;
  undercutCount: number;
  confiscateCount: number;
  passCount: number;
}

function emptyStats(difficulty: AutomaDifficulty): DifficultyStats {
  return {
    difficulty,
    games: 0,
    wins: 0,
    totalAutomaVp: 0,
    totalOpponentVp: 0,
    undercutCount: 0,
    confiscateCount: 0,
    passCount: 0,
  };
}

function avg(total: number, count: number): string {
  return count === 0 ? '-' : (total / count).toFixed(1);
}

describe('automa balance report (headless automa-vs-archetype playtests)', () => {
  it('runs every difficulty x archetype x seat matchup and reports aggregate signals', () => {
    const statsByDifficulty = new Map<AutomaDifficulty, DifficultyStats>();
    for (const difficulty of DIFFICULTIES) statsByDifficulty.set(difficulty, emptyStats(difficulty));

    let totalGames = 0;

    for (const difficulty of DIFFICULTIES) {
      const stats = statsByDifficulty.get(difficulty)!;
      for (const opponent of ALL_BOT_ARCHETYPES) {
        for (const automaSeat of [0, 1] as const) {
          for (let s = 0; s < SEEDS_PER_MATCHUP; s += 1) {
            const seed = s * 100000 + difficulty.length * 7919 + opponent.name.charCodeAt(0) * 31 + automaSeat;
            // The BotConfig at the automa's own seat index is never read (simulateGame checks
            // player.isAutoma first), so passing the opponent's config in both slots is harmless.
            const { state, stats: simStats } = simulateGame(seed, ['P0', 'P1'], [opponent, opponent], {
              playerIndex: automaSeat,
              config: AUTOMA_PRESETS[difficulty],
            });

            expect(state.phase).toBe('gameEnded');
            totalGames += 1;
            stats.games += 1;

            const automaPlayer = state.players[automaSeat]!;
            const opponentPlayer = state.players[automaSeat === 0 ? 1 : 0]!;
            stats.totalAutomaVp += automaPlayer.vp;
            stats.totalOpponentVp += opponentPlayer.vp;
            if (automaPlayer.vp >= opponentPlayer.vp) stats.wins += 1;

            const automaCounts = simStats.automaActionCounts[automaPlayer.id]!;
            stats.undercutCount += automaCounts.undercut;
            stats.confiscateCount += simStats.confiscateCounts[automaPlayer.id]!;
            stats.passCount += simStats.passReactionCounts[automaPlayer.id]!;
          }
        }
      }
    }

    // eslint-disable-next-line no-console
    console.log('\n=== Sovereign automa balance report ===');
    // eslint-disable-next-line no-console
    console.log(`${totalGames} games (automa vs. each of ${ALL_BOT_ARCHETYPES.length} archetypes, both seats)\n`);

    for (const stats of statsByDifficulty.values()) {
      const undercutRungs = AUTOMA_PRESETS[stats.difficulty].undercutRungsPerUse;
      const estimatedDemandImpact = stats.undercutCount * undercutRungs;
      const estimatedIncomeImpact = stats.confiscateCount * CONFISCATE_INCOME_PENALTY;
      // eslint-disable-next-line no-console
      console.log(
        `${stats.difficulty.padEnd(10)} games=${stats.games} winRate=${((stats.wins / stats.games) * 100).toFixed(0)}% ` +
          `avgAutomaVp=${avg(stats.totalAutomaVp, stats.games)} avgOpponentVp=${avg(stats.totalOpponentVp, stats.games)}`,
      );
      // eslint-disable-next-line no-console
      console.log(
        `${''.padEnd(10)} undercut: ${avg(stats.undercutCount, stats.games)}/game ` +
          `(~${avg(estimatedDemandImpact, stats.games)} demand rungs/game)`,
      );
      // eslint-disable-next-line no-console
      console.log(
        `${''.padEnd(10)} confiscate: ${avg(stats.confiscateCount, stats.games)}/game, pass: ${avg(stats.passCount, stats.games)}/game ` +
          `(~${avg(estimatedIncomeImpact, stats.games)} opponent income-position lost/game)`,
      );
    }

    // Sanity assertions - the real analysis happens by reading the console report above.
    expect(totalGames).toBe(DIFFICULTIES.length * ALL_BOT_ARCHETYPES.length * 2 * SEEDS_PER_MATCHUP);
    for (const stats of statsByDifficulty.values()) {
      expect(stats.games).toBeGreaterThan(0);
    }
  });
});
