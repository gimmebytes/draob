# Research: Firefox-Unterstützung

Stand 2026-11-11. Quellen sind die Dokumentation von Mozilla (MDN, Extension Workshop). Inhalte sind zusammengefasst, nicht übernommen.

## Entscheidung: ein Repo, ein Quellcode
- **Entscheidung**: Firefox-Variante im selben Repo, gleicher `src/`-Ordner, ein Build-Skript mit zwei Zielen.
- **Begründung**: Der Code nutzt nur etwa zehn Aufrufe von Erweiterungs-APIs (`storage`, `tabs`, `scripting`, `action`, `runtime`), alle in beiden Browsern vorhanden. Krypto, Tresor-Format und Tests sind sicherheitsrelevant und dürfen nicht auseinanderlaufen. Eine Sicherung muss in beiden Browsern lesbar bleiben.
- **Verworfen**: eigenes Repo (Fork-Drift bei Krypto/Tresor, doppelte Pflege, doppelte Releases), Kopie des Codes in `firefox/` (dasselbe Problem im selben Repo).

## Unterschiede Chrome / Firefox, die draob betreffen

| Thema | Befund | Folge |
|---|---|---|
| Hintergrundskript | Firefox unterstützt `background.service_worker` nicht, sondern `background.scripts` als Event-Page. Chrome ab 121 ignoriert `scripts` im Manifest v3, davor lehnt Chrome das Manifest ab. [MDN: background](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/background) | Eigenes Manifest pro Browser, weil die Mindestversion von Chrome 110 ist. Der Code in `src/background` hält keinen Zustand im Speicher und läuft in beiden Formen |
| Namespace und Promises | Firefox unterstützt in Manifest v3 Promises auch auf `chrome.*`; ein früher gemeldeter Fehler gilt für Manifest v2 ([Bugzilla 1891186](https://bugzilla.mozilla.org/show_bug.cgi?id=1891186)). [MDN: Build a cross browser extension](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Build_a_cross_browser_extension) | `chrome.*` bleibt, kein Polyfill. Im echten Firefox zu bestätigen (manuelle Checkliste) |
| Kennung | `key` im Manifest wird in Firefox nicht unterstützt; die feste ID kommt aus `browser_specific_settings.gecko.id`, bei Manifest v3 Pflicht zum Signieren. [MDN: browser_specific_settings](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/browser_specific_settings) | `draob@engelrico.de`, vom Projektinhaber zu bestätigen |
| Datensammlung | Neue Erweiterungen auf AMO müssen seit 2025-11-03 `data_collection_permissions` angeben; "keine Daten" ist `required: ["none"]`. [Mozilla-Blog](https://blog.mozilla.org/addons/2025/10/23/data-collection-consent-changes-for-new-firefox-extensions), [Extension Workshop](https://extensionworkshop.com/documentation/develop/firefox-builtin-data-consent/) | In der Überlagerung gesetzt. Passt zu `docs/privacy.md` |
| Mindestversion | Das Datenschutz-Feld wird ab Firefox 140 (Desktop) verstanden; ältere Versionen zeigen eine Warnung zum unbekannten Schlüssel | `strict_min_version: 140.0`, Entscheidung offen für ältere ESR-Versionen |
| Host-Rechte | In Manifest v3 sind Host-Rechte in Firefox opt-in; seit Firefox 127 werden die Rechte aus `host_permissions` und `content_scripts` bei der Installation angezeigt. [MDN: host_permissions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/host_permissions) | Badge hängt am Content-Script, das auf miro.com läuft; "In Miro einfügen" nutzt `activeTab` auf Klick. Im echten Firefox prüfen |
| Optionsseite | Firefox nutzt `options_ui`; mit `open_in_tab: true` öffnet sie in einem Tab. | Überlagerung ersetzt `options_page`. `runtime.openOptionsPage()` bleibt unverändert |
| Signierung | Dauerhaft installiert Firefox nur von Mozilla signierte Erweiterungen | Anleitung in `docs/releasing.md` (Abschnitt Firefox) |

## Prüfung
`npx web-ext lint --source-dir dist-firefox --ignore-files "*.map" "*.LEGAL.txt"`: 0 Fehler, 5 Warnungen (4× `innerHTML` aus `react-dom`, 1× Android-Mindestversion). In dieser Entwicklungsumgebung konnte kein echter Firefox gestartet werden (fehlende Systembibliotheken); der Lauf im Browser steht deshalb noch aus.

## Offene Fragen
Verteilweg (intern signiert oder öffentlich auf AMO), Firefox für Android, Mindestversion für ältere ESR-Versionen. Siehe `spec.md`, Abschnitt Clarifications.
