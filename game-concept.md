# SOVEREIGN — Conceptual Design Document

**Werktitel:** *Sovereign* (werktitel, aanpasbaar)
**Genre:** Digitaal economisch netwerk-bordspel, geïnspireerd op Brass Birmingham
**Thema:** Opbouw van een libertarische, vrije-markteconomie — decentrale technologie, privaat geld en zelfvoorzienende infrastructuur, met bitcoin als één van de bouwstenen naast andere private/decentrale sectoren
**Spelers:** 1–4 (solo tegen een automa-tegenstander, of pass-and-play lokaal; architectuur ondersteunt latere online multiplayer)
**Doel van dit document:** conceptuele basis om in Claude Code te laden en met meerdere agents te laten uitwerken tot een speelbaar digitaal spel.

---

## 1. Kernconcept

Spelers bouwen ieder een netwerk van private infrastructuur op — energie, decentrale technologie, vrij bankieren en handel — in een wereld die geleidelijk overstapt van centrale controle naar een libertarische, marktgedreven samenleving. Bitcoin is één van de pijlers van die economie (naast bijvoorbeeld energieproductie en vrij ondernemerschap), niet het enige onderwerp. Net als in Brass Birmingham draait het spel om twee opeenvolgende tijdperken met elk hun eigen economie, een krappe actie-economie (2 acties per beurt), ketens van vraag en aanbod, en een spanning tussen korte-termijn inkomen en lange-termijn winstpunten.

Het spel is geen politiek pamflet — het is een economische puzzel met een consistent, smaakvol thema. Flavor text mag verwijzen naar libertarische ideeën en decentrale technologie in brede zin, met bitcoin als terugkerend maar niet overheersend element.

---

## 2. De twee tijdperken

| Brass Birmingham | Sovereign |
|---|---|
| Canal Era | **Pioniersfase** — eerste vrije zones, kleinschalige private handel en energieopwekking, vroege digitale ruilmiddelen |
| Rail Era | **Netwerkfase** — opschaling, verbonden private infrastructuur, volwassen vrije-marktnetwerk |

Overgang tussen tijdperken werkt zoals in Brass: als de bevoorradingsstapel van tegels van het huidige tijdperk op is, eindigt de ronde, worden verouderde/onverkochte tegels van het bord gehaald ("obsoletion"), en begint het volgende tijdperk met een nieuwe tegelset en aangepaste marktprijzen.

**Balansbasis:** Brass Birmingham's exacte getallen (bouwkosten, tegelaantallen, inkomensschaal, marktprijzen) dienen als startpunt. Pas afwijken waar het thema of de solo/confiscatie-mechanieken dat vereisen, niet omwille van originaliteit alleen.

---

## 3. Kaart & netwerk

In plaats van Engelse steden: een fictieve kaart van **Regio's** — vrije zones, industriële clusters en havensteden, met eigen namen (bijv. "Zoutmeer Vrijhaven", "Berghold", "Deltahaven") om vrij te kunnen ontwerpen.

- **Links** = fysieke handels-/energieverbindingen (Pioniersfase) → later **digitale netwerkkanalen** (Netwerkfase)
- Spelers leggen links tussen regio's om handelsroutes en liquiditeitsflows te openen
- Sommige regio's hebben een **overheidsgrens-marker**: extra kosten om erdoorheen te bouwen, thematisch de "fiat-controle" die wegvalt naarmate het netwerk groeit

---

## 4. Industrieën (tegeltypes)

| Brass-equivalent | Sovereign-industrie | Functie |
|---|---|---|
| Kolenmijn | **Energiecentrale** | Produceert Energie (brandstof voor Infrastructuur & verkoop); bitcoin-mining is de meest kenmerkende toepassing, naast andere energie-intensieve private industrie |
| IJzerwerk | **Infrastructuur** | Nodig om Links te bouwen; verbruikt Energie |
| Katoenfabriek | **Handelspost** | Verkoopt aan de Marktvraag voor VP + inkomen (goederen, diensten, of digitale activa) |
| Brouwerij | **Netwerkhub** | Routeert liquiditeit/handel; verplicht verbruikt door de markt i.p.v. verkocht |
| Aardewerkfabriek | **Media & Educatie** | Uniek verkoopmechanisme, geen concurrentie tussen spelers nodig |
| — (nieuw) | **Kluis** | Beschermt bezit tegen "confiscatie"-kaarten; puur defensief, geeft VP bij spelend |

