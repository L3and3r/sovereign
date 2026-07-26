'use client';

import {
  CARD_DEFS_BY_ID,
  INDUSTRY_TYPES,
  MAP_EDGES,
  dispatch,
  pickAutomaAction,
  pickAutomaReaction,
  type GameAction,
  type GameState,
  type IndustryType,
  type MapEdgeDef,
  type PlayerState,
} from '@sovereign/engine';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BoardSvg } from '../../components/board/BoardSvg';
import { IndustryIconPaths } from '../../components/board/IndustryIconPaths';
import { IndustryLegend } from '../../components/board/IndustryLegend';
import { PlayerHandPanel } from '../../components/hand/PlayerHandPanel';
import { HelpPanel } from '../../components/layout/HelpPanel';
import { TurnBanner } from '../../components/layout/TurnBanner';
import { TutorialOverlay } from '../../components/layout/TutorialOverlay';
import { DemandTrackView } from '../../components/market/DemandTrackView';
import { IncomeTrackView } from '../../components/market/IncomeTrackView';
import { useGameStore } from '../../lib/store';
import { colorForPlayerIndex, INDUSTRY_COLORS } from '../../styles/tokens';

/** Cost/outcome preview: calls the pure engine dispatch against the current state without
 * committing, and discards the result if the player doesn't confirm. */
function ActionPreview({ state, action }: { state: GameState; action: GameAction | null }) {
  if (!action) return null;
  const result = dispatch(state, action);
  if (!result.ok) {
    return <p className="preview-warn">{result.error}</p>;
  }
  const playerId = 'playerId' in action ? action.playerId : undefined;
  const before = state.players.find((p) => p.id === playerId);
  const after = result.state.players.find((p) => p.id === playerId);
  if (!before || !after) return null;
  const satsDelta = after.sats - before.sats;
  return (
    <p className="preview-ok">
      sats {satsDelta >= 0 ? '+' : ''}
      {satsDelta}, inkomenspositie {after.incomePosition >= before.incomePosition ? '+' : ''}
      {after.incomePosition - before.incomePosition}
    </p>
  );
}

const RESOURCE_GEMS = {
  sats: '#f7931a',
  energy: '#ffd700',
  bandwidth: '#3fb8af',
} as const;

