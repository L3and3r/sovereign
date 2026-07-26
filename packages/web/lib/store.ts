'use client';

import { create } from 'zustand';
import {
  createAutomaConfig,
  createInitialState,
  dispatch,
  type AutomaDifficulty,
  type GameAction,
  type GameState,
} from '@sovereign/engine';

const STORAGE_KEY = 'sovereign-game-state';

interface GameStore {
  gameState: GameState | null;
  lastError: string | null;
  startGame: (playerNames: string[]) => void;
  startSoloGame: (humanName: string, difficulty: AutomaDifficulty) => void;
  dispatchAction: (action: GameAction) => void;
  loadFromStorage: () => void;
  resetGame: () => void;
}

function persist(state: GameState | null) {
  if (typeof window === 'undefined') return;
  if (state) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } else {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: null,
  lastError: null,

  startGame: (playerNames) => {
    const state = createInitialState(playerNames);
    persist(state);
    set({ gameState: state, lastError: null });
  },

  startSoloGame: (humanName, difficulty) => {
    const seed = Date.now();
    const initial = createInitialState([humanName, 'Automa'], seed);
    const automaConfig = createAutomaConfig(difficulty, seed);
    const state: GameState = {
      ...initial,
      players: initial.players.map((p, i) => (i === 1 ? { ...p, isAutoma: true, automaConfig } : p)),
    };
    persist(state);
    set({ gameState: state, lastError: null });
  },

  dispatchAction: (action) => {
    const current = get().gameState;
    if (!current) return;
    const result = dispatch(current, action);
    if (result.ok) {
      persist(result.state);
      set({ gameState: result.state, lastError: null });
    } else {
      set({ lastError: result.error });
    }
  },

  loadFromStorage: () => {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const state = JSON.parse(raw) as GameState;
      set({ gameState: state, lastError: null });
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  },

  resetGame: () => {
    persist(null);
    set({ gameState: null, lastError: null });
  },
}));
