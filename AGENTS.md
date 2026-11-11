# AGENTS.md

draob („board“ rückwärts, früher MiroHero) ist eine Browser-Extension (Manifest V3, Chrome und Firefox aus einem Quellcode), die Passwörter für Miro-Boards speichert. Nicht mit Miro verbunden.
Stack: React 19, esbuild, Jest 30, ESLint 10 (Flat Config), Prettier. Kein Backend.

## Befehle
```bash
npm ci              # Abhängigkeiten
npm run build       # esbuild (scripts/build.mjs) baut nach dist/ (das ist die ladbare Chrome-Extension)
npm run build:firefox # gleicher Quellcode, baut nach dist-firefox/ (Firefox-Manifest, ADR-0005)
npm test            # Jest (tests/unit)
npm run coverage    # Jest mit Abdeckung (V8)
npm run lint        # ESLint (eslint.config.mjs)
npm run licenses    # Lizenzprüfung der ausgelieferten Pakete
npm run format      # Prettier
```
Extension testen: `chrome://extensions` → Entwicklermodus → "Entpackte Erweiterung laden" → `dist/`.
Firefox: `about:debugging#/runtime/this-firefox` → „Temporäres Add-on laden“ → `dist-firefox/manifest.json` (nur zum Testen, verschwindet beim Neustart).
Nach jeder Code-Änderung neu bauen und die Extension neu laden.

## Verzeichnisse
| Pfad | Inhalt |
|---|---|
| `src/background/` | Service Worker (setzt Badge auf Miro-Board-Tabs) |
| `src/content/` | Content Script für `miro.com/app/board/*` |
| `src/popup/` | React-Popup (`index.jsx` + `App.jsx` + Views) |
| `src/options/` | Verwaltungsseite (Sicherung, Wiederherstellen, Zurücksetzen) |
| `src/shared/` | Geteilter Code: `crypto.js`, `storage.js` (Tresor v2), `entries.js` (Suche/Tags/Duplikate, rein), `miro.js` (Board-URLs), `tabs.js` (aktiver Tab), `download.js`, `ui/` (Komponenten), `theme.css` (Design-Tokens) |
| `scripts/` | `build.mjs` (esbuild-Build), `jest-esbuild-transform.cjs` (Jest ohne Babel), `sync-manifest-version.js` (läuft bei `npm version`), `check-licenses.js` |
| `public/` | Wird 1:1 nach `dist/` und `dist-firefox/` kopiert: `manifest.json` (Chrome, Basis für beide), HTML, Icons |
| `scripts/manifest.firefox.json` | Überlagerung für das Firefox-Manifest (`null` entfernt einen Schlüssel); alles Firefox-Spezifische steht nur hier |
| `tests/unit/` | Jest-Tests, spiegeln `src/shared/` (plus Build-Test) |
| `docs/` | Wissensbasis, siehe unten |
| `specs/`, `.specify/` | spec-kit: Feature-Specs und Constitution |

`dist/`, `dist-firefox/` und `node_modules/` sind generiert und werden nie committet.
Es gibt kein Manifest, HTML oder Quellcode im Repo-Root.

## Harte Regeln
1. Passwörter dürfen nie im Klartext in `chrome.storage` oder im Code liegen. Verschlüsselung nur über `src/shared/crypto.js`, Schlüssel nur aus dem Masterpasswort (ADR-0001).
2. Kein Inline-Script, kein `eval` (CSP in `public/manifest.json`). Der Build erzeugt deshalb nur externe Source-Maps (`scripts/build.mjs`), nie eingebettete oder eval-basierte.
3. Neue Permission oder Host-Permission nur mit Begründung in `docs/compliance.md`.
4. Nur `src/shared/storage.js` greift auf `chrome.storage` zu. UI und andere Module nutzen `vaultStore()`.
   Der Code nutzt überall den Namespace `chrome.*` mit Promises; das funktioniert in Chrome und (Manifest V3) in Firefox. Kein `browser.*`, kein Polyfill.
   Neuer Code darf keine API benutzen, die einer der beiden Browser nicht kennt; sonst über `docs/decisions/ADR-0005-firefox-build.md` entscheiden.
