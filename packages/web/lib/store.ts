'use client';

import { create } from 'zustand';
import { createInitialState, dispatch, type GameAction, type GameState } from '@sovereign/engine';

const STORAGE_KEY = 'sovereign-game-state';

interface GameStore {
  gameState: GameState | null;
  lastError: string | null;
  startGame: (playerNames: string[]) => void;
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
