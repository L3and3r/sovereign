import type { CardDef, CardQuote } from '../types/card';
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

// Broader libertarian/free-market quotes for the (thematically neutral) region cards.
const REGION_QUOTES: Record<string, CardQuote> = {
  'zoutmeer-vrijhaven': {
    text: 'The State is a group of people who have found a way to live at the expense of all the rest.',
    author: 'Murray Rothbard',
  },
  berghold: {
    text: "The question isn't who is going to let me; it's who is going to stop me.",
    author: 'Ayn Rand',
  },
  deltahaven: {
    text: 'Government is the great fiction through which everybody endeavors to live at the expense of everybody else.',
    author: 'Frédéric Bastiat',
  },
  vrijstad: {
    text: 'Legitimate use of violence can only be that which is required in self-defense.',
    author: 'Ron Paul',
  },
  cryptavallei: {
    text: 'Bitcoin will do to banks what email did to the postal industry.',
    author: 'Erik Voorhees',
  },
  grensland: {
    text: 'That government is best which governs least.',
    author: 'Henry David Thoreau',
  },
  haviksrots: {
    text: 'There are no solutions, there are only trade-offs.',
    author: 'Thomas Sowell',
  },
  ijzerkust: {
    text: 'Individuals have rights, and there are things no person or group may do to them.',
    author: 'Robert Nozick',
  },
};

const INDUSTRY_FLAVOR_NAMES: Record<IndustryType, string> = {
  energiecentrale: 'Genesis Block',
  infrastructuur: 'Het Cypherpunk Manifest',
  handelspost: 'Vrije Markt',
  netwerkhub: 'Peer-to-Peer',
  mediaEnEducatie: 'Halvering',
  kluis: 'Zelfcustodie',
};

// Bitcoin/cypherpunk-leaning quotes for the industry cards, matched to each industry's theme.
const INDUSTRY_QUOTES: Record<IndustryType, CardQuote> = {
  energiecentrale: {
    text: "The root problem with conventional currency is all the trust that's required to make it work.",
    author: 'Satoshi Nakamoto',
  },
  infrastructuur: {
    text: 'Privacy is necessary for an open society in the electronic age.',
    author: 'Eric Hughes',
  },
  handelspost: {
    text: 'The government solution to a problem is usually as bad as the problem.',
    author: 'Milton Friedman',
  },
  netwerkhub: {
    text: 'Trusted third parties are security holes.',
    author: 'Nick Szabo',
  },
  mediaEnEducatie: {
    text: 'Government is the only institution that can take a valuable commodity like paper, and make it worthless by applying ink.',
    author: 'Ludwig von Mises',
  },
  kluis: {
    text: 'Not your keys, not your bitcoin.',
    author: 'Andreas M. Antonopoulos',
  },
};

export const REGION_CARDS: CardDef[] = REGIONS.map((region) => ({
  id: `card-region-${region.id}`,
  type: 'region',
  regionId: region.id,
  flavorName: REGION_FLAVOR_NAMES[region.id] ?? region.name,
  quote: REGION_QUOTES[region.id] ?? { text: 'Liberty means responsibility.', author: 'George Bernard Shaw' },
}));

export const INDUSTRY_CARDS: CardDef[] = INDUSTRY_TYPES.map((type) => ({
  id: `card-industry-${type}`,
  type: 'industry',
  industryType: type,
  flavorName: INDUSTRY_FLAVOR_NAMES[type],
  quote: INDUSTRY_QUOTES[type],
}));

export const WILDCARD_REGION_CARD: CardDef = {
  id: 'card-wildcard-region',
  type: 'wildcardRegion',
  flavorName: 'Vrije Markt Wildcard',
  quote: {
    text: 'The curious task of economics is to demonstrate to men how little they really know about what they imagine they can design.',
    author: 'F.A. Hayek',
  },
};

export const WILDCARD_INDUSTRY_CARD: CardDef = {
  id: 'card-wildcard-industry',
  type: 'wildcardIndustry',
  flavorName: 'Het Cypherpunk Manifest Wildcard',
  quote: {
    text: 'Running bitcoin.',
    author: 'Hal Finney',
  },
};

const DREIGING_DEFS: Array<{ id: string; flavorName: string; quote: CardQuote }> = [
  {
    id: 'card-dreiging-onteigeningsbevel',
    flavorName: 'Onteigeningsbevel',
    quote: {
      text: 'We are fast approaching the stage of the ultimate inversion: the stage where the government is free to do anything it pleases, while the citizens may act only by permission.',
      author: 'Ayn Rand',
    },
  },
  {
    id: 'card-dreiging-belastingcontrole',
    flavorName: 'Belastingcontrole',
    quote: {
      text: 'Nothing is so permanent as a temporary government program.',
      author: 'Milton Friedman',
    },
  },
  {
    id: 'card-dreiging-vrijwillige-slavernij',
    flavorName: 'Vrijwillige Slavernij',
    quote: {
      text: 'It is therefore the inhabitants themselves who permit, or, rather, bring about, their own subjection, since by ceasing to submit they would put an end to it.',
      author: 'Étienne de la Boétie',
    },
  },
];

export const DREIGING_CARDS: CardDef[] = DREIGING_DEFS.map((def) => ({
  id: def.id,
  type: 'dreiging',
  flavorName: def.flavorName,
  quote: def.quote,
}));

export const ALL_CARD_DEFS: CardDef[] = [
  ...REGION_CARDS,
  ...INDUSTRY_CARDS,
  WILDCARD_REGION_CARD,
  WILDCARD_INDUSTRY_CARD,
  ...DREIGING_CARDS,
];

export const CARD_DEFS_BY_ID: Record<CardId, CardDef> = Object.fromEntries(
  ALL_CARD_DEFS.map((card) => [card.id, card]),
);

export const REGION_CARD_COPIES = 3;
export const INDUSTRY_CARD_COPIES = 3;
export const DREIGING_CARD_COPIES = 2;

export function buildDeckCardIds(): CardId[] {
  const ids: CardId[] = [];
  for (const card of REGION_CARDS) {
    for (let i = 0; i < REGION_CARD_COPIES; i += 1) ids.push(card.id);
  }
  for (const card of INDUSTRY_CARDS) {
    for (let i = 0; i < INDUSTRY_CARD_COPIES; i += 1) ids.push(card.id);
  }
  for (const card of DREIGING_CARDS) {
    for (let i = 0; i < DREIGING_CARD_COPIES; i += 1) ids.push(card.id);
  }
  return ids;
}
