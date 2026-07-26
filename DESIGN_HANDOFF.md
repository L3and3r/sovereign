# Sovereign — designbrief voor overname door een beeldgeneratie-/design-AI

Dit document is bedoeld om samen met de volledige codebase aan een ander AI-systeem (bijv. Codex of
een gespecialiseerd beeldgeneratiemodel) te geven, zodat het snel context heeft zonder de hele
ontwikkelgeschiedenis te hoeven doorzoeken. Het is geschreven door Claude Code, dat de game tot nu
toe volledig heeft gebouwd — inclusief het bestaande vector-ontwerp — maar geen illustratieve/
fotorealistische beeldgeneratie kan doen (zie "Waarom dit hand-off nodig is" hieronder).

## 1. Wat is Sovereign?

Een digitaal economisch netwerk-bordspel geïnspireerd op *Brass Birmingham*, met een libertarisch/
decentrale-technologie/bitcoin-thema. Spelers bouwen elk een netwerk van private infrastructuur
(energie, handel, decentrale tech) op in een wereld die overstapt van centrale controle naar een
vrije-marktsamenleving. Bitcoin is één pijler van de economie, niet het enige onderwerp.

Volledige conceptuele ontwerpdoc: `game-concept.md` (Nederlands, in de repo-root). Sectie 15
daarvan beschrijft expliciet de art-strategie en is de reden waarom dit hand-off-document bestaat.

## 2. Techstack & structuur

npm-workspaces monorepo:
```
packages/
  engine/   @sovereign/engine — pure TypeScript spel-engine, geen UI-afhankelijkheden, Vitest-getest
  web/      @sovereign/web    — Next.js 15 (App Router) + React 18 + Zustand, TypeScript
```
De UI leest alléén engine-state en dispatcht acties; er zit geen renderlogica in de engine. Voor dit
designwerk is vrijwel alles relevant binnen `packages/web` — de engine hoeft niet aangeraakt te
worden voor puur visuele wijzigingen.

Geen bestaande asset-pijplijn: alle huidige visuals zijn **code-gegenereerde SVG/CSS**, geen
losse afbeeldingsbestanden. Als er nieuwe illustratieve assets bijkomen (PNG/SVG-bestanden), is er
nog geen `public/`-conventie voor beeldbestanden opgezet — die mag/moet dit traject zelf inrichten.

## 3. Huidige status van het spel

Volledige, speelbare vertical slice: 2 tijdperken (Pioniersfase + Netwerkfase), 5 speleracties,
Dreigingskaarten-confiscatiemechaniek (reactievenster na Verkopen), lokaal pass-and-play voor 2-4
spelers, en een solo-modus tegen een regelgestuurde Automa (3 moeilijkheidsgraden). Balans is
getest en getuned via een headless botharness (`packages/engine/tests/*balance-report*.test.ts`).
Alles staat op GitHub: `https://github.com/L3and3r/sovereign`.

**Wat hier NIET verandert door dit designtraject:** spelregels, engine-logica, testdekking. Dit is
puur een visuele/artistieke verdieping bovenop een werkend spel — geen enkele wijziging hier zou de
speelbaarheid mogen breken.

## 4. Bestaande visuele identiteit — dit is een uitbreiding, geen vervanging

Er is al een bewust ontworpen visuele taal, tot stand gekomen via meerdere feedbackrondes met de
gebruiker. **Nieuw werk moet dit uitbreiden, niet vervangen**, tenzij de gebruiker expliciet om een
volledige herziening vraagt.

### Kleurtokens (`packages/web/app/globals.css`, `:root`)
```css
--bg: #0b0e11;              /* achtergrond, bijna zwart-navy */
--bg-vignette: #0e1217;
--surface: #151a20;
--surface-raised: #1c232b;
--border: #2a323b;
--border-strong: #3a4451;

--text: #e8e6e1;
--text-muted: #8992a0;
--text-faint: #5b6470;

--accent: #f7931a;          /* bitcoin-oranje, hét herkenbare accent */
--accent-teal: #3fb8af;     /* netwerk/connectiviteit */
--danger: #e5484d;          /* grensmarkeringen, confiscatie, foutmeldingen */
--success: #4caf50;
```

### Typografie
- **Display/data/koppen**: JetBrains Mono (`--font-display`) — ledger/terminal-gevoel, past bij
  "economie/boekhouding" thema.