Elke industrie heeft niveaus (I–IV zoals Brass), met dalende bouwkosten en stijgende opbrengst/VP naarmate je hoger bouwt.

**Confiscatie-mechaniek (directe spelersinteractie):** een aparte categorie **Dreigingskaarten** kan tegen een andere speler gespeeld worden. Het doel: dwing een ongedekte industrietegel (zonder beschermende Kluis) om direct inkomen te verliezen of tijdelijk buiten werking te raken. Een speler met een Kluis op die regio/industrie is beschermd. Dit maakt de Kluis een actieve verdedigingskeuze i.p.v. een puur decoratieve tegel, en introduceert opzettelijk wrijving tussen spelers bovenop de indirecte concurrentie via de Marktvraag.

---

## 5. Resources

- **Munt** — geld/inkomen (i.p.v. ponden), in het spel concreet weergegeven als **Sats**; flavor-wise een vrije, niet-centraal gecontroleerde munteenheid
- **Energie** — vervangt kolen; nodig voor het bouwen van Infrastructuur en het activeren van verkoopwaarde
- **Bandbreedte/Liquiditeit** — vervangt ijzer; nodig voor Links
- **Vertrouwen (Reputatie)** — subtiele derde resource, beïnvloedt welke kaarten je mag spelen (netwerkeffect-thema)

---

## 6. Kaarten (hand-management laag)

Twee kaarttypes zoals in Brass:
1. **Regiokaarten** — geven toegang om in een specifieke regio te bouwen
2. **Industriekaarten** — geven toegang om een specifiek industrietype te bouwen, overal

Flavour: kaarten dragen namen/verwijzingen naar libertarisch denken, decentrale technologie én bitcoin-geschiedenis specifiek (bv. "Vrije Markt", "Het Cypherpunk Manifest", "Genesis Block", "Halvering", "Zelfcustodie") als sfeer, zonder invloed op de mechaniek buiten hun kaarttype. Richtlijn: ongeveer de helft van de kaartnamen mag direct naar bitcoin verwijzen, de andere helft naar bredere libertarische/vrije-markt-thematiek.

**Wildcards** zoals in Brass: een regio-wildcard en een industrie-wildcard per speler per tijdperk.

---

## 7. Acties per beurt

Zoals Brass: **2 acties per beurt**, gekozen uit:
- **Bouwen** — industrietegel plaatsen (kost Munt + resources, past bij handkaart)
- **Netwerken** — Link leggen tussen regio's
- **Ontwikkelen** — tegel(s) van je voorraad verwijderen om hogere niveaus te ontgrendelen (verbruikt Energie)
- **Verkopen** — industrietegels activeren via de Marktvraag (verbruikt "afnemers", triggert verbonden Netwerkhubs)
- **Lenen** — lening opnemen bij een centrale instantie: directe Munt, maar permanent inkomstenverlies (thematisch: geldontwaarding straft je lange termijn)
- **Scouten** — wildcardkaarten ruilen (indien deze actie wordt overgenomen uit latere Brass-varianten)

---

## 8. Markt & vraag

Een **Marktvraag**-track vervangt de katoen/biermarkt: vraag daalt naarmate meer verkocht wordt, en herstelt gedeeltelijk bij het wisselen van tijdperk. Verkopen vereist verbonden Netwerkhub-capaciteit — hoe groter je netwerk, hoe meer je in één beurt kunt verkopen (netwerkeffect als kernthema, mechanisch verankerd).

---

## 9. Scoring