function PlayerRoster({ state }: { state: GameState }) {
  return (
    <div className="stack" style={{ gap: '0.7rem' }}>
      {state.players.map((p, i) => (
        <div
          key={p.id}
          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', opacity: i === state.currentPlayerIndex ? 1 : 0.55 }}
        >
          <span className="player-portrait" style={{ background: colorForPlayerIndex(i) }}>
            {p.name.charAt(0).toUpperCase()}
          </span>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: i === state.currentPlayerIndex ? 700 : 400 }}>
              {p.name}
              {p.isAutoma && <span title="Automa"> 🤖</span>}
            </div>
            <div className="resource-row">
              <span className="resource-crystal">
                <span className="gem" style={{ background: RESOURCE_GEMS.sats }} />
                {p.sats}
              </span>
              <span className="resource-crystal">
                <span className="gem" style={{ background: RESOURCE_GEMS.energy }} />
                {p.energy}
              </span>
              <span className="resource-crystal">
                <span className="gem" style={{ background: RESOURCE_GEMS.bandwidth }} />
                {p.bandwidth}
              </span>
              <span className="resource-crystal" style={{ color: 'var(--text-muted)' }}>
                inc {p.incomePosition} &middot; {p.hand.length} krt
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** For a given hand card, the empty board slots it can legally build into, keyed by
 * "regionId:slotId", each mapped to the industry type(s) that slot+card combination allows. */
function buildTargetsForCard(state: GameState, player: PlayerState, cardId: string): Map<string, IndustryType[]> {
  const def = CARD_DEFS_BY_ID[cardId];
  const targets = new Map<string, IndustryType[]>();
  if (!def) return targets;
  if (def.type === 'wildcardRegion' && !player.wildcardsAvailable.region) return targets;
  if (def.type === 'wildcardIndustry' && !player.wildcardsAvailable.industry) return targets;

  const impliedRegionId = def.type === 'region' ? def.regionId : null;
  const impliedIndustryType = def.type === 'industry' ? def.industryType : null;

  for (const region of state.regions) {
    if (impliedRegionId && region.id !== impliedRegionId) continue;
    for (const slot of region.slots) {
      if (slot.occupiedByTileId) continue;
      const candidates = slot.allowedTypes.filter((t) => {
        if (impliedIndustryType && t !== impliedIndustryType) return false;
        return (player.industryStock[t]?.length ?? 0) > 0;
      });
      if (candidates.length > 0) targets.set(`${region.id}:${slot.id}`, candidates);
    }
  }
  return targets;
}

function isEdgeBuilt(state: GameState, edge: MapEdgeDef): boolean {
  return state.links.some(
    (l) =>
      (l.regionA === edge.regionA && l.regionB === edge.regionB) || (l.regionA === edge.regionB && l.regionB === edge.regionA),
  );
}

/** For a given hand card, the not-yet-built map edges it can legally link. */
function networkTargetsForCard(state: GameState, player: PlayerState, cardId: string): Set<string> {
  const def = CARD_DEFS_BY_ID[cardId];
  const ids = new Set<string>();
  if (!def) return ids;
  if (def.type === 'wildcardRegion') {
    if (!player.wildcardsAvailable.region) return ids;
    for (const edge of MAP_EDGES) if (!isEdgeBuilt(state, edge)) ids.add(edge.id);
    return ids;
  }
  if (def.type === 'region') {
    for (const edge of MAP_EDGES) {
      if (isEdgeBuilt(state, edge)) continue;
      if (edge.regionA === def.regionId || edge.regionB === def.regionId) ids.add(edge.id);
    }
  }
  return ids;
}

function confiscateTargetsForOwner(state: GameState, ownerId: string): Set<string> {
  const protectedRegionIds = new Set(
    state.tiles.filter((t) => t.type === 'kluis' && t.ownerId === ownerId).map((t) => t.regionId),
  );
  return new Set(
    state.tiles.filter((t) => t.ownerId === ownerId && !t.disabled && !protectedRegionIds.has(t.regionId)).map((t) => t.id),
  );
}

function IndustryTypeButton({
  type,
  active,
  disabled,
  onClick,
}: {
  type: IndustryType;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className="btn industry-btn"
      disabled={disabled}
      onClick={onClick}
      style={{
        borderColor: active ? INDUSTRY_COLORS[type] : undefined,
        background: active ? `${INDUSTRY_COLORS[type]}33` : undefined,
      }}
      title={type}
    >
      <svg viewBox="-12 -12 24 24" width={18} height={18}>
        <IndustryIconPaths type={type} color={INDUSTRY_COLORS[type]} />
      </svg>
    </button>
  );
}

const TUTORIAL_STORAGE_KEY = 'sovereign-tutorial-seen';

const TUTORIAL_STEPS: { title: string; body: string }[] = [
  {
    title: 'Welkom bij Sovereign',
    body: "Deze korte tutorial leidt je door je eerste beurt. Klik op 'Volgende' om te beginnen.",
  },
  { title: 'Bouwen — stap 1', body: 'Kies hieronder een kaart uit je hand om een industrie te bouwen.' },
  {
    title: 'Bouwen — stap 2',
    body: 'Klik op een oranje gemarkeerd slot op het bord — dat is een geldige bouwplek voor deze kaart.',
  },
  { title: 'Bouwen — stap 3', body: "Bevestig met de knop 'Bouw'. Je ziet vooraf wat het kost." },
  {
    title: 'Netwerken',
    body: "Je hebt nog 1 actie over deze beurt. Klik op het tabblad 'Netwerken' om een verbinding te leggen.",
  },
  { title: 'Netwerken — stap 1', body: 'Kies een kaart uit je hand om een link te bouwen.' },
  { title: 'Netwerken — stap 2', body: "Klik op een gemarkeerde verbinding tussen twee regio's op het bord." },
  { title: 'Netwerken — stap 3', body: "Bevestig met 'Leg link'." },
  { title: 'Beurt beëindigen', body: "Je hebt beide acties gebruikt. Klik op 'Beurt beëindigen' onderaan." },
  {
    title: 'Klaar!',
    body: 'Zo werkt het spel: kies een kaart, klik op het bord, bevestig. Ontwikkelen en Verkopen werken hetzelfde. Veel plezier!',
  },
];

const TABS = [
  { id: 'build', label: 'Bouwen' },
  { id: 'network', label: 'Netwerken' },
  { id: 'develop', label: 'Ontwikkelen' },
  { id: 'sell', label: 'Verkopen' },
  { id: 'loan', label: 'Lenen' },
] as const;

type TabId = (typeof TABS)[number]['id'];

function ReactionWindow({
  state,
  dispatchAction,
}: {
  state: GameState;
  dispatchAction: (action: GameAction) => void;
}) {
  const pendingReaction = state.pendingReaction!;
  const reactingPlayer = state.players.find((p) => p.id === pendingReaction.eligiblePlayerIds[0])!;
  const seller = state.players.find((p) => p.id === pendingReaction.triggerPlayerId)!;

  const [cardId, setCardId] = useState<string | null>(null);
  const [targetTileId, setTargetTileId] = useState<string | null>(null);

  useEffect(() => {
    setCardId(null);
    setTargetTileId(null);
  }, [reactingPlayer.id]);

  const dreigingCardIds = new Set(reactingPlayer.hand.filter((id) => CARD_DEFS_BY_ID[id]?.type === 'dreiging'));
  const targets = cardId ? confiscateTargetsForOwner(state, seller.id) : new Set<string>();
  const confiscateAction: GameAction | null =
    cardId && targetTileId ? { type: 'confiscate', playerId: reactingPlayer.id, cardId, targetTileId } : null;

  function pass() {
    dispatchAction({ type: 'passReaction', playerId: reactingPlayer.id });
  }

  function confiscate() {
    if (!confiscateAction) return;
    dispatchAction(confiscateAction);
  }

  return (
    <main className="page">
      <header className="app-header">
        <h1 className="app-title">
          <span className="mark">◆</span> SOVEREIGN
        </h1>
      </header>

      <div className="panel" style={{ marginBottom: '1.25rem', borderColor: 'var(--accent)' }}>
        <p className="panel-title" style={{ color: 'var(--accent)' }}>
          Reactievenster
        </p>
        <p style={{ fontSize: '0.9rem' }}>
          {seller.name} heeft verkocht. <strong>{reactingPlayer.name}</strong>, wil je een Dreigingskaart spelen
          tegen een tegel van {seller.name}?
        </p>
      </div>

      <div className="game-grid">
        <div className="panel">
          <BoardSvg
            state={state}
            selectableTileIds={cardId ? targets : undefined}
            selectedTileIds={targetTileId ? new Set([targetTileId]) : undefined}
            onTileClick={cardId ? (tileId) => setTargetTileId(tileId) : undefined}
          />
          <div style={{ marginTop: '0.85rem' }}>
            <IndustryLegend />
          </div>
        </div>

        <div className="stack">
          <div className="panel">
            <PlayerHandPanel
              player={reactingPlayer}
              selectedCardId={cardId}
              playableCardIds={dreigingCardIds}
              onSelectCard={(id) => {
                setCardId(id);
                setTargetTileId(null);
              }}
            />
          </div>

          <div className="panel stack">
            {dreigingCardIds.size === 0 && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Geen Dreigingskaart op de hand van {reactingPlayer.name}.
              </p>
            )}
            {cardId && targets.size === 0 && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Alle tegels van {seller.name} zijn beschermd door een Kluis of al buiten werking gesteld.
              </p>
            )}
            {cardId && targetTileId && (
              <div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Doelwit stelt de tegel buiten werking en kost {seller.name} 2 inkomenspositie.
                </p>
                <button className="btn btn-primary" onClick={confiscate}>
                  Confisqueer
                </button>
              </div>
            )}
            <button className="btn" onClick={pass}>
              Niets doen
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function EraEndSummary({
  state,
  onStartNextEra,
  onNewGame,
}: {
  state: GameState;
  onStartNextEra: () => void;
  onNewGame: () => void;
}) {
  const isTransition = state.phase === 'eraTransition';
  const winnerId = !isTransition
    ? state.players.reduce((best, p) => {
        const total = state.finalScores?.[p.id]?.total ?? 0;
        const bestTotal = state.finalScores?.[best.id]?.total ?? 0;
        return total > bestTotal ? p : best;
      }, state.players[0]!).id
    : null;

  return (
    <main className="page" style={{ maxWidth: 520 }}>
      <h1 className="app-title" style={{ marginBottom: '1.5rem' }}>
        <span className="mark">◆</span> {isTransition ? 'PIONIERSFASE VOLTOOID' : 'NETWERKFASE VOLTOOID — EINDSTAND'}
      </h1>
      <div className="panel">
        {state.players.map((p, i) => {
          const industryScore = state.eraScores?.pioniersfase?.[p.id];
          const finalScore = state.finalScores?.[p.id];
          return (
            <div
              key={p.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.6rem 0',
                borderBottom: '1px solid var(--border)',
                opacity: winnerId && winnerId !== p.id ? 0.7 : 1,
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="player-portrait" style={{ background: colorForPlayerIndex(i), width: 22, height: 22, fontSize: '0.65rem' }}>
                  {p.name.charAt(0).toUpperCase()}
                </span>
                {p.name}
                {winnerId === p.id && <span style={{ color: 'var(--accent)' }}>&nbsp;★</span>}
              </span>
              {isTransition ? (
                <span style={{ fontFamily: 'var(--font-display)', color: 'var(--text-muted)' }}>
                  tegels <strong style={{ color: 'var(--accent)' }}>{industryScore?.flippedVp ?? 0} VP</strong> · links
                  tellen mee bij het spel-einde
                </span>
              ) : (
                <span style={{ fontFamily: 'var(--font-display)', color: 'var(--text-muted)' }}>
                  tegels {finalScore?.flippedVp ?? 0} + links {finalScore?.linkVp ?? 0} ={' '}
                  <strong style={{ color: 'var(--accent)' }}>{finalScore?.total ?? 0} VP</strong>
                </span>
              )}
            </div>
          );
        })}
      </div>
      <button
        className="btn btn-primary"
        style={{ marginTop: '1.5rem' }}
        onClick={isTransition ? onStartNextEra : onNewGame}
      >
        {isTransition ? 'Start Netwerkfase' : 'Nieuw spel'}
      </button>
    </main>
  );
}

export default function GamePage() {
  const router = useRouter();
  const gameState = useGameStore((s) => s.gameState);
  const lastError = useGameStore((s) => s.lastError);
  const dispatchAction = useGameStore((s) => s.dispatchAction);
  const loadFromStorage = useGameStore((s) => s.loadFromStorage);
  const resetGame = useGameStore((s) => s.resetGame);

  const [activeTab, setActiveTab] = useState<TabId>('build');

  // Bouwen
  const [buildCardId, setBuildCardId] = useState<string | null>(null);
  const [buildSlot, setBuildSlot] = useState<{ regionId: string; slotId: string; candidates: IndustryType[] } | null>(null);
  const [buildType, setBuildType] = useState<IndustryType | null>(null);

  // Netwerken
  const [networkCardId, setNetworkCardId] = useState<string | null>(null);
  const [networkEdge, setNetworkEdge] = useState<MapEdgeDef | null>(null);

  // Ontwikkelen
  const [developCardId, setDevelopCardId] = useState<string | null>(null);
  const [developType, setDevelopType] = useState<IndustryType | null>(null);

  // Verkopen
  const [sellTileIds, setSellTileIds] = useState<Set<string>>(new Set());

  // Tutorial
  const [tutorialActive, setTutorialActive] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  useEffect(() => {
    if (!gameState) loadFromStorage();
  }, [gameState, loadFromStorage]);

  useEffect(() => {
    if (typeof window === 'undefined' || !gameState) return;
    const seen = window.localStorage.getItem(TUTORIAL_STORAGE_KEY);
    const isFreshGame =
      gameState.roundNumber === 1 && gameState.currentPlayerIndex === 0 && gameState.actionsTakenThisTurn === 0 && gameState.tiles.length === 0;
    if (!seen && isFreshGame) {
      setTutorialActive(true);
      setTutorialStep(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Drives the Automa's turns and reactions one step at a time. Re-fires automatically after
  // every dispatch (gameState changes identity), so a full Automa turn plays out as a short
  // sequence of visible moves rather than one instant jump - not an "AI thinks" delay, just enough
  // pacing to follow along (game-concept.md §14).
  useEffect(() => {
    if (!gameState || gameState.phase !== 'playing') return undefined;

    let action: GameAction | null = null;
    if (gameState.pendingReaction) {
      const reactingPlayer = gameState.players.find((p) => p.id === gameState.pendingReaction!.eligiblePlayerIds[0]);
      if (reactingPlayer?.isAutoma) action = pickAutomaReaction(gameState, reactingPlayer.id);
    } else {
      const current = gameState.players[gameState.currentPlayerIndex]!;
      if (current.isAutoma) {
        const budget = current.automaConfig?.actionsPerTurn ?? 2;
        action =
          gameState.actionsTakenThisTurn >= budget
            ? { type: 'endTurn', playerId: current.id }
            : (pickAutomaAction(gameState, current.id) ?? { type: 'endTurn', playerId: current.id });
      }
    }

    if (!action) return undefined;
    const readyAction = action;
    const timer = setTimeout(() => dispatchAction(readyAction), 500);
    return () => clearTimeout(timer);
  }, [gameState, dispatchAction]);

  function advanceTutorialIfOnStep(step: number) {
    setTutorialStep((current) => (tutorialActive && current === step ? step + 1 : current));
  }

  function dismissTutorial() {
    setTutorialActive(false);
    if (typeof window !== 'undefined') window.localStorage.setItem(TUTORIAL_STORAGE_KEY, '1');
  }

  function restartTutorial() {
    resetSelections();
    setActiveTab('build');
    setTutorialStep(0);
    setTutorialActive(true);
  }

  function resetSelections() {
    setBuildCardId(null);
    setBuildSlot(null);
    setBuildType(null);
    setNetworkCardId(null);
    setNetworkEdge(null);
    setDevelopCardId(null);
    setDevelopType(null);
    setSellTileIds(new Set());
  }

  function changeTab(tab: TabId) {
    resetSelections();
    setActiveTab(tab);
    if (tab === 'network') advanceTutorialIfOnStep(4);
  }

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

  if (gameState.phase === 'eraTransition' || gameState.phase === 'gameEnded') {
    return (
      <EraEndSummary
        state={gameState}
        onStartNextEra={() => dispatchAction({ type: 'startNextEra', seed: Date.now() })}
        onNewGame={() => {
          resetGame();
          router.push('/');
        }}
      />
    );
  }

  if (gameState.pendingReaction) {
    const reactingPlayer = gameState.players.find((p) => p.id === gameState.pendingReaction!.eligiblePlayerIds[0]);
    if (!reactingPlayer?.isAutoma) {
      return <ReactionWindow state={gameState} dispatchAction={dispatchAction} />;
    }
    // Automa reactions resolve silently via the effect above; fall through to the normal board
    // so the human isn't shown a UI meant for a human reactor.
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex]!;

  // --- Derive board highlight/selection props for the active tab ---
  let highlightedSlotKeys: Set<string> | undefined;
  let onSlotClick: ((regionId: string, slotId: string) => void) | undefined;
  let highlightedEdgeIds: Set<string> | undefined;
  let onEdgeClick: ((edge: MapEdgeDef) => void) | undefined;
  let selectableTileIds: Set<string> | undefined;
  let selectedTileIds: Set<string> | undefined;
  let onTileClick: ((tileId: string) => void) | undefined;

  const buildTargets = buildCardId ? buildTargetsForCard(gameState, currentPlayer, buildCardId) : new Map();

  if (activeTab === 'build') {
    if (buildCardId && !buildSlot) {
      highlightedSlotKeys = new Set(buildTargets.keys());
      onSlotClick = (regionId, slotId) => {
        const candidates = buildTargets.get(`${regionId}:${slotId}`);
        if (!candidates) return;
        setBuildSlot({ regionId, slotId, candidates });
        setBuildType(candidates.length === 1 ? candidates[0]! : null);
        advanceTutorialIfOnStep(2);
      };
    }
  } else if (activeTab === 'network') {
    if (networkCardId && !networkEdge) {
      const targets = networkTargetsForCard(gameState, currentPlayer, networkCardId);
      highlightedEdgeIds = targets;
      onEdgeClick = (edge) => {
        setNetworkEdge(edge);
        advanceTutorialIfOnStep(6);
      };
    }
  } else if (activeTab === 'sell') {
    selectableTileIds = new Set(
      gameState.tiles
        .filter((t) => t.ownerId === currentPlayer.id && !t.flipped && (t.type === 'handelspost' || t.type === 'mediaEnEducatie'))
        .map((t) => t.id),
    );
    selectedTileIds = sellTileIds;
    onTileClick = (tileId) =>
      setSellTileIds((prev) => {
        const next = new Set(prev);
        if (next.has(tileId)) next.delete(tileId);
        else next.add(tileId);
        return next;
      });
  }

  const buildAction: GameAction | null =
    buildCardId && buildSlot && buildType
      ? { type: 'build', playerId: currentPlayer.id, regionId: buildSlot.regionId, slotId: buildSlot.slotId, industryType: buildType, cardId: buildCardId }
      : null;
  const networkAction: GameAction | null =
    networkCardId && networkEdge
      ? { type: 'network', playerId: currentPlayer.id, regionA: networkEdge.regionA, regionB: networkEdge.regionB, cardId: networkCardId }
      : null;
  const developAction: GameAction | null =
    developCardId && developType ? { type: 'develop', playerId: currentPlayer.id, industryType: developType, cardId: developCardId } : null;
  const sellAction: GameAction | null = sellTileIds.size > 0 ? { type: 'sell', playerId: currentPlayer.id, tileIds: [...sellTileIds] } : null;
  const loanAction: GameAction = { type: 'loan', playerId: currentPlayer.id };

  function regionName(regionId: string): string {
    return gameState!.regions.find((r) => r.id === regionId)?.name ?? regionId;
  }

  return (
    <main className="page">
      <header className="app-header">
        <h1 className="app-title">
          <span className="mark">◆</span> SOVEREIGN
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="tutorial-restart-btn" onClick={restartTutorial}>
            Tutorial
          </button>
          <span style={{ fontFamily: 'var(--font-display)', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
            {gameState.era === 'pioniersfase' ? 'PIONIERSFASE' : 'NETWERKFASE'}
          </span>
        </div>
      </header>

      <HelpPanel />
      <TurnBanner state={gameState} />
      {lastError && <div className="error-banner" style={{ marginBottom: '1.25rem' }}>{lastError}</div>}

      <div className="game-grid">
        <div className="stack">
          <div className="panel">
            <BoardSvg
              state={gameState}
              highlightedSlotKeys={highlightedSlotKeys}
              onSlotClick={onSlotClick}
              highlightedEdgeIds={highlightedEdgeIds}
              onEdgeClick={onEdgeClick}
              selectableTileIds={selectableTileIds}
              selectedTileIds={selectedTileIds}
              onTileClick={onTileClick}
            />
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
            <div className="action-tabs">
              {TABS.map((tab) => (
                <button key={tab.id} className={`action-tab${activeTab === tab.id ? ' is-active' : ''}`} onClick={() => changeTab(tab.id)}>
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'build' && (
              <div className="stack">
                <p className="step-hint">
                  {!buildCardId
                    ? '1. Kies hieronder een kaart uit je hand.'
                    : !buildSlot
                      ? '2. Klik op een gemarkeerd slot op het bord.'
                      : buildSlot.candidates.length > 1 && !buildType
                        ? '3. Kies welk industrietype je hier bouwt.'
                        : '4. Bevestig de bouw.'}
                </p>
                {buildCardId && buildSlot && (
                  <div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                      {regionName(buildSlot.regionId)} — slot {buildSlot.slotId}
                    </p>
                    {buildSlot.candidates.length > 1 && (
                      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.5rem' }}>
                        {buildSlot.candidates.map((t) => (
                          <IndustryTypeButton key={t} type={t} active={buildType === t} onClick={() => setBuildType(t)} />
                        ))}
                      </div>
                    )}
                    <button
                      className="btn btn-primary"
                      disabled={!buildAction}
                      onClick={() => {
                        if (!buildAction) return;
                        dispatchAction(buildAction);
                        resetSelections();
                        advanceTutorialIfOnStep(3);
                      }}
                    >
                      Bouw
                    </button>{' '}
                    <button className="btn" onClick={() => { setBuildSlot(null); setBuildType(null); }}>
                      Terug
                    </button>
                    <ActionPreview state={gameState} action={buildAction} />
                  </div>
                )}
              </div>
            )}

            {activeTab === 'network' && (
              <div className="stack">
                <p className="step-hint">
                  {!networkCardId
                    ? '1. Kies hieronder een kaart uit je hand.'
                    : !networkEdge
                      ? '2. Klik op een gemarkeerde verbinding op het bord.'
                      : '3. Bevestig de link.'}
                </p>
                {networkCardId && networkEdge && (
                  <div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                      {regionName(networkEdge.regionA)} &harr; {regionName(networkEdge.regionB)}
                    </p>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        if (!networkAction) return;
                        dispatchAction(networkAction);
                        resetSelections();
                        advanceTutorialIfOnStep(7);
                      }}
                    >
                      Leg link
                    </button>{' '}
                    <button className="btn" onClick={() => setNetworkEdge(null)}>
                      Terug
                    </button>
                    <ActionPreview state={gameState} action={networkAction} />
                  </div>
                )}
                {networkCardId && !networkEdge && networkTargetsForCard(gameState, currentPlayer, networkCardId).size === 0 && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Geen aangrenzende, nog niet gelegde verbinding beschikbaar voor deze kaart.
                  </p>
                )}
              </div>
            )}

            {activeTab === 'develop' && (
              <div className="stack">
                <p className="step-hint">
                  {!developCardId ? '1. Kies hieronder een kaart om te ontwikkelen (elke kaart werkt).' : '2. Kies een industrietype.'}
                </p>
                {developCardId && (
                  <div>
                    <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.5rem' }}>
                      {INDUSTRY_TYPES.map((t) => (
                        <IndustryTypeButton
                          key={t}
                          type={t}
                          active={developType === t}
                          disabled={(currentPlayer.industryStock[t]?.length ?? 0) === 0}
                          onClick={() => setDevelopType(t)}
                        />
                      ))}
                    </div>
                    <button
                      className="btn btn-primary"
                      disabled={!developAction}
                      onClick={() => developAction && (dispatchAction(developAction), resetSelections())}
                    >
                      Ontwikkel
                    </button>
                    <ActionPreview state={gameState} action={developAction} />
                  </div>
                )}
              </div>
            )}

            {activeTab === 'sell' && (
              <div className="stack">
                <p className="step-hint">Klik op je Handelspost/Media-tegels op het bord om ze te selecteren.</p>
                {selectableTileIds && selectableTileIds.size === 0 && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Geen verkoopbare tegels. Bouw eerst een Handelspost of Media &amp; Educatie, verbonden via een Link met een
                    Netwerkhub.
                  </p>
                )}
                {sellTileIds.size > 0 && (
                  <div>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        if (sellAction) dispatchAction(sellAction);
                        resetSelections();
                      }}
                    >
                      Verkoop {sellTileIds.size} tegel{sellTileIds.size > 1 ? 's' : ''}
                    </button>
                    <ActionPreview state={gameState} action={sellAction} />
                  </div>
                )}
              </div>
            )}

            {activeTab === 'loan' && (
              <div className="stack">
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  +30 sats direct, maar -3 permanent op de inkomenstrack. Gedeelde pool: {gameState.market.loanPoolRemaining} over.
                </p>
                <div>
                  <button
                    className="btn btn-primary"
                    disabled={gameState.market.loanPoolRemaining <= 0}
                    onClick={() => dispatchAction(loanAction)}
                  >
                    Leen
                  </button>
                  <ActionPreview state={gameState} action={loanAction} />
                </div>
              </div>
            )}
          </div>

          <div className="panel">
            <PlayerHandPanel
              player={currentPlayer}
              selectedCardId={
                activeTab === 'build' ? buildCardId : activeTab === 'network' ? networkCardId : activeTab === 'develop' ? developCardId : null
              }
              onSelectCard={
                activeTab === 'build'
                  ? (cardId) => {
                      setBuildCardId(cardId);
                      setBuildSlot(null);
                      setBuildType(null);
                      advanceTutorialIfOnStep(1);
                    }
                  : activeTab === 'network'
                    ? (cardId) => {
                        setNetworkCardId(cardId);
                        setNetworkEdge(null);
                        advanceTutorialIfOnStep(5);
                      }
                    : activeTab === 'develop'
                      ? (cardId) => setDevelopCardId(cardId)
                      : undefined
              }
            />
          </div>

          <button
            className="btn"
            style={{ width: '100%' }}
            onClick={() => {
              dispatchAction({ type: 'endTurn', playerId: currentPlayer.id });
              resetSelections();
              advanceTutorialIfOnStep(8);
            }}
          >
            Beurt beëindigen
          </button>
        </div>
      </div>

      <details style={{ marginTop: '2rem' }}>
        <summary style={{ cursor: 'pointer', color: 'var(--text-faint)', fontSize: '0.75rem' }}>Debug</summary>
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

      {tutorialActive && (
        <TutorialOverlay
          step={tutorialStep}
          total={TUTORIAL_STEPS.length}
          title={TUTORIAL_STEPS[tutorialStep]!.title}
          body={TUTORIAL_STEPS[tutorialStep]!.body}
          showNext={tutorialStep === 0 || tutorialStep === TUTORIAL_STEPS.length - 1}
          nextLabel={tutorialStep === TUTORIAL_STEPS.length - 1 ? 'Voltooien' : 'Volgende'}
          onNext={() => (tutorialStep === TUTORIAL_STEPS.length - 1 ? dismissTutorial() : setTutorialStep(1))}
          onSkip={dismissTutorial}
        />
      )}
    </main>
  );
}