- **Body**: Inter (`--font-body`).
- Geladen via `next/font/google` in `packages/web/app/layout.tsx`.

### Industriekleuren & kaartkaders (`packages/web/styles/tokens.ts`)
```ts
INDUSTRY_COLORS = {
  energiecentrale: '#f7931a', infrastructuur: '#8d99ae', handelspost: '#4caf50',
  netwerkhub: '#3fb8af', mediaEnEducatie: '#e85d9e', kluis: '#ffd700',
}
CARD_FRAME = {
  region: blauw, industry: groen, wildcardRegion: dieprood, wildcardIndustry: goudbruin,
  dreiging: granaatrood,  // elk met een brass/goud-rand (#c9a227) + dubbele ledger-lijn erbinnen
}
```

### Het bord: regio's als geslagen brons-munten (het huidige signatuurelement)
`packages/web/components/board/RegionNode.tsx` + `BoardSvg.tsx`. Regio's zijn NIET simpele cirkels
maar gestempelde "sat-munten": een bronzen radiale gradient (`region-fill` in `BoardSvg.tsx`), een
gekartelde/gefreesde muntrand (ring van korte radiale streepjes), een gegraveerde binnenring, en
voor de twee grensregio's een klein rood was-zegel-badge in plaats van alleen een rode rand. Reden:
de spelvaluta (Sats/bitcoin) is letterlijk munt-vormig, dus het bord leunt daarop in plaats van een
generiek netwerkdiagram te zijn. Links tussen regio's krijgen kleine "via-pad"-vierkantjes op de
muntrand (schakelschema-gevoel) wanneer gelegd, en een fijne gestippelde "ledger-rule" wanneer nog
niet gelegd.

### Kaarten (MTG/Hearthstone-geïnspireerd)
`packages/web/components/hand/CardIcon.tsx` + `.game-card` in `globals.css`. Brass-gerande kaarten
met per-type gekleurde achtergrond-gradient, een vector-icoon (industrie) of glyph (regio/wildcard/
dreiging), naam, type-label, en een hover-tooltip met een echte historische quote (libertarisch/
bitcoin-thema) per kaart. Selectie geeft een verende "pop-forward"-animatie (vergroten + gloed).

### Industrie-iconen (puur vector, `packages/web/components/board/IndustryIconPaths.tsx`)
Elk industrietype heeft een handgetekend SVG-icoon (windturbine voor Energiecentrale, weg voor
Infrastructuur, marktkraam voor Handelspost, 3-knoops-netwerk voor Netwerkhub, boek+radiogolven voor
Media & Educatie, kluisdeur met grendels voor Kluis) — bewust geometrisch/abstract, geen
illustratieve tekeningen (zie sectie 6 hieronder voor waarom).

### Animatieprincipes
- Verende easing (`cubic-bezier(0.34, 1.56, 0.64, 1)`) voor kaartselectie.
- `prefers-reduced-motion` wordt overal gerespecteerd — elke nieuwe animatie moet dat ook doen.
- Automa-beurten spelen met een korte (~500ms) zichtbare pauze per zet af — geen "AI denkt na"-vertraging.

## 5. Bestandskaart voor visuele componenten

```
packages/web/
  app/
    globals.css              — alle design-tokens, .game-card, .board-frame, animaties
    page.tsx                 — setup-scherm (lokaal multiplayer / solo tegen Automa)
    game/page.tsx             — hoofdspelscherm, tab-panelen, reactievenster, tijdperk-overgangsscherm
    layout.tsx                — font-loading
  components/
    board/
      BoardSvg.tsx            — de SVG-root van het bord, <defs> met gradients/filters
      RegionNode.tsx          — één regio-"munt" + zijn 3 bouwslots
      LinkEdge.tsx             — verbindingen tussen regio's
      IndustryTileIcon.tsx     — een geplaatste tegel op het bord (icoon + niveau-stippen + disabled-styling)
      IndustryIconPaths.tsx    — de 6 vector-iconen zelf, herbruikt in tegels én kaarten
      IndustryLegend.tsx       — kleurenlegenda onder het bord
      regionLayout.ts          — vaste x/y-posities van de 8 regio's in SVG-ruimte
    hand/
      CardIcon.tsx             — één kaart (frame, icoon, naam, tooltip)
      PlayerHandPanel.tsx      — de hand-rij
    layout/
      HelpPanel.tsx, TurnBanner.tsx, TutorialOverlay.tsx
    market/
      DemandTrackView.tsx, IncomeTrackView.tsx
  styles/
    tokens.ts                  — kleurconstantes (zie boven)
```

