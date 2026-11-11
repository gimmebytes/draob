# Architektur

## Komponenten
```
Miro-Board-Tab ── content script (src/content) ── sendMessage(BOARD_DETECTED) ─┐
                                                                               ▼
Service Worker (src/background/badge.js) ── action.setBadgeText/Title für diesen Tab
              │
Popup (src/popup, React)  ─┐
Options (src/options)      └─► src/shared/storage.js ─► crypto.js (PBKDF2, AES-GCM)
                                    └─► chrome.storage.local / .session
```
Board-Erkennung: Beim Öffnen liest `src/shared/tabs.js` (`getActiveBoard`) URL und Titel des aktiven Tabs
(erlaubt durch `activeTab`, keine `tabs`-Permission). `src/shared/miro.js` normalisiert die URL auf
`https://miro.com/app/board/<id>/`, säubert den Titel und findet bestehende Einträge per Board-ID. `App.jsx`
füllt das Formular einmal pro Öffnen vor und setzt `boardState` (`new` | `known`).

Passwort einfügen: Der Button "In Miro einfügen" ruft `fillPasswordInActiveTab` (`src/shared/tabs.js`) auf. Das führt
per `chrome.scripting.executeScript` die in sich geschlossene Funktion `fillPasswordField` (`src/shared/fillPassword.js`)
im aktiven Tab aus: erstes sichtbares, aktivierbares `input[type=password]` im Hauptframe, Wert über den nativen
Setter plus `input`/`change`-Events (damit React die Änderung übernimmt). Nur Miro-Board-Tabs, nur auf Klick, kein Absenden.
Die Seite von Miro hat dafür ein reguläres Feld (`placeholder="Passwort"`, kein `<form>`), Stand 2026-11.

UI-Komponenten (`src/popup/`): `App` (Status, aktiver Tab, Formularzustand) → `Header`, `Tabs`, `UnlockView`,
`HomeView`, `ListView`, `ConfigView`, `AboutView`. Wiederverwendbare Bausteine in `src/shared/ui/`
(`Button`, `Field`/`TextInput`/`PasswordInput`/`Notice`, `Icon`). Styles: `src/shared/theme.css`
(Design-Tokens als CSS-Variablen + Basis-Klassen), von esbuild als eine gemeinsame `dist/theme.css` für Popup und Verwaltungsseite
ausgeliefert und in den HTML-Dateien verlinkt (keine Inline-Styles, CSP-konform).

Browser-Ziele (ADR-0005): Chrome und Firefox teilen `src/` und `public/`. Nur das Manifest unterscheidet sich: `public/manifest.json` ist die Chrome-Basis, `scripts/manifest.firefox.json` wird für Firefox darübergelegt
(Event-Page statt Service Worker, `options_ui`, Add-on-ID, `data_collection_permissions`). Im Firefox läuft `src/background/index.js` als Event-Page; der Code ist derselbe, er hält keinen Zustand im Speicher.

Build: `scripts/build.mjs` (esbuild) bündelt `src/*/index.js(x)` zu `dist/<name>.bundle.js`, `src/shared/theme.css` zu `dist/theme.css`, legt Lizenzhinweise der gebündelten Pakete als `*.LEGAL.txt` daneben und kopiert `public/` nach `dist/` (ADR-0003). `--browser firefox` baut dasselbe nach `dist-firefox/`, mit Firefox-Manifest und Ziel `firefox140`.

## Storage (ADR-0001, ADR-0002)
Nur `src/shared/storage.js` spricht mit `chrome.storage`. Die UI nutzt `vaultStore()`.

`chrome.storage.local["vault"]` (Schema v2):
```
{ v: 2,
  kdf: { salt: number[16], iterations: number },     // PBKDF2-SHA256
  verifier: { iv, data },                            // prüft das Masterpasswort
  data: { iv, data } }                               // AES-GCM(JSON { entries: Entry[] })
Entry = { id, title, url, password, tags[], favorite, createdAt, updatedAt }
```
Außerhalb von `data` steht nichts Lesbares (auch keine Titel, URLs oder Tags). `chrome.storage.session["sessionKey"]`:
abgeleiteter AES-Schlüssel als JWK, nur in vertrauenswürdigen Extension-Kontexten lesbar, weg beim Schließen des Browsers.
Zustände: `uninitialized` → `create()` → `unlocked` ⇄ `lock()`/`unlock()` ⇄ `locked`. v1-Tresore werden beim Entsperren migriert.

Viele Einträge: `src/shared/entries.js` (rein, ohne Chrome-APIs) liefert `filterEntries` (Suche UND, ohne Groß-/Kleinschreibung
und Akzente, plus Tag-Filter und Favoriten), `sortEntries` (Favoriten zuerst, dann A–Z), `collectTags`, `normalizeTags`
und `findDuplicateGroups`. Die Liste filtert im Speicher; bei einigen hundert Einträgen ist weder Paging noch Virtualisierung nötig.

## Sicherung, Wiederherstellung, Reset
`vaultStore().exportVault()` liefert `{ app: 'draob', exportVersion: 1, exportedAt, vault }` mit dem **bereits verschlüsselten** Tresor
(funktioniert auch gesperrt; ein v1-Tresor muss vorher entsperrt/migriert werden). `importVault(file)` prüft die Form (`validateExport`:
app, Version, `vault.v === 2`, Salt-/IV-Längen, Iterationszahl 1 bis 10 Mio.), legt den bisherigen Tresor einmalig unter
`vaultBackupPreImport` ab, ersetzt den Tresor und beendet die Session. `reset()` löscht Tresor, beide Sicherungen und den Session-Key.
Der Datei-Import und der Reset liegen auf der **Verwaltungsseite** (`options_page`, öffnet in einem Tab), weil Datei-Dialoge in Popups das
Popup schließen können. Im Popup gibt es „Sicherung“ (Export) im Config-Tab und „Passwort vergessen? Tresor zurücksetzen“ im Entsperren.

## Bekannte Schulden
| Schuld | Auswirkung | Plan |
|---|---|---|
| Kein Auto-Lock, kein Masterpasswort-Wechsel, keine Drosselung | siehe ADR-0001 "Nicht abgedeckt" | eigene Spec |
| Keine E2E-Tests | UI nur manuell geprüft | Playwright |
