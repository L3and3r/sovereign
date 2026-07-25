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
import { PlayerHandPanel } from '../../components/hand/PlayerHandPanel';
import { TurnBanner } from '../../components/layout/TurnBanner';
import { DemandTrackView } from '../../components/market/DemandTrackView';
import { IncomeTrackView } from '../../components/market/IncomeTrackView';
import { useGameStore } from '../../lib/store';

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
    return <p style={{ color: '#f2b134', fontSize: 13 }}>Voorbeeld: {result.error}</p>;
  }
  const playerId = 'playerId' in action ? action.playerId : undefined;
  const before = state.players.find((p) => p.id === playerId);
  const after = result.state.players.find((p) => p.id === playerId);
  if (!before || !after) return null;
  const satsDelta = after.sats - before.sats;
  return (
    <p style={{ color: '#4caf50', fontSize: 13 }}>
      Voorbeeld: sats {satsDelta >= 0 ? '+' : ''}
      {satsDelta}, inkomenspositie {after.incomePosition >= before.incomePosition ? '+' : ''}
      {after.incomePosition - before.incomePosition}
    </p>
  );
}

function PlayerSummary({ state }: { state: GameState }) {
  return (
    <table border={1} cellPadding={4} style={{ borderCollapse: 'collapse', marginTop: '1rem' }}>
      <thead>
        <tr>
          <th>Speler</th>
          <th>Sats</th>
          <th>Energie</th>
          <th>Bandbreedte</th>
          <th>Inkomenspositie</th>
          <th>Hand</th>
        </tr>
      </thead>
      <tbody>
        {state.players.map((p, i) => (
          <tr key={p.id} style={{ fontWeight: i === state.currentPlayerIndex ? 'bold' : 'normal' }}>
            <td>{p.name}</td>
            <td>{p.sats}</td>
            <td>{p.energy}</td>
            <td>{p.bandwidth}</td>
            <td>{p.incomePosition}</td>
            <td>{p.hand.length}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
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
  const [industryType, setIndustryType] = useState<IndustryType>('energiecentrale');
  const [cardId, setCardId] = useState('');
  const region = state.regions.find((r) => r.id === regionId);

  return (
    <fieldset style={{ marginTop: '1rem' }}>
      <legend>Bouwen</legend>
      <select value={regionId} onChange={(e) => setRegionId(e.target.value)}>
        {state.regions.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
            {r.hasBorderMarker ? ' (grens)' : ''}
          </option>
        ))}
      </select>{' '}
      <select value={slotId} onChange={(e) => setSlotId(e.target.value)}>
        <option value="">-- slot --</option>
        {region?.slots.map((s) => (
          <option key={s.id} value={s.id} disabled={!!s.occupiedByTileId}>
            {s.id} ({s.allowedTypes.join('/')}){s.occupiedByTileId ? ' [bezet]' : ''}
          </option>
        ))}
      </select>{' '}
      <select value={industryType} onChange={(e) => setIndustryType(e.target.value as IndustryType)}>
        {INDUSTRY_TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>{' '}
      <select value={cardId} onChange={(e) => setCardId(e.target.value)}>
        <option value="">-- kaart --</option>
        {player.hand.map((cid, i) => (
          <option key={`${cid}-${i}`} value={cid}>
            {cardLabel(cid)}
          </option>
        ))}
      </select>{' '}
      <button
        disabled={!slotId || !cardId}
        onClick={() =>
          dispatchAction({ type: 'build', playerId: player.id, regionId, slotId, industryType, cardId })
        }
      >
        Bouw
      </button>
      <ActionPreview
        state={state}
        action={
          slotId && cardId
            ? { type: 'build', playerId: player.id, regionId, slotId, industryType, cardId }
            : null
        }
      />
    </fieldset>
  );
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
  const [regionB, setRegionB] = useState(state.regions[1]?.id ?? '');
  const [cardId, setCardId] = useState('');

  return (
    <fieldset style={{ marginTop: '1rem' }}>
      <legend>Netwerken (Link bouwen)</legend>
      <select value={regionA} onChange={(e) => setRegionA(e.target.value)}>
        {state.regions.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </select>{' '}
      <select value={regionB} onChange={(e) => setRegionB(e.target.value)}>
        {state.regions.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </select>{' '}
      <select value={cardId} onChange={(e) => setCardId(e.target.value)}>
        <option value="">-- kaart --</option>
        {player.hand.map((cid, i) => (
          <option key={`${cid}-${i}`} value={cid}>
            {cardLabel(cid)}
          </option>
        ))}
      </select>{' '}
      <button
        disabled={!cardId || regionA === regionB}
        onClick={() => dispatchAction({ type: 'network', playerId: player.id, regionA, regionB, cardId })}
      >
        Leg link
      </button>
      <ActionPreview
        state={state}
        action={cardId && regionA !== regionB ? { type: 'network', playerId: player.id, regionA, regionB, cardId } : null}
      />
    </fieldset>
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

  return (
    <fieldset style={{ marginTop: '1rem' }}>
      <legend>Ontwikkelen</legend>
      <select value={industryType} onChange={(e) => setIndustryType(e.target.value as IndustryType)}>
        {INDUSTRY_TYPES.map((t) => (
          <option key={t} value={t}>
            {t} ({player.industryStock[t]?.length ?? 0} over)
          </option>
        ))}
      </select>{' '}
      <select value={cardId} onChange={(e) => setCardId(e.target.value)}>
        <option value="">-- kaart (willekeurig) --</option>
        {player.hand.map((cid, i) => (
          <option key={`${cid}-${i}`} value={cid}>
            {cardLabel(cid)}
          </option>
        ))}
      </select>{' '}
      <button
        disabled={!cardId}
        onClick={() => dispatchAction({ type: 'develop', playerId: player.id, industryType, cardId })}
      >
        Ontwikkel
      </button>
      <ActionPreview
        state={state}
        action={cardId ? { type: 'develop', playerId: player.id, industryType, cardId } : null}
      />
    </fieldset>
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
    <fieldset style={{ marginTop: '1rem' }}>
      <legend>Verkopen</legend>
      {sellableTiles.length === 0 && <p>Geen verkoopbare tegels.</p>}
      {sellableTiles.map((tile) => {
        const region = state.regions.find((r) => r.id === tile.regionId);
        return (
          <label key={tile.id} style={{ display: 'block' }}>
            <input type="checkbox" checked={selected.includes(tile.id)} onChange={() => toggle(tile.id)} />
            {tile.type} L{tile.level} @ {region?.name ?? tile.regionId}
          </label>
        );
      })}
      <button
        disabled={selected.length === 0}
        onClick={() => {
          dispatchAction({ type: 'sell', playerId: player.id, tileIds: selected });
          setSelected([]);
        }}
      >
        Verkoop geselecteerde tegels
      </button>
    </fieldset>
  );
}

function EraEndSummary({ state }: { state: GameState }) {
  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Pioniersfase voltooid</h1>
      <table border={1} cellPadding={4} style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Speler</th>
            <th>VP uit tegels</th>
            <th>VP uit Links</th>
            <th>Totaal</th>
          </tr>
        </thead>
        <tbody>
          {state.players.map((p) => {
            const score = state.finalScores?.[p.id];
            return (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{score?.flippedVp ?? 0}</td>
                <td>{score?.linkVp ?? 0}</td>
                <td>{score?.total ?? 0}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}

export default function GamePage() {
  const router = useRouter();
  const gameState = useGameStore((s) => s.gameState);
  const lastError = useGameStore((s) => s.lastError);
  const dispatchAction = useGameStore((s) => s.dispatchAction);
  const loadFromStorage = useGameStore((s) => s.loadFromStorage);

  useEffect(() => {
    if (!gameState) loadFromStorage();
  }, [gameState, loadFromStorage]);

  if (!gameState) {
    return (
      <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        <p>Geen actief spel gevonden.</p>
        <button onClick={() => router.push('/')}>Terug naar setup</button>
      </main>
    );
  }

  if (gameState.phase === 'eraEnded') {
    return <EraEndSummary state={gameState} />;
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex]!;

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Sovereign — Pioniersfase</h1>
      <TurnBanner state={gameState} />
      {lastError && <p style={{ color: 'red' }}>Fout: {lastError}</p>}

      <BoardSvg state={gameState} />

      <PlayerSummary state={gameState} />
      <PlayerHandPanel player={currentPlayer} />
      <DemandTrackView track={gameState.market.handelspostDemand} label="Handelspost-vraag" />
      <IncomeTrackView players={gameState.players} />

      <BuildForm state={gameState} player={currentPlayer} dispatchAction={dispatchAction} />
      <NetworkForm state={gameState} player={currentPlayer} dispatchAction={dispatchAction} />
      <DevelopForm state={gameState} player={currentPlayer} dispatchAction={dispatchAction} />
      <SellForm state={gameState} player={currentPlayer} dispatchAction={dispatchAction} />

      <fieldset style={{ marginTop: '1rem' }}>
        <legend>Overig</legend>
        <button onClick={() => dispatchAction({ type: 'loan', playerId: currentPlayer.id })}>
          Leen ({gameState.market.loanPoolRemaining} over)
        </button>{' '}
        <button onClick={() => dispatchAction({ type: 'endTurn', playerId: currentPlayer.id })}>
          Beurt beëindigen
        </button>
        <ActionPreview state={gameState} action={{ type: 'loan', playerId: currentPlayer.id }} />
      </fieldset>

      <details style={{ marginTop: '2rem' }}>
        <summary>Ruwe staat (debug)</summary>
        <pre style={{ maxHeight: 400, overflow: 'auto' }}>{JSON.stringify(gameState, null, 2)}</pre>
      </details>
    </main>
  );
}
