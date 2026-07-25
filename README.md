# Sovereign

A digital economic network board game inspired by *Brass: Birmingham*, themed around free markets,
decentralized technology, and bitcoin. See [`game-concept.md`](./game-concept.md) for the full
design document.

## Status

First vertical slice: only the **Pioniersfase** (first era) is implemented — full two-actions-per-turn
economy, local pass-and-play for 2-4 players. No solo automa, no confiscation mechanic
("Dreigingskaarten"), and no second-era transition yet.

## Structure

npm workspaces monorepo:

- `packages/engine` — framework-agnostic TypeScript game engine (pure state/action reducer, no UI
  or network code). Tested with Vitest.
- `packages/web` — Next.js (App Router) UI. Local pass-and-play, SVG board rendering, Zustand
  store with localStorage persistence.

## Getting started

```bash
npm install
npm run dev          # starts the Next.js dev server (packages/web)
npm test              # runs the engine test suite (packages/engine)
```

Open `http://localhost:3000`, set up 2-4 players, and start playing.

## Testing

```bash
npm run test --workspace=@sovereign/engine   # unit tests + headless game simulations
npm run build --workspace=@sovereign/web     # typecheck + production build
```
