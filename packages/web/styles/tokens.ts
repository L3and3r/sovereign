export const INDUSTRY_COLORS: Record<string, string> = {
  energiecentrale: '#f7931a',
  infrastructuur: '#8d99ae',
  handelspost: '#4caf50',
  netwerkhub: '#3fb8af',
  mediaEnEducatie: '#e85d9e',
  kluis: '#ffd700',
};

export const PLAYER_COLORS = ['#5b8def', '#f2545b', '#b98ce0', '#7cd68a'];

export function colorForPlayerIndex(index: number): string {
  return PLAYER_COLORS[index % PLAYER_COLORS.length]!;
}
