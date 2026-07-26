'use client';

import type { AutomaDifficulty } from '@sovereign/engine';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useGameStore } from '../lib/store';

const DEFAULT_NAMES = ['Alice', 'Bob', 'Cara', 'Dave'];

const DIFFICULTIES: { id: AutomaDifficulty; label: string; description: string }[] = [
  { id: 'makkelijk', label: 'Makkelijk', description: '2 acties/beurt, geen marktverdringing, geen confiscatie.' },
  { id: 'gemiddeld', label: 'Gemiddeld', description: '2 acties/beurt, af en toe marktverdringing en confiscatie.' },
  { id: 'moeilijk', label: 'Moeilijk', description: '3 acties/beurt, agressieve marktverdringing, confisqueert altijd.' },
];

export default function HomePage() {
  const [mode, setMode] = useState<'multiplayer' | 'solo'>('multiplayer');
  const [playerCount, setPlayerCount] = useState(2);
  const [names, setNames] = useState(DEFAULT_NAMES);
  const [humanName, setHumanName] = useState('Speler');
  const [difficulty, setDifficulty] = useState<AutomaDifficulty>('gemiddeld');
  const startGame = useGameStore((s) => s.startGame);
  const startSoloGame = useGameStore((s) => s.startSoloGame);
  const router = useRouter();

  function handleStart() {
    if (mode === 'solo') {
      startSoloGame(humanName.trim() || 'Speler', difficulty);
    } else {
      startGame(names.slice(0, playerCount));
    }
    router.push('/game');
  }

  return (
    <main className="page" style={{ maxWidth: 520 }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 className="app-title" style={{ fontSize: '2.25rem' }}>
          <span className="mark">◆</span> SOVEREIGN
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          Pioniersfase — lokaal pass-and-play of solo tegen de Automa.
        </p>
      </div>

      <div className="panel stack">
        <div className="action-tabs">
          <button
            className={`action-tab${mode === 'multiplayer' ? ' is-active' : ''}`}
            onClick={() => setMode('multiplayer')}
          >
            Lokaal multiplayer
          </button>
          <button className={`action-tab${mode === 'solo' ? ' is-active' : ''}`} onClick={() => setMode('solo')}>
            Solo tegen Automa
          </button>
        </div>

        {mode === 'multiplayer' ? (
          <>
            <div className="field">
              <label htmlFor="player-count">Aantal spelers</label>
              <select
                id="player-count"
                className="select"
                value={playerCount}
                onChange={(e) => setPlayerCount(Number(e.target.value))}
              >
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
              </select>
            </div>

            <div className="stack" style={{ gap: '0.6rem' }}>
              {names.slice(0, playerCount).map((name, i) => (
                <div className="field" key={i}>
                  <label htmlFor={`player-${i}`}>Speler {i + 1}</label>
                  <input
                    id={`player-${i}`}
                    type="text"
                    className="select"
                    value={name}
                    onChange={(e) => {
                      const next = [...names];
                      next[i] = e.target.value;
                      setNames(next);
                    }}
                  />
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="field">
              <label htmlFor="human-name">Jouw naam</label>
              <input
                id="human-name"
                type="text"
                className="select"
                value={humanName}
                onChange={(e) => setHumanName(e.target.value)}
              />
            </div>

            <div className="stack" style={{ gap: '0.5rem' }}>
              <label>Moeilijkheidsgraad</label>
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.id}
                  className={`btn${difficulty === d.id ? ' btn-primary' : ''}`}
                  style={{ width: '100%', textAlign: 'left' }}
                  onClick={() => setDifficulty(d.id)}
                >
                  <strong>{d.label}</strong>
                  <div style={{ fontSize: '0.75rem', opacity: 0.85, fontWeight: 400 }}>{d.description}</div>
                </button>
              ))}
            </div>
          </>
        )}

        <button className="btn btn-primary" style={{ marginTop: '0.5rem' }} onClick={handleStart}>
          Start spel
        </button>
      </div>
    </main>
  );
}
