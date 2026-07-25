export interface ResourceBundle {
  sats: number;
  energy: number;
  bandwidth: number;
}

export const ZERO_RESOURCES: ResourceBundle = { sats: 0, energy: 0, bandwidth: 0 };