5. Jede Änderung an Krypto oder Storage braucht einen Unit-Test. Neue Eintragsfelder gehören in den verschlüsselten Blob (ADR-0002), nie als Klartext neben `vault.data`; Schema-Änderungen brauchen eine Migration mit Test.
6. Styling nur über CSS-Variablen aus `src/shared/theme.css` (keine Hex-Farben in Komponenten, keine Inline-Styles außer für Layout-Ausnahmen).
7. Neue Laufzeit-Bibliotheken nur mit Begründung, `npm run licenses` und sauberem `npm audit --omit=dev`; nichts per CDN nachladen (siehe `docs/dependencies.md`).
8. Spenden- und Feedback-Hinweise (`src/shared/support.js`, `src/shared/feedback.js`) erscheinen nur im About-Tab und in der README, nie als Popup, Overlay oder Aufforderung beim Start. Die App sendet kein Feedback selbst, die Links öffnen nur auf Klick.
9. Identität: Als Kontakt steht überall nur `draob@engelrico.de`. Commits laufen mit der GitHub-Noreply-Adresse (`12011677+engelrico@users.noreply.github.com`); keine private E-Mail-Adresse in Code, Docs oder Commit-Metadaten.

## Releases
Version nie von Hand ändern: `npm version <patch|minor|major>` gleicht `package.json` und `public/manifest.json` an (das Firefox-Manifest erbt die Version beim Build), committet und taggt. Ein Tag-Push `vX.Y.Z`
startet den Workflow `Release`, der die ZIP als GitHub-Release anlegt. Ablauf und Fallstricke: `docs/releasing.md`.

## Konventionen
- ES-Module überall, keine CommonJS-Datei in `src/`.
- Code und Kommentare Englisch, UI-Texte Deutsch.
- Prettier-Stil (Single Quotes, 100 Spalten); `npm run format` vor dem Commit.
- Versionsnummer steht in `package.json` und `public/manifest.json`, beide gleichzeitig ändern.

## Definition of Done
`npm run lint`, `npm test`, `npm run build` und `npm run build:firefox` sind grün, die Extension wurde manuell in Chrome und Firefox geladen
(`docs/manual-testing.md`), und betroffene Docs sind aktualisiert.

## Wissensbasis (hier nachlesen, nicht raten)
- `docs/architecture.md`: Komponenten, Datenfluss, Storage-Schema, bekannte Schulden
- `docs/requirements.md`: Anforderungen mit IDs (F-xx)
- `docs/decisions/`: Architekturentscheidungen (ADR): 0001 Masterpasswort/Schlüsselmodell, 0002 verschlüsselter Tresor v2, 0003 esbuild statt Webpack/Babel, 0004 ESLint 10/Jest 30/Overrides, 0005 Firefox-Variante im selben Repo
- `docs/dependencies.md`: ausgelieferte Bibliotheken, Update-Ablauf (Dependabot, Audit), Overrides und Restpunkte
- `docs/releasing.md`: Release-Ablauf (npm version, Tag, Workflow)
- `docs/compliance.md`: Chrome-Web-Store-Status, ehrlich mit offenen Punkten
- `docs/manual-testing.md`: manueller Testablauf
- `.specify/memory/constitution.md`: Projektprinzipien; `specs/<nr>-<name>/`: Spec, Plan, Tasks je Feature

## Bekannte Lücken (nicht verschlimmern)
- Kein Auto-Lock, kein Wechsel des Masterpassworts, keine Drosselung falscher Eingaben (ADR-0001).
- Ein vergessenes Masterpasswort bedeutet Datenverlust; es gibt nur den Reset (alles löschen) und Sicherungen, die das alte Passwort brauchen.
- E2E-Tests fehlen noch (Playwright geplant).
- Listen ohne `key` werden nicht gelintet (`eslint-plugin-react` fehlt bewusst, ADR-0004); React warnt zur Laufzeit.
- Neue Zustandsänderungen im Formular immer als Funktion schreiben (`setForm((current) => ({ ...current, … }))`), nie aus dem Closure (`{ ...form, … }`): bei mehreren Eingaben im selben Augenblick (Browser-Autofill) gehen sonst Werte verloren.
