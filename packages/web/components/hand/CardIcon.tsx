import { CARD_DEFS_BY_ID } from '@sovereign/engine';

const TYPE_COLORS: Record<string, string> = {
  region: '#457b9d',
  industry: '#4caf50',
  wildcardRegion: '#e63946',
  wildcardIndustry: '#f2b134',
};

export function CardIcon({ cardId, selected = false }: { cardId: string; selected?: boolean }) {
  const def = CARD_DEFS_BY_ID[cardId];
  const color = def ? (TYPE_COLORS[def.type] ?? '#999') : '#999';

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        margin: '2px',
        borderRadius: 4,
        fontSize: 12,
        color: '#fff',
        background: color,
        border: selected ? '2px solid #fff' : '2px solid transparent',
      }}
      title={def?.type}
    >
      {def?.flavorName ?? cardId}
    </span>
  );
}
