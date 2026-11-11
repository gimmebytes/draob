
# Implementation Plan: Firefox-Unterstützung

**Branch**: `002-firefox-support` | **Date**: 2026-11-11 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-firefox-support/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from file system structure or context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Die bestehende Chrome-Extension draob läuft zusätzlich in Firefox. Chrome und Firefox werden aus demselben Quellcode gebaut (`src/`, `public/`); nur das Manifest wird pro Browser angepasst, über eine kleine Überlagerungsdatei (`scripts/manifest.firefox.json`) auf `public/manifest.json`. `npm run build` bleibt unverändert und schreibt nach `dist/`, neu ist `npm run build:firefox` mit Ausgabe in `dist-firefox/`. Die Entscheidung "ein Repo statt zwei" und ihre Folgen stehen in `docs/decisions/ADR-0005-firefox-build.md`.

## Technical Context
**Language/Version**: JavaScript (ES2021+), React 19, Node 24 (`.nvmrc`), Manifest v3 in beiden Browsern
**Primary Dependencies**: unverändert (React, esbuild, Jest, ESLint, Prettier). Keine neue Laufzeit- oder Build-Abhängigkeit; `web-ext` wird nur einmalig per `npx` zum Prüfen benutzt.
**Storage**: `storage.local` und `storage.session` über den Namespace `chrome.*` (in Firefox mit Manifest v3 ebenfalls Promise-basiert)
**Testing**: Jest (Build-Test erweitert um Firefox), `web-ext lint` von Hand, manuelle Checkliste in Firefox
**Target Platform**: Chrome ≥ 110 (unverändert), Firefox Desktop ≥ 140
**Project Type**: Single extension (src/, tests/), zwei Build-Ziele
**Performance Goals**: unverändert (UI <200ms, background <500ms)
**Constraints**: Manifest v3, strikte CSP, Berechtigungen unverändert, Chrome-Ausgabe unverändert, Tresor-Format unverändert
**Scale/Scope**: 1 Manifest-Überlagerung, ~50 Zeilen Build-Skript, 1 ADR, Doku-Ergänzungen

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*
- Manifest v3 compliance: erfüllt in beiden Varianten. Der Wortlaut nennt "Chrome Manifest v3"; Firefox' Manifest v3 weicht in Hintergrundskript, Optionsseite und Kennung ab (siehe research.md). Die Chrome-Variante erfüllt den Wortlaut unverändert.
- Strict CSP: unverändert (`script-src 'self'; object-src 'self'`), Test auf `eval` gilt auch für den Firefox-Build.
- Permission management: unverändert (`activeTab`, `scripting`, `storage` + miro.com). Kein neues Recht.
- Storage API: weiterhin nur über `src/shared/storage.js`; Namespace `chrome.*` funktioniert in beiden Browsern.
- Security & performance: kein neuer Code im sicherheitsrelevanten Pfad (Krypto, Storage unverändert).
- Code quality & testing: Build-Test deckt Firefox ab, CI baut beide Varianten.
- Workflow: "Manual testing on latest Chrome required before release" wird um Firefox ergänzt (`docs/manual-testing.md`).
Vorschlag an den Projektinhaber: Die Constitution (Titel "draob Chrome Extension Constitution", Prinzipien nennen "Chrome") im Wortlaut auf "Browser-Extension (Chrome, Firefox)" erweitern. Das ist eine Änderung der Governance und wurde deshalb nicht von uns vorgenommen.
Initial Constitution Check: PASS (mit offenem Wortlaut-Vorschlag)

## Project Structure

### Documentation (this feature)
```
specs/002-firefox-support/
├── spec.md              # Feature-Beschreibung (WAS und WARUM)
├── plan.md              # This file
├── research.md          # Phase 0: Unterschiede Chrome/Firefox mit Quellen
└── tasks.md             # Phase 2: Aufgabenliste mit Stand
```
`data-model.md`, `contracts/` und `quickstart.md` entfallen: es gibt keine neuen Daten, keine Schnittstellen. Die Schritte zum Ausprobieren stehen in `README.md` (Abschnitt Firefox).

