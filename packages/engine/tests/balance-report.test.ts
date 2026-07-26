import { describe, expect, it } from 'vitest';
import { INDUSTRIES } from '../src/data/industries.data';
import { INDUSTRY_TYPES } from '../src/types/industry';
import type { IndustryType } from '../src/types/industry';
import { ALL_BOT_ARCHETYPES, simulateGame, type BotActionKind } from './fixtures/bot';

const SEEDS_PER_MATCHUP = 20;

interface ArchetypeStats {
  name: string;
  games: number;
  wins: number;
  totalVp: number;
  actionCounts: Record<BotActionKind, number>;
  industryVp: Record<IndustryType, number>;
  totalSats: number;
  totalIncomePosition: number;
}

function emptyStats(name: string): ArchetypeStats {
  return {
    name,
    games: 0,
    wins: 0,
    totalVp: 0,
    actionCounts: { sell: 0, build: 0, network: 0, develop: 0, loan: 0 },
    industryVp: Object.fromEntries(INDUSTRY_TYPES.map((t) => [t, 0])) as Record<IndustryType, number>,
    totalSats: 0,
    totalIncomePosition: 0,
  };
}

function avg(total: number, count: number): string {
  return count === 0 ? '-' : (total / count).toFixed(1);
}

describe('balance report (headless multi-archetype playtests)', () => {
  it('runs every archetype matchup and reports aggregate balance signals', () => {
    const statsByArchetype = new Map<string, ArchetypeStats>();
    for (const bot of ALL_BOT_ARCHETYPES) statsByArchetype.set(bot.name, emptyStats(bot.name));

    const seatVp: number[][] = [[], []];
    let totalIterations = 0;
    let totalGames = 0;

    for (const botA of ALL_BOT_ARCHETYPES) {
      for (const botB of ALL_BOT_ARCHETYPES) {
        for (let s = 0; s < SEEDS_PER_MATCHUP; s += 1) {
          const seed = s * 100000 + botA.name.charCodeAt(0) * 1000 + botB.name.charCodeAt(0);
          const configs = [botA, botB];
          const { state, iterations, stats } = simulateGame(seed, ['P0', 'P1'], configs);

          expect(state.phase).toBe('gameEnded');
          totalIterations += iterations;
          totalGames += 1;

          const winnerVp = Math.max(...state.players.map((p) => p.vp));

          state.players.forEach((player, seatIndex) => {
            const config = configs[seatIndex]!;
            const archStats = statsByArchetype.get(config.name)!;
            archStats.games += 1;
            archStats.totalVp += player.vp;
            archStats.totalSats += player.sats;
            archStats.totalIncomePosition += player.incomePosition;
            if (player.vp === winnerVp) archStats.wins += 1;
            seatVp[seatIndex]!.push(player.vp);

            const counts = stats.actionCounts[player.id]!;
            for (const kind of Object.keys(counts) as BotActionKind[]) {
              archStats.actionCounts[kind] += counts[kind];
            }

            for (const tile of state.tiles) {
              if (tile.ownerId === player.id && tile.flipped) {
                archStats.industryVp[tile.type] += INDUSTRIES[tile.type].levels[tile.level - 1]!.vp;
              }
            }
          });
        }
      }
    }

    // eslint-disable-next-line no-console
    console.log('\n=== Sovereign balance report ===');
    // eslint-disable-next-line no-console
    console.log(`${totalGames} games, avg ${avg(totalIterations, totalGames)} iterations/game\n`);

    // eslint-disable-next-line no-console
    console.log('-- Per archetype --');
    for (const stats of statsByArchetype.values()) {
      // eslint-disable-next-line no-console
      console.log(
        `${stats.name.padEnd(10)} games=${stats.games} winRate=${((stats.wins / stats.games) * 100).toFixed(0)}% ` +
          `avgVp=${avg(stats.totalVp, stats.games)} avgSats=${avg(stats.totalSats, stats.games)} ` +
          `avgIncomePos=${avg(stats.totalIncomePosition, stats.games)}`,
      );
      // eslint-disable-next-line no-console
      console.log(
        `${''.padEnd(10)} actions/game: ` +
          Object.entries(stats.actionCounts)
            .map(([kind, count]) => `${kind}=${avg(count, stats.games)}`)
            .join(' '),
      );
      // eslint-disable-next-line no-console
      console.log(
        `${''.padEnd(10)} VP/game by industry: ` +
          Object.entries(stats.industryVp)
            .map(([type, vp]) => `${type}=${avg(vp, stats.games)}`)
            .join(' '),
      );
    }

    // eslint-disable-next-line no-console
    console.log('\n-- Seat position (first-player-advantage check) --');
    seatVp.forEach((vps, seatIndex) => {
      const total = vps.reduce((a, b) => a + b, 0);
      // eslint-disable-next-line no-console
      console.log(`seat ${seatIndex}: games=${vps.length} avgVp=${avg(total, vps.length)}`);
    });

    // Sanity assertions - the real analysis happens by reading the console report above.
    expect(totalGames).toBe(ALL_BOT_ARCHETYPES.length ** 2 * SEEDS_PER_MATCHUP);
    for (const stats of statsByArchetype.values()) {
      expect(stats.games).toBeGreaterThan(0);
    }
  });
});
