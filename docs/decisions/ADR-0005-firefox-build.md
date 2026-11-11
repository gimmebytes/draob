# ADR-0005: Firefox-Variante im selben Repo

**Status:** umgesetzt (2026-11-11), Entscheidungen 3 und 4 warten auf Bestätigung des Projektinhabers

## Kontext
Ein Teil des Teams nutzt Firefox. Die Anforderung, später auch Firefox zu unterstützen, steht schon in `specs/001-f-hre-eine/spec.md` (FR-017).
Der gesamte Quellcode spricht nur WebExtension-APIs an, die es in beiden Browsern gibt (`storage.local/session`, `tabs`, `scripting`, `action`, `runtime`, `runtime.openOptionsPage`).
Unterschiede gibt es nur im Manifest:

| Thema | Chrome | Firefox |
|---|---|---|
| Hintergrundskript | `background.service_worker` | `background.scripts` (Event-Page); `service_worker` wird nicht unterstützt |
| Optionsseite | `options_page` | `options_ui` (hier mit `open_in_tab`, damit `openOptionsPage()` einen Tab öffnet) |
| Feste ID | `key` (öffentlicher Schlüssel, `scripts/extension-key.txt`) | `browser_specific_settings.gecko.id`; `key` wird nicht unterstützt |
| Mindestversion | `minimum_chrome_version` | `browser_specific_settings.gecko.strict_min_version` |
| Datenschutz-Angabe | – | `data_collection_permissions` ist für neue Erweiterungen auf addons.mozilla.org (AMO) Pflicht (seit 2025-11-03) |

## Entscheidung
1. **Ein Repo, ein Quellcode.** Chrome und Firefox werden aus `src/` gebaut. Ein zweites Repo würde Krypto, Tresor-Format und Tests doppelt führen. Eine Sicherung aus Chrome muss sich in Firefox
   einspielen lassen (und umgekehrt); das ist nur sicher, solange beide Browser denselben Code verwenden.
2. **Ein Manifest plus Überlagerung.** `public/manifest.json` bleibt die Basis und das Chrome-Manifest. `scripts/manifest.firefox.json` wird beim Build darübergelegt (Objekte werden zusammengeführt,
   `null` entfernt einen Schlüssel, Arrays werden ersetzt). Version, Berechtigungen, Icons, Content-Script und CSP gibt es dadurch nur einmal. `npm version` ändert weiter nur `public/manifest.json`.
3. **Add-on-ID `draob@engelrico.de`.** Firefox braucht für Manifest V3 eine ID, sie bestimmt den Speicherort des Tresors und kann später nicht mehr geändert werden, ohne dass alle Nutzer ihre Sicherung einspielen müssen.
   Verwendet wird die einzige erlaubte Kontaktadresse des Projekts (AGENTS.md, Regel 9).
4. **Mindestversion Firefox 140.** Ab dieser Version versteht Firefox `data_collection_permissions` (Pflicht für neue AMO-Einreichungen). Alle genutzten APIs gäbe es schon ab Firefox 115;
   wer ältere ESR-Versionen unterstützen will, senkt den Wert (der Linter und ältere Firefox-Versionen zeigen dann eine Warnung zum unbekannten Schlüssel).
5. **Ausgabe in `dist-firefox/`.** `dist/` bleibt unverändert das Chrome-Paket, damit Release-Workflow, Web-Store-Workflow und Anleitungen unverändert weiterlaufen.
6. **Weiter `chrome.*` statt `browser.*`.** In Manifest V3 liefert Firefox auf `chrome.*` ebenfalls Promises (in Manifest V2 war das nicht so, Bugzilla 1891186). Kein Polyfill, keine Codeänderung.
7. **`data_collection_permissions: { required: ["none"] }`.** Das stimmt mit der Datenschutzerklärung überein: die Erweiterung überträgt nichts (`docs/privacy.md`).

## Ergebnis
`npm run build:firefox` erzeugt eine Erweiterung, die `web-ext lint` ohne Fehler besteht. Der Chrome-Build ist byte-gleich im Manifest (Test in `tests/unit/build.test.js`).

## Bekannte Warnungen von `web-ext lint`
- `UNSAFE_VAR_ASSIGNMENT` (4x): kommt aus `react-dom` (interne `innerHTML`-Zuweisungen), nicht aus `src/`. AMO-Prüfer kennen das von React-Erweiterungen.
- `KEY_FIREFOX_ANDROID_UNSUPPORTED_BY_MIN_VERSION`: betrifft nur Firefox für Android. Die Erweiterung ist nur für Desktop gedacht (`gecko_android` fehlt bewusst, damit sie auf Android nicht angeboten wird).

## Folgen
- Neue Manifest-Schlüssel, die nur ein Browser kennt, gehören in die jeweilige Datei (`scripts/manifest.firefox.json` bzw. Chrome-Basis), nicht in beide.
- Berechtigungen ändern sich für beide Browser gemeinsam in `public/manifest.json` (Regel 3 in AGENTS.md gilt weiter).
- Firefox lädt nur signierte Erweiterungen dauerhaft. Signieren und Verteilen steht in `docs/releasing.md`.
- Ein Tresor gehört zu einem Browser: Chrome und Firefox teilen keinen Speicher. Der Umzug läuft über Sicherung und Wiederherstellen.
- AMO verlangt bei gebündeltem oder minifiziertem Code den Quellcode mit Bauanleitung. Das Repo ist öffentlich, `npm ci && npm run build:firefox` reicht dafür (Node-Version siehe `.nvmrc`).