## 6. Waarom dit hand-off nodig is (de kern van de vraag aan jou)

`game-concept.md` §15 legt dit al vast: Claude Code (de AI die dit spel bouwde) kan **wél** strak
professioneel vector-/SVG-ontwerp produceren — iconen, lay-outs, kleursystemen, typografie, dat is
allemaal code — maar kan **geen** geschilderde/illustratieve kunst maken (sfeervolle achtergronden,
"concept art", personages, getextureerde materialen) omdat het als taalmodel alleen code schrijft
die vormen tekent, geen pixel-/rasterbeelden genereert. Daarvoor is een apart beeldgeneratiemodel
nodig — dat ben jij.

**Concreet gevraagd door de gebruiker** (letterlijk, uit eerdere gesprekken): "ik wil echt graphics
van energiecentrales, wegen, handelsposten etcetera. En mooi vormgegeven kaarten enzo." De huidige
vector-iconen zijn functioneel en stijlvol, maar blijven abstract/geometrisch — geen echte
illustraties van bijv. een windmolenpark, een handelspost-marktplein, een kluisdeur met textuur, etc.

### Waar illustratief werk het meest zou opleveren
- **Industrie-illustraties**: vervanging of aanvulling van de 6 vector-iconen (§4 hierboven) door
  echte, sfeervolle illustraties — moet nog steeds herkenbaar/leesbaar blijven op kleine schaal
  (tegels zijn ~24px op het bord, iets groter op kaarten).
- **Kaart-art**: een illustratie per kaart(type) in `.game-card-art` (nu een leeg vak met alleen het
  vector-icoon) — dit is waar MTG/Hearthstone-achtige kaarten hun kracht vandaan halen.
- **Regio/bord-sfeer**: eventueel getextureerde varianten van de munt-regio's, of een sfeervolle
  achtergrondillustratie achter het hele bord (nu een vlakke radiale gradient + heel subtiel
  rasterpatroon, zie `board-bg`/`ledger-grid` in `BoardSvg.tsx`).
- **Titelscherm/hero-beeld**: het setup-scherm (`app/page.tsx`) heeft nu alleen tekst en een
  diamant-glyph, geen enkel beeld — een sfeervol titelbeeld zou hier het grootste eerste-indruk-effect hebben.

### Technische integratie-aandachtspunten
- Er is nog geen `public/`-map met afbeeldingen; die moet aangemaakt worden als er raster-assets
  bijkomen (PNG/WebP/AVIF, via Next.js' `<Image>`-component voor optimalisatie).
- SVG-elementen op het bord (`RegionNode.tsx`, `LinkEdge.tsx`) hebben interactieve click/hover-logica
  (bouwslot-highlighting, tegel-selectie) — als munt-regio's een illustratieve achtergrond krijgen,
  moet die als `<image>`/`<pattern>` binnen dezelfde SVG `<g>`-structuur blijven zodat de klik- en
  hover-hitboxen niet breken.
- Alles moet zowel in licht- als donker-modus werken? Nee — dit spel is bewust **alleen donker**
  (`color-scheme: dark` vast in `:root`), geen light-mode-vereiste.
- Houd rekening met `prefers-reduced-motion` als er geanimeerde illustraties bijkomen.
- De bestaande kleurtokens (sectie 4) zijn de "waarheid" voor kleurharmonie — nieuwe illustraties
  moeten daar qua palet bij aansluiten, niet een geheel eigen kleurenwereld introduceren.

## 7. Wat NIET te doen

- Geen wijzigingen aan `packages/engine/` — dat is puur spellogica, niet visueel.
- Geen vervanging van de bestaande MTG/Hearthstone-kaartstructuur, ledger/terminal-typografie, of de
  munt-bord-signatuur zonder expliciet akkoord van de gebruiker — dit zijn resultaten van meerdere
  eerdere, bewuste designrondes, geen toevallige keuzes.
- Geen light-mode, geen breaking changes aan de bestaande click-to-play interactie (kaart selecteren
  → bord highlight → klik doelwit → bevestigen) — dat interactiemodel is zelf het resultaat van een
  eerdere correctie op gebruikersfeedback en moet intact blijven.
