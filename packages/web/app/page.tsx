'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useGameStore } from '../lib/store';

const DEFAULT_NAMES = ['Alice', 'Bob', 'Cara', 'Dave'];

export default function HomePage() {
  const [playerCount, setPlayerCount] = useState(2);
  const [names, setNames] = useState(DEFAULT_NAMES);
  const startGame = useGameStore((s) => s.startGame);
  const router = useRouter();

  function handleStart() {
    startGame(names.slice(0, playerCount));
    router.push('/game');
  }

  return (
    <main className="page" style={{ maxWidth: 520 }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 className="app-title" style={{ fontSize: '2.25rem' }}>
          <span className="mark">◆</span> SOVEREIGN
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          Pioniersfase — lokaal pass-and-play voor 2-4 spelers.
        </p>
      </div>

      <div className="panel stack">
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

        <button className="btn btn-primary" style={{ marginTop: '0.5rem' }} onClick={handleStart}>
          Start spel
        </button>
      </div>
    </main>
  );
}
