'use client';

import {
  CARD_DEFS_BY_ID,
  INDUSTRY_TYPES,
  dispatch,
  type GameAction,
  type GameState,
  type IndustryType,
  type PlayerState,
} from '@sovereign/engine';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BoardSvg } from '../../components/board/BoardSvg';
import { IndustryLegend } from '../../components/board/IndustryLegend';
import { PlayerHandPanel } from '../../components/hand/PlayerHandPanel';
import { HelpPanel } from '../../components/layout/HelpPanel';
import { TurnBanner } from '../../components/layout/TurnBanner';
import { DemandTrackView } from '../../components/market/DemandTrackView';
import { IncomeTrackView } from '../../components/market/IncomeTrackView';
import { useGameStore } from '../../lib/store';
import { colorForPlayerIndex } from '../../styles/tokens';

function cardLabel(cardId: string): string {
  const def = CARD_DEFS_BY_ID[cardId];
  if (!def) return cardId;
  return `${def.flavorName} [${def.type}]`;
}

/** Cost/outcome preview: calls the pure engine dispatch against the current state without
 * committing, and discards the result if the player doesn't confirm. */
function ActionPreview({ state, action }: { state: GameState; action: GameAction | null }) {
  if (!action) return null;
  const result = dispatch(state, action);
  if (!result.ok) {
    return <p className="preview-warn">Voorbeeld: {result.error}</p>;
  }
  const playerId = 'playerId' in action ? action.playerId : undefined;
  const before = state.players.find((p) => p.id === playerId);
  const after = result.state.players.find((p) => p.id === playerId);
  if (!before || !after) return null;
  const satsDelta = after.sats - before.sats;
  return (
    <p className="preview-ok">
      Voorbeeld: sats {satsDelta >= 0 ? '+' : ''}
      {satsDelta}, inkomenspositie {after.incomePosition >= before.incomePosition ? '+' : ''}
      {after.incomePosition - before.incomePosition}
    </p>
  );
}

function PlayerRoster({ state }: { state: GameState }) {
  return (
    <div className="stack" style={{ gap: '0.55rem' }}>
      {state.players.map((p, i) => (
        <div
          key={p.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.55rem',
            fontSize: '0.82rem',
            fontWeight: i === state.currentPlayerIndex ? 700 : 400,
            color: i === state.currentPlayerIndex ? 'var(--text)' : 'var(--text-muted)',
          }}
        >
          <span className="player-dot" style={{ background: colorForPlayerIndex(i) }} />
          <span style={{ minWidth: 66 }}>{p.name}</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.78rem' }}>
            {p.sats}s · {p.energy}e · {p.bandwidth}b · inc {p.incomePosition} · {p.hand.length} krt
          </span>
        </div>
      ))}
    </div>
  );
}

function cardUsableForBuild(cardId: string, regionId: string, industryType: string, player: PlayerState): boolean {
  if (!player.hand.includes(cardId)) return false;
  const def = CARD_DEFS_BY_ID[cardId];
  if (!def) return false;
  if (def.type === 'region') return def.regionId === regionId;
  if (def.type === 'wildcardRegion') return player.wildcardsAvailable.region;
  if (def.type === 'industry') return def.industryType === industryType;
  if (def.type === 'wildcardIndustry') return player.wildcardsAvailable.industry;
  return false;
}