### Source Code (repository root)
```
public/
└── manifest.json              # Chrome-Manifest, Basis für beide (unverändert)
scripts/
├── build.mjs                  # --browser chrome|firefox, Überlagerung, Ziel-Version von esbuild
└── manifest.firefox.json      # NEU: nur was in Firefox anders ist (null entfernt einen Schlüssel)
src/                           # unverändert, bis auf Browser-Erkennung in shared/feedback.js
tests/unit/
├── build.test.js              # erweitert: Firefox-Build und "Chrome-Manifest unverändert"
└── feedback.test.js           # erweitert: Firefox-Erkennung
docs/decisions/ADR-0005-firefox-build.md
dist/                          # Chrome (generiert)
dist-firefox/                  # Firefox (generiert, nicht committet)
```
**Structure Decision**: Single extension project mit zwei Build-Zielen. Gemeinsamer Code in `src/`, Unterschiede nur im Manifest. Verworfen: (a) zweites Repo, (b) Verzeichnis `firefox/` mit Kopie des Codes, (c) ein einziges Manifest mit `background.service_worker` und `background.scripts` gleichzeitig.

## Phase 0: Outline & Research
Ergebnis in `research.md`. Kernpunkte:
1. Firefox kennt kein `background.service_worker`, aber `background.scripts` als Event-Page. Chrome ab 121 ignoriert `scripts`, Chrome 110 bis 120 lehnt das Manifest ab. Unsere Mindestversion ist Chrome 110, ein gemeinsames Manifest wäre also nicht sicher.
2. Firefox braucht für Manifest v3 eine Add-on-ID (`browser_specific_settings.gecko.id`) und für neue AMO-Einreichungen `data_collection_permissions`.
3. Firefox-Manifest v3 liefert auf `chrome.*` Promises; der vorhandene Code (`await chrome.storage…`) läuft unverändert.
4. Host-Rechte aus `content_scripts` werden seit Firefox 127 bei der Installation angezeigt; Nutzer können sie trotzdem später entziehen. `activeTab` greift beim Klick auf das Icon.
5. Dauerhafte Installation in Firefox setzt eine Mozilla-Signatur voraus.

## Phase 1: Design & Contracts
1. **Manifest**: `scripts/manifest.firefox.json` mit `background.scripts`, `options_ui` (`open_in_tab`), `browser_specific_settings.gecko` (ID, `strict_min_version`, `data_collection_permissions`), und `null` für `service_worker`, `options_page`, `minimum_chrome_version`.
2. **Build**: `scripts/build.mjs --browser firefox` kopiert `public/`, legt die Überlagerung auf das Manifest, setzt kein `key`, baut mit Ziel `firefox140` nach `dist-firefox/`.
3. **Tests**: Firefox-Manifest (Event-Page, ID, Mindestversion, keine Chrome-Schlüssel), Vollständigkeit der Dateien, kein `eval`; Chrome-Manifest = `public/manifest.json` + `key`.
4. **CI**: `npm run build:firefox` nach `npm run build`.
5. **Doku**: README (Firefox), AGENTS.md, architecture, requirements (F-30), compliance, manual-testing, releasing, ADR-0005.
**Output**: Alle Punkte umgesetzt, siehe tasks.md.

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Aufgaben aus Phase 1 ableiten, Tests vor Build-Änderung
- Unabhängige Dateien mit [P] markieren
- Offene Entscheidungen (Verteilweg, Android, Mindestversion) als eigene Aufgaben am Ende

**Estimated Output**: ~20 Aufgaben in tasks.md

## Phase 3+: Future Implementation
**Phase 3**: Task execution (tasks.md)  
**Phase 4**: Implementation (Build, Tests, Doku sind umgesetzt)  
**Phase 5**: Validation (Unit-Tests, `web-ext lint`: erledigt; manueller Test in echtem Firefox, Signierung: offen)

## Complexity Tracking
| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Zweites Manifest (Überlagerung) | Firefox und Chrome brauchen unterschiedliche Schlüssel für Hintergrundskript, Optionsseite, ID | Ein gemeinsames Manifest mit beiden Hintergrund-Schlüsseln lädt in Chrome 110 bis 120 nicht (Mindestversion ist 110) |
| Zweites Build-Ziel | Ausgabe pro Browser nötig | Ein Paket für beide kann das Manifest nicht erfüllen |

## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete
- [x] Phase 1: Design complete
- [x] Phase 2: Task planning complete
- [x] Phase 3: Tasks generated
- [x] Phase 4: Implementation complete (Build, Tests, Doku)
- [ ] Phase 5: Validation passed (manueller Test in Firefox offen)

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [ ] All NEEDS CLARIFICATION resolved (drei offen, siehe spec.md)
- [x] Complexity deviations documented

---
*Based on Constitution v1.0.0 - See `.specify/memory/constitution.md`*
