import { describe, expect, it } from 'vitest';
import { HANDELAAR_BOT, simulateGame } from './fixtures/bot';

describe('headless randomized game simulation', () => {
  for (const seed of [1, 2, 3]) {
    it(`reaches era end within budget for seed ${seed}`, () => {
      const { state, iterations } = simulateGame(seed, ['Alice', 'Bob'], [HANDELAAR_BOT, HANDELAAR_BOT]);

      expect(state.phase).toBe('gameEnded');
      expect(iterations).toBeGreaterThan(0);
      expect(state.finalScores).toBeDefined();
      for (const player of state.players) {
        expect(state.finalScores![player.id]).toBeDefined();
        expect(player.vp).toBe(state.finalScores![player.id]!.total);
      }
    });
  }

  it('also terminates correctly with 4 players', () => {
    const { state } = simulateGame(
      42,
      ['Alice', 'Bob', 'Cara', 'Dave'],
      [HANDELAAR_BOT, HANDELAAR_BOT, HANDELAAR_BOT, HANDELAAR_BOT],
    );
    expect(state.phase).toBe('gameEnded');
    expect(state.players).toHaveLength(4);
  });
});
