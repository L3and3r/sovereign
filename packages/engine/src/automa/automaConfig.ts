import { createRng, shuffle } from '../engine/rng';
import type { IndustryType } from '../types/industry';

export type AutomaActionKind = 'sell' | 'build' | 'network' | 'develop' | 'loan' | 'undercut';
export type AutomaDifficulty = 'makkelijk' | 'gemiddeld' | 'moeilijk';

export interface AutomaConfig {
  difficulty: AutomaDifficulty;
  actionsPerTurn: number;
  actionPriority: AutomaActionKind[];
  industryPreference: IndustryType[];
  undercutRungsPerUse: number;
  /** 0-1: chance the automa confiscates instead of passing when eligible to react. */
  confiscateChance: number;
}

const DEFAULT_INDUSTRY_PREFERENCE: IndustryType[] = [
  'handelspost',
  'netwerkhub',
  'infrastructuur',
  'energiecentrale',
  'kluis',
  'mediaEnEducatie',
];

export const AUTOMA_PRESETS: Record<AutomaDifficulty, AutomaConfig> = {
  makkelijk: {
    difficulty: 'makkelijk',
    actionsPerTurn: 2,
    actionPriority: ['build', 'develop', 'network', 'sell', 'loan'],
    industryPreference: DEFAULT_INDUSTRY_PREFERENCE,
    undercutRungsPerUse: 0,
    confiscateChance: 0,
  },
  gemiddeld: {
    difficulty: 'gemiddeld',
    actionsPerTurn: 2,
    actionPriority: ['sell', 'build', 'undercut', 'network', 'develop', 'loan'],
    industryPreference: DEFAULT_INDUSTRY_PREFERENCE,
    undercutRungsPerUse: 1,
    confiscateChance: 0.5,
  },
  moeilijk: {
    difficulty: 'moeilijk',
    actionsPerTurn: 3,
    // Same order as gemiddeld (sell/build before undercut) - not undercut-first (1.5.2026 balance
    // pass v2). Undercut costs an action but gives the automa nothing directly, so putting it
    // ahead of scoring actions was burning its own turns for little real benefit and made
    // "moeilijk" perform worse than "gemiddeld" - the harder difficulty came from a bigger action
    // budget (3 vs 2) leaving room to still undercut *after* scoring, not from undercutting first.
    actionPriority: ['sell', 'build', 'undercut', 'network', 'develop', 'loan'],
    industryPreference: DEFAULT_INDUSTRY_PREFERENCE,
    undercutRungsPerUse: 2,
    confiscateChance: 1,
  },
};

/**
 * Builds the automa's config for a game. "Voorspelbaar vs. willekeuriger" (doc §11's third
 * difficulty knob) is modeled as: makkelijk/gemiddeld keep a fixed build priority, moeilijk
 * shuffles the industry tie-break order once per game (seeded, so still deterministic/testable,
 * just not predictable to a human watching for a pattern).
 */
export function createAutomaConfig(difficulty: AutomaDifficulty, seed: number): AutomaConfig {
  const preset = AUTOMA_PRESETS[difficulty];
  if (difficulty !== 'moeilijk') return preset;
  return { ...preset, industryPreference: shuffle(preset.industryPreference, createRng(seed)) };
}
