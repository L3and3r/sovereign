export const INDUSTRY_COLORS: Record<string, string> = {
  energiecentrale: '#f2b134',
  infrastructuur: '#8d99ae',
  handelspost: '#4caf50',
  netwerkhub: '#3f51b5',
  mediaEnEducatie: '#e91e63',
  kluis: '#ffd700',
};

export const PLAYER_COLORS = ['#e63946', '#457b9d', '#2a9d8f', '#f4a261'];

export function colorForPlayerIndex(index: number): string {
  return PLAYER_COLORS[index % PLAYER_COLORS.length]!;
}
