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

/** MTG/Hearthstone-style card frame per card type: a brass border with a type-tinted body. */
export const CARD_FRAME: Record<string, { bg: string; bgDark: string; glyph: string }> = {
  region: { bg: '#2a4a72', bgDark: '#122238', glyph: '⌖' },
  industry: { bg: '#2a5c3a', bgDark: '#12271a', glyph: '' },
  wildcardRegion: { bg: '#7a2333', bgDark: '#33101a', glyph: '★' },
  wildcardIndustry: { bg: '#7a5410', bgDark: '#33220a', glyph: '★' },
  dreiging: { bg: '#5c1620', bgDark: '#22070c', glyph: '⚑' },
};
