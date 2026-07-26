import { CARD_DEFS_BY_ID } from '@sovereign/engine';
import { IndustryIconPaths } from '../board/IndustryIconPaths';
import { CARD_FRAME } from '../../styles/tokens';

export function CardIcon({
  cardId,
  selected = false,
  disabled = false,
  onClick,
}: {
  cardId: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  const def = CARD_DEFS_BY_ID[cardId];
  const frame = def ? (CARD_FRAME[def.type] ?? CARD_FRAME.industry!) : CARD_FRAME.industry!;
  const isIndustry = def?.type === 'industry' && def.industryType;

  return (
    <div
      className={`game-card${selected ? ' is-selected' : ''}${disabled ? ' is-disabled' : ''}`}
      style={{ background: `linear-gradient(160deg, ${frame.bg} 0%, ${frame.bgDark} 100%)` }}
      title={def?.type}
      onClick={disabled ? undefined : onClick}
      role={onClick ? 'button' : undefined}
    >
      <div className="game-card-art">
        {isIndustry ? (
          <svg viewBox="-12 -12 24 24" width={28} height={28}>
            <IndustryIconPaths type={def!.industryType!} color="#f0ede6" />
          </svg>
        ) : (
          frame.glyph
        )}
      </div>
      <div className="game-card-name">{def?.flavorName ?? cardId}</div>
      <div className="game-card-type">{def?.type ?? ''}</div>
    </div>
  );
}
