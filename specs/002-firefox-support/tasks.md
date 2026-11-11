# Tasks: Firefox-Unterstützung

**Input**: Design documents from `/specs/002-firefox-support/`
**Prerequisites**: plan.md (required), research.md

## Execution Flow (main)
```
1. Load plan.md from feature directory
2. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, UI components
   → Integration: storage, permissions, logging
   → Polish: unit tests, performance, docs
3. Number tasks sequentially (T001, T002...)
4. Generate dependency graph
5. Create parallel execution examples
6. Validate task completeness
```

## Phase 3.1: Infrastructure & Setup
- [X] T001 Entscheidung "ein Repo, ein Quellcode" treffen und in `docs/decisions/ADR-0005-firefox-build.md` festhalten
- [X] T002 Unterschiede Chrome/Firefox recherchieren und in `specs/002-firefox-support/research.md` ablegen
- [X] T003 Überlagerung für das Firefox-Manifest anlegen in `scripts/manifest.firefox.json` (Event-Page, `options_ui`, Add-on-ID, `data_collection_permissions`)
- [X] T004 `scripts/build.mjs`: Option `--browser firefox` (Überlagerung, kein `key`, Ziel `firefox140`, Ausgabe `dist-firefox/`)
- [X] T005 [P] `package.json`: Skript `build:firefox`
- [X] T006 [P] `.gitignore`: `dist-firefox/`

## Phase 3.2: Tests
- [X] T007 [P] Build-Test Firefox in `tests/unit/build.test.js`: Event-Page statt Service Worker, keine Chrome-Schlüssel, ID, Mindestversion, `data_collection_permissions`, alle Dateien vorhanden, kein `eval`
- [X] T008 [P] Build-Test Chrome in `tests/unit/build.test.js`: Manifest = `public/manifest.json` plus `key` (Chrome bleibt unverändert)
- [X] T009 [P] Test Firefox-Erkennung in `tests/unit/feedback.test.js`

## Phase 3.3: Core Implementation
- [X] T010 Firefox im Feedback-Entwurf erkennen in `src/shared/feedback.js`
- [X] T011 Firefox-Paket mit `web-ext lint` prüfen: 0 Fehler, 5 Warnungen (siehe ADR-0005)

## Phase 3.4: Integration
- [X] T012 CI: `npm run build:firefox` in `.github/workflows/ci.yml`

## Phase 3.5: Quality Assurance
- [X] T013 [P] README: Abschnitt Firefox (Bauen, Ausprobieren, Umzug von Chrome)
- [X] T014 [P] `AGENTS.md`: Befehle, Verzeichnisse, Regel zu `chrome.*`, Definition of Done
- [X] T015 [P] `docs/architecture.md`, `docs/requirements.md` (F-30)
- [X] T016 [P] `docs/compliance.md`: Abschnitt Firefox
- [X] T017 [P] `docs/manual-testing.md`: Abschnitt Firefox
- [X] T018 [P] `docs/releasing.md`: Abschnitt Firefox (Signieren, Verteilen)
- [ ] T019 Manuell in echtem Firefox (ab 140) durchgehen: `docs/manual-testing.md`, Abschnitt Firefox. Besonders prüfen: Promises auf `chrome.*`, Badge, "In Miro einfügen", Sicherung Chrome ⇄ Firefox
- [ ] T020 Ergebnis in die Tabelle am Ende von `docs/manual-testing.md` eintragen

## Phase 3.6: Offene Entscheidungen und Folgearbeiten
- [ ] T021 Add-on-ID `draob@engelrico.de` vom Projektinhaber bestätigen lassen (danach nicht mehr änderbar)
- [ ] T022 Verteilweg klären (intern signiert oder öffentlich auf AMO), siehe `spec.md`, FR-012
- [ ] T023 Mindestversion klären (140 oder ältere ESR-Versionen), Android ausdrücklich ausschließen oder prüfen
- [ ] T024 Workflow `Release`: Firefox-ZIP (`draob-firefox-<Version>.zip`) zusätzlich bauen und anhängen; Installationstext für Firefox ergänzen
- [ ] T025 Optional: Signierung (`web-ext sign --channel unlisted`) im Workflow automatisieren; braucht AMO-Schlüssel als Secrets
- [ ] T026 Optional: `web-ext lint` in der CI (neue Dev-Abhängigkeit, Regel 7 in AGENTS.md beachten)
- [ ] T027 Optional: Wortlaut der Constitution von "Chrome" auf "Browser (Chrome, Firefox)" erweitern (Governance-Änderung, Freigabe nötig)

## Dependencies
- T003 und T004 vor T007 bis T011
- T001, T002 vor T003
- T019 vor T020; T021 bis T023 vor T024 und T025
- Implementierung (T003 bis T012) vor Doku-Abgleich (T013 bis T018)

## Parallel Example
```
# Launch T005-T006 together:
Task: "package.json: Skript build:firefox"
Task: ".gitignore: dist-firefox/"

# Launch T013-T018 together (verschiedene Dateien):
Task: "README: Abschnitt Firefox"
Task: "AGENTS.md anpassen"
Task: "docs/compliance.md: Abschnitt Firefox"
```

## Chrome Extension Validation
- [X] `npm run lint`, `npm test` (91 Tests), `npm run build`, `npm run build:firefox`
- [X] Chrome-Manifest unverändert (Test)
- [X] Firefox-Manifest validiert (`web-ext lint`, 0 Fehler)
- [ ] Test Laden/Entladen in echtem Firefox (T019)
- [ ] Browser-übergreifende Sicherung (T019)
