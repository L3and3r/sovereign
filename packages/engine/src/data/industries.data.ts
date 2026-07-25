import { INDUSTRY_TYPES, type IndustryDef, type IndustryLevel, type IndustryType } from '../types/industry';
import type { ResourceBundle } from '../types/resources';

export const BUILD_BORDER_SURCHARGE: ResourceBundle = { sats: 2, energy: 1, bandwidth: 0 };
export const NETWORK_BORDER_SURCHARGE: ResourceBundle = { sats: 2, energy: 0, bandwidth: 1 };
export const LINK_BUILD_COST: ResourceBundle = { sats: 3, energy: 0, bandwidth: 2 };
export const DEVELOP_ENERGY_COST: ResourceBundle = { sats: 0, energy: 1, bandwidth: 0 };
export const SELL_ENERGY_COST_PER_TILE: ResourceBundle = { sats: 0, energy: 1, bandwidth: 0 };

export const INDUSTRIES: Record<IndustryType, IndustryDef> = {
  energiecentrale: {
    type: 'energiecentrale',
    displayName: 'Energiecentrale',
    levels: [
      { level: 1, cost: { sats: 5, energy: 0, bandwidth: 1 }, produces: { resource: 'energy', amount: 2 }, vp: 1, incomeBump: 1 },
      { level: 2, cost: { sats: 7, energy: 0, bandwidth: 1 }, produces: { resource: 'energy', amount: 3 }, vp: 2, incomeBump: 1 },
      { level: 3, cost: { sats: 10, energy: 0, bandwidth: 1 }, produces: { resource: 'energy', amount: 4 }, vp: 3, incomeBump: 2 },
      { level: 4, cost: { sats: 14, energy: 0, bandwidth: 0 }, produces: { resource: 'energy', amount: 6 }, vp: 4, incomeBump: 2 },
    ],
  },
  infrastructuur: {
    type: 'infrastructuur',
    displayName: 'Infrastructuur',
    levels: [
      { level: 1, cost: { sats: 4, energy: 1, bandwidth: 0 }, produces: { resource: 'bandwidth', amount: 2 }, vp: 2, incomeBump: 1 },
      { level: 2, cost: { sats: 6, energy: 1, bandwidth: 0 }, produces: { resource: 'bandwidth', amount: 3 }, vp: 3, incomeBump: 1 },
      { level: 3, cost: { sats: 9, energy: 2, bandwidth: 0 }, produces: { resource: 'bandwidth', amount: 4 }, vp: 4, incomeBump: 2 },
      { level: 4, cost: { sats: 12, energy: 2, bandwidth: 0 }, produces: { resource: 'bandwidth', amount: 6 }, vp: 5, incomeBump: 2 },
    ],
  },
  handelspost: {
    type: 'handelspost',
    displayName: 'Handelspost',
    levels: [
      { level: 1, cost: { sats: 8, energy: 1, bandwidth: 1 }, vp: 3, incomeBump: 2, requiresConnectionToSell: true },
      { level: 2, cost: { sats: 12, energy: 1, bandwidth: 1 }, vp: 5, incomeBump: 3, requiresConnectionToSell: true },
      { level: 3, cost: { sats: 16, energy: 1, bandwidth: 2 }, vp: 8, incomeBump: 3, requiresConnectionToSell: true },
      { level: 4, cost: { sats: 20, energy: 0, bandwidth: 2 }, vp: 10, incomeBump: 4, requiresConnectionToSell: true },
    ],
  },
  netwerkhub: {
    type: 'netwerkhub',
    displayName: 'Netwerkhub',
    levels: [
      { level: 1, cost: { sats: 5, energy: 0, bandwidth: 1 }, saleCapacity: 2, vp: 2, incomeBump: 1 },
      { level: 2, cost: { sats: 7, energy: 0, bandwidth: 1 }, saleCapacity: 3, vp: 3, incomeBump: 1 },
      { level: 3, cost: { sats: 9, energy: 0, bandwidth: 2 }, saleCapacity: 4, vp: 4, incomeBump: 2 },
      { level: 4, cost: { sats: 12, energy: 0, bandwidth: 2 }, saleCapacity: 6, vp: 5, incomeBump: 2 },
    ],
  },
  mediaEnEducatie: {
    type: 'mediaEnEducatie',
    displayName: 'Media & Educatie',
    levels: [
      { level: 1, cost: { sats: 6, energy: 1, bandwidth: 0 }, vp: 3, incomeBump: 1, requiresConnectionToSell: false },
      { level: 2, cost: { sats: 10, energy: 1, bandwidth: 1 }, vp: 5, incomeBump: 2, requiresConnectionToSell: false },
      { level: 3, cost: { sats: 14, energy: 1, bandwidth: 1 }, vp: 7, incomeBump: 3, requiresConnectionToSell: false },
    ],
  },
  kluis: {
    type: 'kluis',
    displayName: 'Kluis',
    levels: [{ level: 1, cost: { sats: 8, energy: 0, bandwidth: 1 }, vp: 4, incomeBump: 1 }],
  },
};

export function createInitialIndustryStock(): Record<IndustryType, IndustryLevel[]> {
  const stock = {} as Record<IndustryType, IndustryLevel[]>;
  for (const type of INDUSTRY_TYPES) {
    stock[type] = INDUSTRIES[type].levels.map((levelDef) => levelDef.level);
  }
  return stock;
}
