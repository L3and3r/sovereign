import { INDUSTRY_TYPES } from '@sovereign/engine';
import { INDUSTRY_COLORS } from '../../styles/tokens';

const LABELS: Record<string, string> = {
  energiecentrale: 'Energiecentrale',
  infrastructuur: 'Infrastructuur',
  handelspost: 'Handelspost',
  netwerkhub: 'Netwerkhub',
  mediaEnEducatie: 'Media & Educatie',
  kluis: 'Kluis',
};

export function IndustryLegend() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem', fontSize: 12 }}>
      {INDUSTRY_TYPES.map((type) => (
        <span key={type} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span
            style={{
              display: 'inline-block',
              width: 12,
              height: 12,
              borderRadius: 3,
              background: INDUSTRY_COLORS[type] ?? '#999',
            }}
          />
          {LABELS[type] ?? type}
        </span>
      ))}
    </div>
  );
}
