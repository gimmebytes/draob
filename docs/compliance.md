# Chrome Web Store: Compliance-Status

Stand 2026-11-05. Ein Haken heißt: im Repo belegt. Alles andere ist offen.

| Punkt | Status | Beleg / offen |
|---|---|---|
| Manifest V3 | erfüllt | `public/manifest.json` |
| Strikte CSP | erfüllt | `extension_pages: script-src 'self'; object-src 'self'` |
| Nicht funktionierende Teile | behoben | Optionsseite ist jetzt die Verwaltung (Sicherung, Wiederherstellen, Reset); keine Platzhalter-Einstellungen mehr |
| Datenschutzerklärung | Text fertig, URL offen | `docs/privacy.md`; muss unter einer öffentlichen URL gehostet werden (das Repo ist öffentlich, GitHub Pages ist damit möglich, z. B. aus dem Ordner `docs/`); Platzhalter für Name, Anschrift, E-Mail brauchen Eingabe |
| Listing-Texte, Permission-Begründungen | fertig als Entwurf | `docs/store-listing.md` |
| Store-Grafiken | siehe `docs/store/` | Screenshots 1280×800, kleine Kachel 440×280, optional Marquee |
| Reset bei vergessenem Passwort, Sicherung | umgesetzt | Popup (Entsperren, Config) und Verwaltungsseite, getestet |
| `minimum_chrome_version`, https-Match, Tooltip | umgesetzt | `public/manifest.json` |
| Abhängigkeiten und Lizenzen | erfüllt | Nur React-Stack ausgeliefert, alles MIT, `npm audit --omit=dev` = 0, `npm run licenses` in CI, Dependabot und wöchentlicher Audit (`docs/dependencies.md`) |
| Seite aus der Liste öffnen | umgesetzt, in Chrome noch zu prüfen | `chrome.tabs.create` braucht keine zusätzliche Berechtigung; nur http(s)-Adressen werden geöffnet (`src/shared/links.js`, getestet). Datenschutzerklärung unverändert |
| Manifest-`key` | nur in ZIP-/Entwicklungs-Builds | Feste ID für Installationen außerhalb des Stores; das Store-Paket wird mit `--store` ohne `key` gebaut (`docs/releasing.md`) |
| Feedback-Links | umgesetzt, in Chrome noch zu prüfen | Zwei externe Links im About-Tab (GitHub-Vorlagen, mailto) nur auf Klick; keine neue Berechtigung, keine Datenübertragung durch die Erweiterung; in der Datenschutzerklärung beschrieben |
| Spendenlink | umgesetzt, Store-Listing noch offen | Externer, klar gekennzeichneter Link nur im About-Tab, nicht aufdringlich, ohne Einfluss auf Funktionen. In der Store-Beschreibung offenlegen. Steuer und Trader-Status liegen beim Entwickler |
| Auto-Hinweis auf Boards | umgesetzt, in Chrome noch zu prüfen | Content-Script meldet Board, Badge statt `openPopup` (braucht keine `tabs`-/Host-Permission) |
| Zugriff auf Tab-URL/-Titel | umgesetzt, in Chrome noch zu prüfen | nur über `activeTab` beim Klick auf das Icon, nur Miro-Board-URLs werden verwendet |
| Permission `scripting` | begründet | wird nur für "In Miro einfügen" genutzt: setzt auf Klick den Wert des Passwortfelds auf Miro-Boards |
| Minimale Permissions | zu prüfen | `activeTab`, `scripting`, `storage`; `scripting` siehe oben |
| Daten verschlüsselt gespeichert | erfüllt | AES-GCM, Schlüssel aus Masterpasswort (PBKDF2); Passwörter, Titel, URLs und Tags liegen nur im verschlüsselten Blob (ADR-0002), `tests/unit/storage.test.js` prüft, dass kein Klartext im Storage landet |
| Automatisierte Tests | teilweise | Unit-Tests für Krypto, Storage (inkl. Migration, Export/Import, Reset), Suche, Einfügen; keine E2E-Tests |
| Manuelle Tests | offen | Release-Checkliste in `docs/manual-testing.md`, noch nicht in echtem Chrome durchgeführt |
| Security-Review | offen | |
| Performance-Ziele (UI < 200 ms) | ungemessen | |
| Kontaktadresse | festgelegt: `draob@engelrico.de` (in README, SECURITY.md, Datenschutzerklärung, Listing) | Alias/Postfach muss bei der Domain eingerichtet sein und Mails annehmen (bitte testen) |
| Entwicklerkonto, Trader-Angaben, Namensprüfung | offen (Nutzer) | |

## Firefox (addons.mozilla.org)

Stand 2026-11-11. Build und Linter belegt, alles Weitere offen. Details und Begründungen: `docs/decisions/ADR-0005-firefox-build.md`.

| Punkt | Status | Beleg / offen |
|---|---|---|
| Manifest V3 | erfüllt | `scripts/manifest.firefox.json` über `public/manifest.json`; Event-Page statt Service Worker |
| Linter | 0 Fehler, 5 Warnungen | `npx web-ext lint --source-dir dist-firefox --ignore-files "*.map" "*.LEGAL.txt"`; Warnungen aus `react-dom` und zu Android, siehe ADR-0005 |
| Add-on-ID | `draob@engelrico.de` | von Projektinhaber zu bestätigen; später nicht mehr änderbar |
| Datensammlung (`data_collection_permissions`) | `required: ["none"]` | passt zu `docs/privacy.md` (nichts wird übertragen) |
| Permissions | unverändert | `activeTab`, `scripting`, `storage` plus Zugriff auf miro.com Boards; keine neue Berechtigung für Firefox |
| Quellcode-Abgabe für AMO | möglich | Repo ist öffentlich; Bauanleitung `npm ci && npm run build:firefox` |
| Test in echtem Firefox | offen | Checkliste in `docs/manual-testing.md` (Abschnitt Firefox) |
| Signierung / Veröffentlichung | offen (Nutzer) | Mozilla-Konto und API-Schlüssel nötig, siehe `docs/releasing.md#firefox` |

Release: Tag `vX.Y.Z` startet den Workflow `Release` und legt `draob-<Version>.zip` als GitHub-Release an (`docs/releasing.md`). `Package extension` (manuell) baut nur ein Artefakt. Upload in den Store erfolgt von Hand.
