import { CARD_DEFS_BY_ID } from '@sovereign/engine';

const TYPE_COLORS: Record<string, string> = {
  region: '#5b8def',
  industry: '#4caf50',
  wildcardRegion: '#f2545b',
  wildcardIndustry: '#f7931a',
};

export function CardIcon({ cardId, selected = false }: { cardId: string; selected?: boolean }) {
  const def = CARD_DEFS_BY_ID[cardId];
  const color = def ? (TYPE_COLORS[def.type] ?? '#999') : '#999';

  return (
    <span
      className="card-chip"
      style={{
        background: color,
        boxShadow: selected ? '0 0 0 2px var(--text)' : 'none',
      }}
      title={def?.type}
    >
      {def?.flavorName ?? cardId}
    </span>
  );
}
