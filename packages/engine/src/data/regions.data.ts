import type { Region } from '../types/board';
import { adjacentRegionIdsFor } from './links.data';

const SLOT_TEMPLATE: Region['slots'] = [
  { id: 'a', allowedTypes: ['energiecentrale', 'infrastructuur'] },
  { id: 'b', allowedTypes: ['handelspost', 'netwerkhub'] },
  { id: 'c', allowedTypes: ['mediaEnEducatie', 'kluis'] },
];

function makeRegion(id: string, name: string, hasBorderMarker: boolean): Region {
  return {
    id,
    name,
    hasBorderMarker,
    slots: SLOT_TEMPLATE.map((slot) => ({ ...slot })),
    adjacentRegionIds: adjacentRegionIdsFor(id),
  };
}

export const REGIONS: Region[] = [
  makeRegion('zoutmeer-vrijhaven', 'Zoutmeer Vrijhaven', false),
  makeRegion('berghold', 'Berghold', false),
  makeRegion('deltahaven', 'Deltahaven', false),
  makeRegion('vrijstad', 'Vrijstad', false),
  makeRegion('cryptavallei', 'Cryptavallei', false),
  makeRegion('grensland', 'Grensland', true),
  makeRegion('haviksrots', 'Haviksrots', false),
  makeRegion('ijzerkust', 'IJzerkust', true),
];