function BuildForm({
  state,
  player,
  dispatchAction,
}: {
  state: GameState;
  player: PlayerState;
  dispatchAction: (action: GameAction) => void;
}) {
  const [regionId, setRegionId] = useState(state.regions[0]?.id ?? '');
  const [slotId, setSlotId] = useState('');
  const [industryType, setIndustryType] = useState<IndustryType | ''>('');
  const [cardId, setCardId] = useState('');
  const region = state.regions.find((r) => r.id === regionId);
  const slot = region?.slots.find((s) => s.id === slotId);
  const allowedTypes = slot?.allowedTypes ?? [];

  useEffect(() => {
    setSlotId('');
    setIndustryType('');
    setCardId('');
  }, [regionId]);

  useEffect(() => {
    if (!allowedTypes.includes(industryType as IndustryType)) {
      setIndustryType(allowedTypes[0] ?? '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slotId]);

  useEffect(() => {
    if (cardId && !cardUsableForBuild(cardId, regionId, industryType, player)) {
      setCardId('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [industryType, regionId, player.hand]);

  const usableCards = player.hand.filter((cid) => cardUsableForBuild(cid, regionId, industryType, player));

  return (
    <div className="stack">
      <div className="form-row">
        <label className="field">
          Regio
          <select className="select" value={regionId} onChange={(e) => setRegionId(e.target.value)}>
            {state.regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
                {r.hasBorderMarker ? ' (grens)' : ''}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Slot
          <select className="select" value={slotId} onChange={(e) => setSlotId(e.target.value)}>
            <option value="">-- kies een leeg slot --</option>
            {region?.slots.map((s) => (
              <option key={s.id} value={s.id} disabled={!!s.occupiedByTileId}>
                {s.id} ({s.allowedTypes.join('/')}){s.occupiedByTileId ? ' [bezet]' : ''}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Industrietype
          <select
            className="select"
            value={industryType}
            disabled={!slotId}
            onChange={(e) => setIndustryType(e.target.value as IndustryType)}
          >
            {!slotId && <option value="">-- kies eerst een slot --</option>}
            {allowedTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Kaart
          <select className="select" value={cardId} disabled={!industryType} onChange={(e) => setCardId(e.target.value)}>
            <option value="">{!industryType ? '-- kies eerst een slot --' : '-- kies een passende kaart --'}</option>
            {usableCards.map((cid, i) => (
              <option key={`${cid}-${i}`} value={cid}>
                {cardLabel(cid)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div>
        <button
          className="btn btn-primary"
          disabled={!slotId || !cardId}
          onClick={() =>
            dispatchAction({
              type: 'build',
              playerId: player.id,
              regionId,
              slotId,
              industryType: industryType as IndustryType,
              cardId,
            })
          }
        >
          Bouw
        </button>
        <ActionPreview
          state={state}
          action={
            slotId && cardId
              ? { type: 'build', playerId: player.id, regionId, slotId, industryType: industryType as IndustryType, cardId }
              : null
          }
        />
      </div>
    </div>
  );
}

function cardUsableForNetwork(cardId: string, regionA: string, regionB: string, player: PlayerState): boolean {
  if (!player.hand.includes(cardId)) return false;
  const def = CARD_DEFS_BY_ID[cardId];
  if (!def) return false;
  if (def.type === 'region') return def.regionId === regionA || def.regionId === regionB;
  if (def.type === 'wildcardRegion') return player.wildcardsAvailable.region;
  return false;
}

function NetworkForm({
  state,
  player,
  dispatchAction,
}: {
  state: GameState;
  player: PlayerState;
  dispatchAction: (action: GameAction) => void;
}) {
  const [regionA, setRegionA] = useState(state.regions[0]?.id ?? '');
  const [regionB, setRegionB] = useState('');
  const [cardId, setCardId] = useState('');
  const regionAObj = state.regions.find((r) => r.id === regionA);
  const alreadyLinkedIds = new Set(
    state.links
      .filter((l) => l.regionA === regionA || l.regionB === regionA)
      .map((l) => (l.regionA === regionA ? l.regionB : l.regionA)),
  );
  const candidateRegionBs = (regionAObj?.adjacentRegionIds ?? []).filter((id) => !alreadyLinkedIds.has(id));

  useEffect(() => {
    setRegionB('');
    setCardId('');
  }, [regionA]);

  useEffect(() => {
    if (cardId && regionB && !cardUsableForNetwork(cardId, regionA, regionB, player)) {
      setCardId('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regionB, player.hand]);

  const usableCards = regionB ? player.hand.filter((cid) => cardUsableForNetwork(cid, regionA, regionB, player)) : [];

  return (
    <div className="stack">
      <div className="form-row">
        <label className="field">
          Van regio
          <select className="select" value={regionA} onChange={(e) => setRegionA(e.target.value)}>
            {state.regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Naar aangrenzende regio
          <select className="select" value={regionB} onChange={(e) => setRegionB(e.target.value)}>
            <option value="">-- kies --</option>
            {candidateRegionBs.map((id) => {
              const r = state.regions.find((region) => region.id === id);
              return (
                <option key={id} value={id}>
                  {r?.name ?? id}
                </option>
              );
            })}
          </select>
        </label>
        <label className="field">
          Kaart
          <select className="select" value={cardId} disabled={!regionB} onChange={(e) => setCardId(e.target.value)}>
            <option value="">{!regionB ? '-- kies eerst een regio --' : '-- kies een passende kaart --'}</option>
            {usableCards.map((cid, i) => (
              <option key={`${cid}-${i}`} value={cid}>
                {cardLabel(cid)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div>
        <button
          className="btn btn-primary"
          disabled={!cardId || !regionB}
          onClick={() => dispatchAction({ type: 'network', playerId: player.id, regionA, regionB, cardId })}
        >
          Leg link
        </button>
        <ActionPreview
          state={state}
          action={cardId && regionB ? { type: 'network', playerId: player.id, regionA, regionB, cardId } : null}
        />
        {candidateRegionBs.length === 0 && (
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Geen aangrenzende regio&apos;s meer beschikbaar vanaf hier.
          </p>
        )}
      </div>
    </div>
  );
}

function DevelopForm({
  state,
  player,
  dispatchAction,
}: {
  state: GameState;
  player: PlayerState;
  dispatchAction: (action: GameAction) => void;
}) {
  const [industryType, setIndustryType] = useState<IndustryType>('energiecentrale');
  const [cardId, setCardId] = useState('');

  useEffect(() => {
    if (cardId && !player.hand.includes(cardId)) {
      setCardId('');
    }
  }, [player.hand, cardId]);

  return (
    <div className="stack">
      <div className="form-row">
        <label className="field">
          Industrietype
          <select className="select" value={industryType} onChange={(e) => setIndustryType(e.target.value as IndustryType)}>
            {INDUSTRY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t} ({player.industryStock[t]?.length ?? 0} over)
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Kaart om te ontwikkelen (willekeurig)
          <select className="select" value={cardId} onChange={(e) => setCardId(e.target.value)}>
            <option value="">-- kies een kaart --</option>
            {player.hand.map((cid, i) => (
              <option key={`${cid}-${i}`} value={cid}>
                {cardLabel(cid)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div>
        <button
          className="btn btn-primary"
          disabled={!cardId}
          onClick={() => dispatchAction({ type: 'develop', playerId: player.id, industryType, cardId })}
        >
          Ontwikkel
        </button>
        <ActionPreview
          state={state}
          action={cardId ? { type: 'develop', playerId: player.id, industryType, cardId } : null}
        />
      </div>
    </div>
  );
}

function SellForm({
  state,
  player,
  dispatchAction,
}: {
  state: GameState;
  player: PlayerState;
  dispatchAction: (action: GameAction) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const sellableTiles = state.tiles.filter(
    (t) => t.ownerId === player.id && !t.flipped && (t.type === 'handelspost' || t.type === 'mediaEnEducatie'),
  );

  function toggle(tileId: string) {
    setSelected((prev) => (prev.includes(tileId) ? prev.filter((id) => id !== tileId) : [...prev, tileId]));
  }

  return (
    <div className="stack">
      {sellableTiles.length === 0 && (
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Geen verkoopbare tegels. Bouw eerst een Handelspost of Media &amp; Educatie, verbonden via een Link met een
          Netwerkhub.
        </p>
      )}
      {sellableTiles.map((tile) => {
        const region = state.regions.find((r) => r.id === tile.regionId);
        return (
          <label key={tile.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <input type="checkbox" checked={selected.includes(tile.id)} onChange={() => toggle(tile.id)} />
            {tile.type} L{tile.level} @ {region?.name ?? tile.regionId}
          </label>
        );
      })}
      <div>
        <button
          className="btn btn-primary"
          disabled={selected.length === 0}
          onClick={() => {
            dispatchAction({ type: 'sell', playerId: player.id, tileIds: selected });
            setSelected([]);
          }}
        >
          Verkoop geselecteerde tegels
        </button>
      </div>
    </div>
  );
}

function LoanPanel({
  state,
  player,
  dispatchAction,
}: {
  state: GameState;
  player: PlayerState;
  dispatchAction: (action: GameAction) => void;
}) {
  return (
    <div className="stack">
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        +30 sats direct, maar -3 permanent op de inkomenstrack. Gedeelde pool: {state.market.loanPoolRemaining} over.
      </p>
      <div>
        <button
          className="btn btn-primary"
          disabled={state.market.loanPoolRemaining <= 0}
          onClick={() => dispatchAction({ type: 'loan', playerId: player.id })}
        >
          Leen
        </button>
        <ActionPreview state={state} action={{ type: 'loan', playerId: player.id }} />
      </div>
    </div>
  );
}

const TABS = [
  { id: 'build', label: 'Bouwen' },
  { id: 'network', label: 'Netwerken' },
  { id: 'develop', label: 'Ontwikkelen' },
  { id: 'sell', label: 'Verkopen' },
  { id: 'loan', label: 'Lenen' },
] as const;

type TabId = (typeof TABS)[number]['id'];

function EraEndSummary({ state }: { state: GameState }) {
  return (
    <main className="page" style={{ maxWidth: 520 }}>
      <h1 className="app-title" style={{ marginBottom: '1.5rem' }}>
        <span className="mark">◆</span> PIONIERSFASE VOLTOOID
      </h1>
      <div className="panel">
        {state.players.map((p, i) => {
          const score = state.finalScores?.[p.id];
          return (
            <div
              key={p.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.6rem 0',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="player-dot" style={{ background: colorForPlayerIndex(i) }} />
                {p.name}
              </span>
              <span style={{ fontFamily: 'var(--font-display)', color: 'var(--text-muted)' }}>
                tegels {score?.flippedVp ?? 0} + links {score?.linkVp ?? 0} ={' '}
                <strong style={{ color: 'var(--accent)' }}>{score?.total ?? 0} VP</strong>
              </span>
            </div>
          );
        })}
      </div>
    </main>
  );
}

export default function GamePage() {
  const router = useRouter();
  const gameState = useGameStore((s) => s.gameState);
  const lastError = useGameStore((s) => s.lastError);
  const dispatchAction = useGameStore((s) => s.dispatchAction);
  const loadFromStorage = useGameStore((s) => s.loadFromStorage);
  const [activeTab, setActiveTab] = useState<TabId>('build');

  useEffect(() => {
    if (!gameState) loadFromStorage();
  }, [gameState, loadFromStorage]);

  if (!gameState) {
    return (
      <main className="page" style={{ maxWidth: 520 }}>
        <p style={{ color: 'var(--text-muted)' }}>Geen actief spel gevonden.</p>
        <button className="btn btn-primary" onClick={() => router.push('/')}>
          Terug naar setup
        </button>
      </main>
    );
  }

  if (gameState.phase === 'eraEnded') {
    return <EraEndSummary state={gameState} />;
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex]!;

  return (
    <main className="page">
      <header className="app-header">
        <h1 className="app-title">
          <span className="mark">◆</span> SOVEREIGN
        </h1>
        <span style={{ fontFamily: 'var(--font-display)', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
          PIONIERSFASE
        </span>
      </header>

      <HelpPanel />
      <TurnBanner state={gameState} />
      {lastError && <div className="error-banner" style={{ marginBottom: '1.25rem' }}>Fout: {lastError}</div>}

      <div className="game-grid">
        <div className="stack">
          <div className="panel">
            <BoardSvg state={gameState} />
            <div style={{ marginTop: '0.85rem' }}>
              <IndustryLegend />
            </div>
          </div>
          <div className="panel">
            <DemandTrackView track={gameState.market.handelspostDemand} label="Handelspost-vraag" />
          </div>
          <div className="panel">
            <IncomeTrackView players={gameState.players} />
          </div>
        </div>

        <div className="stack">
          <div className="panel">
            <p className="panel-title">Spelers</p>
            <PlayerRoster state={gameState} />
          </div>

          <div className="panel">
            <PlayerHandPanel player={currentPlayer} />
          </div>

          <div className="panel">
            <div className="action-tabs">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  className={`action-tab${activeTab === tab.id ? ' is-active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'build' && (
              <BuildForm state={gameState} player={currentPlayer} dispatchAction={dispatchAction} />
            )}
            {activeTab === 'network' && (
              <NetworkForm state={gameState} player={currentPlayer} dispatchAction={dispatchAction} />
            )}
            {activeTab === 'develop' && (
              <DevelopForm state={gameState} player={currentPlayer} dispatchAction={dispatchAction} />
            )}
            {activeTab === 'sell' && (
              <SellForm state={gameState} player={currentPlayer} dispatchAction={dispatchAction} />
            )}
            {activeTab === 'loan' && (
              <LoanPanel state={gameState} player={currentPlayer} dispatchAction={dispatchAction} />
            )}
          </div>

          <button
            className="btn"
            style={{ width: '100%' }}
            onClick={() => dispatchAction({ type: 'endTurn', playerId: currentPlayer.id })}
          >
            Beurt beëindigen
          </button>
        </div>
      </div>

      <details style={{ marginTop: '2rem' }}>
        <summary style={{ cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Ruwe staat (debug)
        </summary>
        <pre
          style={{
            maxHeight: 400,
            overflow: 'auto',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '0.75rem',
            fontSize: '0.75rem',
          }}
        >
          {JSON.stringify(gameState, null, 2)}
        </pre>
      </details>
    </main>
  );
}
