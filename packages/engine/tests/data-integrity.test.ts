import { describe, expect, it } from 'vitest';
import { MAP_EDGES } from '../src/data/links.data';
import { REGIONS } from '../src/data/regions.data';
import { INDUSTRIES } from '../src/data/industries.data';
import {
  ALL_CARD_DEFS,
  buildDeckCardIds,
  DREIGING_CARD_COPIES,
  DREIGING_CARDS,
  INDUSTRY_CARD_COPIES,
  INDUSTRY_CARDS,
  REGION_CARD_COPIES,
  REGION_CARDS,
} from '../src/data/cards.data';
import { HANDELSPOST_DEMAND_RUNGS, INCOME_TRACK } from '../src/data/market.data';
import { INDUSTRY_TYPES } from '../src/types/industry';

describe('regions and map edges', () => {
  const regionIds = new Set(REGIONS.map((r) => r.id));

  it('every edge references existing regions', () => {
    for (const edge of MAP_EDGES) {
      expect(regionIds.has(edge.regionA)).toBe(true);
      expect(regionIds.has(edge.regionB)).toBe(true);
    }
  });

  it('has no self-loop or duplicate edges', () => {
    const seen = new Set<string>();
    for (const edge of MAP_EDGES) {
      expect(edge.regionA).not.toBe(edge.regionB);
      const key = [edge.regionA, edge.regionB].sort().join('::');
      expect(seen.has(key)).toBe(false);
      seen.add(key);
    }
  });

  it('adjacency lists are symmetric and match the edge list', () => {
    for (const region of REGIONS) {
      for (const neighborId of region.adjacentRegionIds) {
        const neighbor = REGIONS.find((r) => r.id === neighborId);
        expect(neighbor, `region ${neighborId} referenced by ${region.id} must exist`).toBeDefined();
        expect(neighbor!.adjacentRegionIds).toContain(region.id);
      }
    }
  });

  it('every region has at least one slot and a name', () => {
    for (const region of REGIONS) {
      expect(region.slots.length).toBeGreaterThan(0);
      expect(region.name.length).toBeGreaterThan(0);
    }
  });

  it('all slot allowedTypes are valid industry types', () => {
    for (const region of REGIONS) {
      for (const slot of region.slots) {
        for (const type of slot.allowedTypes) {
          expect(INDUSTRY_TYPES).toContain(type);
        }
      }
    }
  });

  it('has exactly two border-marker regions', () => {
    expect(REGIONS.filter((r) => r.hasBorderMarker)).toHaveLength(2);
  });
});

describe('industries', () => {
  it('defines all six industry types', () => {
    for (const type of INDUSTRY_TYPES) {
      expect(INDUSTRIES[type]).toBeDefined();
    }
  });

  it('has the expected level counts (4 for scaling industries, 3 for media, 1 for kluis)', () => {
    expect(INDUSTRIES.energiecentrale.levels).toHaveLength(4);
    expect(INDUSTRIES.infrastructuur.levels).toHaveLength(4);
    expect(INDUSTRIES.handelspost.levels).toHaveLength(4);
    expect(INDUSTRIES.netwerkhub.levels).toHaveLength(4);
    expect(INDUSTRIES.mediaEnEducatie.levels).toHaveLength(3);
    expect(INDUSTRIES.kluis.levels).toHaveLength(1);
  });

  it('has non-decreasing VP and levels numbered sequentially from 1', () => {
    for (const type of INDUSTRY_TYPES) {
      const levels = INDUSTRIES[type].levels;
      levels.forEach((levelDef, index) => {
        expect(levelDef.level).toBe(index + 1);
      });
      for (let i = 1; i < levels.length; i += 1) {
        expect(levels[i]!.vp).toBeGreaterThanOrEqual(levels[i - 1]!.vp);
      }
    }
  });
});

describe('cards', () => {
  it('has unique card ids', () => {
    const ids = ALL_CARD_DEFS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has exactly one region card per region', () => {
    expect(REGION_CARDS).toHaveLength(REGIONS.length);
  });

  it('has exactly one industry card per industry type', () => {
    expect(INDUSTRY_CARDS).toHaveLength(INDUSTRY_TYPES.length);
  });

  it('builds a deck matching the declared copy formula', () => {
    const deck = buildDeckCardIds();
    const expectedLength =
      REGION_CARDS.length * REGION_CARD_COPIES +
      INDUSTRY_CARDS.length * INDUSTRY_CARD_COPIES +
      DREIGING_CARDS.length * DREIGING_CARD_COPIES;
    expect(deck).toHaveLength(expectedLength);
  });
});

describe('market data', () => {
  it('handelspost demand track is non-increasing', () => {
    for (let i = 1; i < HANDELSPOST_DEMAND_RUNGS.length; i += 1) {
      expect(HANDELSPOST_DEMAND_RUNGS[i]).toBeLessThanOrEqual(HANDELSPOST_DEMAND_RUNGS[i - 1]!);
    }
  });

  it('income track spans exactly the documented 40 positions', () => {
    expect(INCOME_TRACK).toHaveLength(40);
  });
});
