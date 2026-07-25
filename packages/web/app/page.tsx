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
    <main style={{ padding: '2rem', maxWidth: 480, fontFamily: 'sans-serif' }}>
      <h1>Sovereign</h1>
      <p>Pioniersfase — lokaal pass-and-play (2-4 spelers)</p>

      <label style={{ display: 'block', marginTop: '1rem' }}>
        Aantal spelers:{' '}
        <select value={playerCount} onChange={(e) => setPlayerCount(Number(e.target.value))}>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
        </select>
      </label>

      <div style={{ marginTop: '1rem' }}>
        {names.slice(0, playerCount).map((name, i) => (
          <div key={i} style={{ marginBottom: '0.5rem' }}>
            <label>
              Speler {i + 1}:{' '}
              <input
                value={name}
                onChange={(e) => {
                  const next = [...names];
                  next[i] = e.target.value;
                  setNames(next);
                }}
              />
            </label>
          </div>
        ))}
      </div>

      <button style={{ marginTop: '1rem' }} onClick={handleStart}>
        Start spel
      </button>
    </main>
  );
}
