import type { CardDef } from '../types/card';
import type { CardId } from '../types/ids';
import { INDUSTRY_TYPES, type IndustryType } from '../types/industry';
import { REGIONS } from './regions.data';

const REGION_FLAVOR_NAMES: Record<string, string> = {
  'zoutmeer-vrijhaven': 'Zoutmeer Vrijhaven',
  berghold: 'Berghold',
  deltahaven: 'Deltahaven',
  vrijstad: 'Vrijstad',
  cryptavallei: 'Cryptavallei',
  grensland: 'Grensland',
  haviksrots: 'Haviksrots',
  ijzerkust: 'IJzerkust',
};

const INDUSTRY_FLAVOR_NAMES: Record<IndustryType, string> = {
  energiecentrale: 'Genesis Block',
  infrastructuur: 'Het Cypherpunk Manifest',
  handelspost: 'Vrije Markt',
  netwerkhub: 'Peer-to-Peer',
  mediaEnEducatie: 'Halvering',
  kluis: 'Zelfcustodie',
};

export const REGION_CARDS: CardDef[] = REGIONS.map((region) => ({
  id: `card-region-${region.id}`,
  type: 'region',
  regionId: region.id,
  flavorName: REGION_FLAVOR_NAMES[region.id] ?? region.name,
}));

export const INDUSTRY_CARDS: CardDef[] = INDUSTRY_TYPES.map((type) => ({
  id: `card-industry-${type}`,
  type: 'industry',
  industryType: type,
  flavorName: INDUSTRY_FLAVOR_NAMES[type],
}));

export const WILDCARD_REGION_CARD: CardDef = {
  id: 'card-wildcard-region',
  type: 'wildcardRegion',
  flavorName: 'Vrije Markt Wildcard',
};

export const WILDCARD_INDUSTRY_CARD: CardDef = {
  id: 'card-wildcard-industry',
  type: 'wildcardIndustry',
  flavorName: 'Het Cypherpunk Manifest Wildcard',
};

export const ALL_CARD_DEFS: CardDef[] = [
  ...REGION_CARDS,
  ...INDUSTRY_CARDS,
  WILDCARD_REGION_CARD,
  WILDCARD_INDUSTRY_CARD,
];

export const CARD_DEFS_BY_ID: Record<CardId, CardDef> = Object.fromEntries(
  ALL_CARD_DEFS.map((card) => [card.id, card]),
);

export const REGION_CARD_COPIES = 3;
export const INDUSTRY_CARD_COPIES = 3;

export function buildDeckCardIds(): CardId[] {
  const ids: CardId[] = [];
  for (const card of REGION_CARDS) {
    for (let i = 0; i < REGION_CARD_COPIES; i += 1) ids.push(card.id);
  }
  for (const card of INDUSTRY_CARDS) {
    for (let i = 0; i < INDUSTRY_CARD_COPIES; i += 1) ids.push(card.id);
  }
  return ids;
}