Twee gescheiden tracks, zoals Brass:
- **Inkomen-track** (Munt-inkomen per beurt) — laag houden = kwetsbaar, hoog = duurdere leningen minder nodig
- **Soevereiniteitspunten (SP)** — eindscore, verdiend via verkochte industrieën, Links, en Kluizen

Eindscore = som van SP van beide tijdperken (net als Brass' canal + rail score).

---

## 10. Technische architectuur

Gebouwd voor een schone scheiding tussen regels en presentatie, zodat lokaal → online multiplayer later kan zonder herbouw:

1. **Game engine** (TypeScript, framework-onafhankelijk)
   - Pure functies: state in, actie in, nieuwe state + validatie uit
   - Geen UI- of netwerkcode
2. **UI-laag** (React, Vercel-deploybaar)
   - Rendert engine-state, stuurt acties door
   - Lokaal pass-and-play als eerste werkende versie
3. **Multiplayer-laag** (later)
   - Dunne WebSocket-server die dezelfde engine draait
   - Geen wijzigingen aan de engine zelf nodig

---

## 11. Solo-modus (automa-tegenstander)

Naast lokale multiplayer moet het spel volwaardig solo speelbaar zijn, vergelijkbaar met de officiële solo-varianten van Brass Birmingham:

- **Automa-deck**: een kaartgestuurde "spelersimulatie" i.p.v. echte AI — elke automa-beurt trekt een kaart die bepaalt welke actie de tegenstander uitvoert (bouwen in een vaste volgorde van regio's/industrieën, geen echte besparingslogica nodig)
- De automa concurreert primair via **marktverdringing**: hij "verkoopt" tegels op de Marktvraag-track en bezet plekken in industrietegel-voorraden, zodat de menselijke speler wél met schaarste en concurrentie te maken krijgt zonder dat er complexe AI-besluitvorming nodig is
- Moeilijkheidsgraad instelbaar via meerdere parameters op het automa-deck, te combineren tot verschillende profielen:
  - Aantal acties van de automa per beurt
  - Agressiviteit van marktverdringing (hoeveel Marktvraag hij per beurt wegkaapt)
  - Prioriteitsvolgorde van regio's/industrieën (voorspelbaar vs. willekeuriger)
  - Frequentie waarmee de automa Dreigingskaarten tegen de speler inzet (koppeling met de confiscatie-mechaniek uit sectie 4)
- Dit past goed bij de engine/UI-scheiding uit sectie 10: de automa is gewoon een tweede "speler" die de engine aanstuurt via een simpel regelscript, geen apart AI-systeem

---

## 12. Voorstel voor multi-agent opzet in Claude Code

Suggestie voor taakverdeling over agents (aan te passen naar wens):

| Agent | Verantwoordelijkheid |
|---|---|
| **Engine-agent** | Kernregels, state management, validatie, testen |
| **Content-agent** | Kaartdata, industrietabellen, marktcurves, flavor text |
| **UI-agent** | React-componenten, bordweergave, interactie |
| **Kaart/asset-agent** | Regiokaart-layout, tegel-iconen, visuele stijl |
| **QA/balans-agent** | Simulaties draaien, balans van kosten/opbrengsten controleren |

Elke agent werkt idealiter tegen een gedeeld datamodel (JSON-schema's voor kaarten, tegels, regio's) zodat content- en engine-werk parallel kunnen lopen.

---

## 13. Vastgestelde ontwerpkeuzes

- **Spelersaantal:** flexibel 1–4, inclusief volwaardige solo-modus
- **Confiscatie-mechaniek:** ja, directe spelersinteractie via Dreigingskaarten (zie sectie 4)
- **Bitcoin/thema-balans:** ongeveer de helft van de kaartflavor mag direct bitcoin-specifiek zijn, de rest bredere libertarische thematiek
- **Balansbasis:** Brass Birmingham's exacte getallen als startpunt (sectie 2)
- **Automa-moeilijkheid:** meerdere instelbare parameters i.p.v. vaste niveaus (sectie 11)

Dit document is nu compleet genoeg om als basis in Claude Code te laden.

---

## 14. Vlotheid & engagement buiten je beurt

Zware eurogames zoals Brass voelen fysiek vaak traag aan doordat je alleen kunt kijken als je niet aan de beurt bent. Digitaal kunnen we dat wegnemen zonder de kernmechanieken te versimpelen:

- **Live bordupdates**: elke actie van een andere speler wordt direct zichtbaar op het bord (marktprijzen, tegelvoorraad, links) — geen "reveal aan het eind", je ziet continu wat verandert
- **Parallel plannen**: terwijl een ander speelt, kun je alvast je eigen volgende zet in een "wat-als"-preview klaarzetten (kosten/opbrengst zien) zonder de echte staat te raken — bij jouw beurt bevestig je met één klik
- **Reactie-venster via Dreigingskaarten**: de confiscatie-mechaniek (sectie 4) geeft spelers een kort interrupt-moment na bepaalde triggers (bv. na een Verkoop-actie van een ander) — micro-beslissingen buiten je eigen beurt om, in plaats van puur toekijken
- **Snelle beurt-UI**: minimale clicks per actie, geen kunstmatige wachttijden; automa-beurten (solo) worden direct doorgerekend en geanimeerd, niet met "AI denkt na"-vertraging
- **Optionele beurttimer**: voorkomt analysis paralysis bij menselijke medespelers, instelbaar per sessie
- **Async-ondersteuning** (voor latere online multiplayer): notificatie bij jouw beurt zodat spelers het scherm niet open hoeven te houden

---

## 15. Art & visueel ontwerp — hoe het tot stand komt

Gezien de bouwaanpak (Claude Code, meerdere agents, geen los kunstteam) is de meest haalbare pipeline:

1. **Vector/SVG-iconografie als basis**, geen photorealistische illustraties
   - Industrietegels, resource-iconen, kaart/regio's worden als SVG-componenten direct in code gegenereerd (React + SVG) i.p.v. losse afbeeldingsbestanden
   - Voordeel: schaalbaar, licht, makkelijk te themen, en een agent kan consistent nieuwe iconen genereren volgens een vaste stijlregel — geen aparte asset-pijplijn nodig
2. **Stijlgids eerst vastleggen** (kleurenpalet, lijndikte, vormtaal — bv. strak/geometrisch, geïnspireerd op wireframe-schema's en munt-iconografie), zodat elke agent die UI of iconen bouwt dezelfde visuele taal aanhoudt
3. **Kaartlay-out**: regio's als polygonen/paden in een SVG-kaart, handmatig of met een klein hulpscript gepositioneerd — geen kant-en-klare wereldkaart, past bij de fictieve regio's uit sectie 3
4. **Sfeerbeelden/achtergrond-art (optioneel, later)**: als er ooit meer "gepolijste" illustraties gewenst zijn (bv. voor een titelscherm), is dat een apart traject — AI-beeldgeneratie of losse (CC0/eigen) illustraties — dat losstaat van de kernbouw en de speelbaarheid niet blokkeert

Kortom: eerste versies draaien op functionele, consistente vectorstijl die een agent zelf kan genereren en aanpassen; verfijnd art is een latere, aparte laag.

**Belangrijke nuance — wat de agents zelf kunnen vs. niet:**
- Claude Code kan zelf strak, professioneel ogend **vector-/SVG-design** produceren: iconen, kaartlay-outs, UI, kleursystemen, typografie — dit is code, dus reproduceerbaar en consistent tussen agents.
- Claude Code kan **geen** geschilderde/illustratieve kunst maken (personages, sfeervolle achtergronden, "concept art"). Als taalmodel schrijft het alleen code die vormen tekent, geen pixel-/rasterbeelden.
- Voor dat soort sfeerbeelden is een apart beeldgeneratiemodel nodig, los van de Claude Code-agents — dat blijft buiten de kernbouw en wordt achteraf toegevoegd als losse asset.
