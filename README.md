<p align="center">
  <img src="docs/assets/hero.png" alt="draob: Board-Passwörter verschlüsselt, durchsuchbar, mit einem Klick eingefügt" width="100%">
</p>

<h3 align="center">Schluss mit „Wie war nochmal das Passwort für dieses Board?“</h3>

<p align="center"><sub><b>draob</b> ist <i>board</i> rückwärts: die Rückseite deiner Boards, auf der die Passwörter sicher liegen.</sub></p>

<p align="center">
  draob ist eine Browser-Extension für Chrome und Firefox, die die Passwörter deiner Miro-Boards verschlüsselt speichert,
  das richtige Board beim Öffnen erkennt und das Passwort mit einem Klick einfügt.
</p>

<p align="center">
  <b>Lokal</b> · <b>AES-256-verschlüsselt</b> · <b>keine Konten, kein Server, kein Tracking</b>
</p>

> **Status: früher Prototyp.** Alles Beschriebene funktioniert und ist getestet, aber draob ist noch
> nicht im Chrome Web Store und hatte keine unabhängige Sicherheitsprüfung. Mehr unter
> [Sicherheit & Ehrlichkeit](#sicherheit--ehrlichkeit).

---

## Warum draob?

Wer mit vielen Kunden, Teams und Workshops arbeitet, hat schnell **20, 30 oder mehr passwortgeschützte
Miro-Boards**. Die Passwörter liegen in Chats, Notizen und Köpfen. draob macht daraus eine kleine,
aufgeräumte Schaltzentrale direkt im Browser.

## Das kann es

| | |
|---|---|
| 🎯 **Erkennt dein Board** | Öffnest du ein Miro-Board, übernimmt draob URL und Titel. Ist das Board schon gespeichert, lädt es den Eintrag, sonst bietet es ihn als neuen an. |
| ⚡ **Passwort mit einem Klick** | „In Miro einfügen“ trägt das Passwort in das Feld der Miro-Seite ein. Absenden tust du selbst, draob drückt nie etwas für dich. |
| 🔎 **Sofort-Suche** | Findet Titel, URL und Tags in Echtzeit, ohne Groß-/Kleinschreibung und Akzente (`cafe` findet `Café`). Mehrere Wörter grenzen weiter ein. |
| 🔗 **Seite direkt öffnen** | Jeder Eintrag hat ein Link-Symbol: ein Klick öffnet die gespeicherte Seite in einem neuen Tab (Cmd/Strg-Klick im Hintergrund). Ein Klick auf den Eintrag selbst öffnet nur das Formular. |
| 🏷️ **Tags & Favoriten** | Ordne Boards mit Tags („Kunde A“, „Agil“) und hefte die wichtigsten mit ★ oben an. Filter-Chips zeigen, wie viele Boards jedes Tag hat. |
| 🧹 **Keine Dubletten** | Pro Miro-Board gibt es genau einen Eintrag, auch wenn die URL mal mit `eu.miro.com` oder Parametern kommt. Bestehende Doppelte führst du mit einem Klick zusammen. |
| 💾 **Sicherung** | Speichere den verschlüsselten Tresor als Datei und stelle ihn auf einem anderen Rechner oder nach einer Neuinstallation wieder her. |
| 🔒 **Alles verschlüsselt** | Nicht nur Passwörter: auch Titel, URLs und Tags liegen verschlüsselt im Browser-Speicher. Ohne dein Masterpasswort steht dort nichts Lesbares. |
| 🟡 **Badge auf Boards** | Auf Miro-Boards zeigt ein goldener Punkt am Icon: „Hier kann ich helfen.“ |

## So sieht es aus

<table>
  <tr>
    <td align="center" width="33%"><img src="docs/screenshots/home-known.png" alt="Bekanntes Board: Eintrag geladen, Passwort einfügen" width="260"><br><sub><b>Board erkannt:</b> Eintrag geladen, Passwort mit einem Klick einfügen</sub></td>
    <td align="center" width="33%"><img src="docs/screenshots/home-new.png" alt="Neues Board: Titel und URL vorausgefüllt" width="260"><br><sub><b>Neues Board:</b> Titel und URL schon ausgefüllt, nur Passwort ergänzen</sub></td>
    <td align="center" width="33%"><img src="docs/screenshots/list.png" alt="Liste mit Favoriten, Tags und Zähler" width="260"><br><sub><b>Liste:</b> Favoriten oben, Tags, Zähler</sub></td>
  </tr>
  <tr>
    <td align="center"><img src="docs/screenshots/search.png" alt="Suche nach „sprint“" width="260"><br><sub><b>Suche:</b> „sprint“ findet vier Boards sofort</sub></td>
    <td align="center"><img src="docs/screenshots/tags.png" alt="Filter nach Tags Intern und Agil" width="260"><br><sub><b>Tag-Filter:</b> „Intern“ und „Agil“ kombiniert</sub></td>
    <td align="center"><img src="docs/screenshots/config.png" alt="Doppelte Einträge zusammenführen" width="260"><br><sub><b>Aufräumen:</b> Doppelte zusammenführen</sub></td>
  </tr>
</table>

<sub>Screenshots zeigen Beispieldaten.</sub>

## So funktioniert es

1. **Masterpasswort festlegen.** Beim ersten Start legst du ein Masterpasswort fest (mindestens 8 Zeichen).
   Aus ihm wird der Schlüssel berechnet. draob speichert das Passwort selbst nie.
2. **Board öffnen, Popup öffnen.** Klick auf das draob-Icon. Neues Board? Passwort eintragen, Tags
   vergeben, speichern. Bekanntes Board? Der Eintrag ist schon da.
3. **Einfügen.** „In Miro einfügen“ klicken, in Miro bestätigen. Fertig.

Der Tresor sperrt sich, wenn du den Browser schließt, oder wenn du auf **Sperren** klickst.

## Download

Fertige Version: **[Releases → neueste Version](https://github.com/engelrico/draob/releases/latest)**. Dort `draob-<Version>.zip` herunterladen,
entpacken und wie unten beschrieben in Chrome laden (Schritte 2 bis 4). Node.js und ein Build sind dafür nicht nötig.

## Aus dem Quellcode bauen

draob ist noch nicht im Chrome Web Store. Bis dahin installierst du es aus dem Quellcode (Node.js 20+):

```bash
git clone https://github.com/engelrico/draob.git
cd draob
npm ci
npm run build
```

Dann in Chrome:

1. `chrome://extensions` öffnen
2. **Entwicklermodus** einschalten
3. **Entpackte Erweiterung laden** und den Ordner `dist/` wählen
4. Das Icon über das Puzzle-Symbol an die Leiste anheften

Nach einem Update: `npm run build` und in `chrome://extensions` auf **Neu laden** klicken. Die Erweiterungs-ID ist fest, deine Einträge bleiben auch erhalten, wenn du eine neue ZIP in einen anderen Ordner entpackst. Wer von einer Version bis v0.1.1 kommt, exportiert vorher die Sicherung und stellt sie in der neuen Version wieder her (die ID wechselt einmalig).
Für das Badge auf einem Board die Miro-Seite einmal neu laden.

### Firefox

Gleicher Quellcode, eigener Build (Firefox 140 oder neuer, nur Desktop):

```bash
npm ci
npm run build:firefox
```

- **Zum Ausprobieren:** `about:debugging#/runtime/this-firefox` → **Temporäres Add-on laden…** → `dist-firefox/manifest.json` wählen.
  Das Add-on verschwindet beim Neustart von Firefox, rechne damit, dass der Tresor mit verschwindet. Vorher eine Sicherung speichern.
- **Dauerhaft:** Firefox lädt dauerhaft nur signierte Erweiterungen. Wie du `dist-firefox/` signieren lässt (kostenlos, ohne Veröffentlichung), steht in [docs/releasing.md](docs/releasing.md#firefox).

Der Tresor gehört zum Browser. Wer von Chrome nach Firefox wechselt, speichert in Chrome unter **Config** eine Sicherung und stellt sie in Firefox auf der Verwaltungsseite wieder her.

## Sicherheit & Ehrlichkeit

**Was draob tut**

- **Verschlüsselung:** AES-256-GCM. Der Schlüssel entsteht aus deinem Masterpasswort mit PBKDF2-SHA-256
  (600.000 Iterationen, zufälliges Salt).
- **Alles lokal:** Es gibt keinen Server, keine Konten und keine Analytics. Es wird nichts übertragen.
- **Kein Klartext im Speicher:** Passwörter, Titel, URLs und Tags liegen in einem verschlüsselten Block.
  Der abgeleitete Schlüssel lebt nur in `storage.session` und verschwindet, wenn der Browser beendet wird.
- **Wenig Rechte:** nur drei Permissions, jede mit einem Zweck:

  | Permission | Wofür |
  |---|---|
  | `storage` | den verschlüsselten Tresor lokal speichern |
  | `activeTab` | URL und Titel des Tabs lesen, den du gerade bewusst über das Icon öffnest |
  | `scripting` | auf Klick das Passwort ins Feld der Miro-Seite eintragen |

  Das Content-Script läuft ausschließlich auf `miro.com/app/board/*`.
- **Kein Auto-Submit:** draob füllt nur aus, du bestätigst selbst. Ausgefüllt wird auch nur auf deinen Klick.

**Was du wissen solltest**

- **Vergisst du das Masterpasswort, sind die Daten weg.** Es gibt keine Wiederherstellung (das ist Absicht).
- draob ist ein **Prototyp ohne unabhängiges Sicherheits-Audit**. Für Hochsicherheits-Zugangsdaten nimm
  einen etablierten Passwortmanager. Für Board-Passwörter, die sonst in Chat-Verläufen liegen, ist es ein
  deutlicher Schritt nach vorn.
- Es gibt noch keinen Auto-Lock nach Zeit und keinen Weg, das Masterpasswort zu ändern. Eine Sicherung ist mit dem Masterpasswort von damals verschlüsselt.
- Wer Zugriff auf dein entsperrtes Browser-Profil hat, kann das Popup benutzen. Sperre den Tresor, wenn du weggehst.

Die technischen Details stehen in [ADR-0001](docs/decisions/ADR-0001-key-management.md) (Schlüsselmodell)
und [ADR-0002](docs/decisions/ADR-0002-encrypted-vault-v2.md) (Tresor-Format).

## Roadmap

- [x] Verschlüsselter Tresor mit Masterpasswort
- [x] Board-Erkennung, Passwort-Einfügen per Klick
- [x] Suche, Tags, Favoriten, Dublettenerkennung
- [x] Verschlüsselte Sicherung und Wiederherstellung, Reset bei vergessenem Passwort
- [ ] Automatisches Sperren nach Zeit, Masterpasswort ändern
- [x] Firefox-Build aus demselben Quellcode (noch nicht signiert/veröffentlicht)
- [ ] Chrome Web Store
- [ ] Ende-zu-Ende-Tests im echten Browser

Ideen und Wünsche gern als Issue.

## Entwickeln

```bash
npm ci
npm run build   # baut nach dist/
npm test        # Unit-Tests (Jest)
npm run lint    # ESLint
```

Stack: React 19, esbuild, Manifest V3. Der Quellcode liegt in `src/`, statische Dateien (Manifest, HTML,
Icons) in `public/`.

| Mehr dazu | |
|---|---|
| [AGENTS.md](AGENTS.md) | Einstieg für Mitwirkende und KI-Agenten: Befehle, Regeln, Verzeichnisse |
| [Handout zum Testen](docs/handout.md) | Einseiter für Tester: was es kann, Installation, Update |
| [Architektur](docs/architecture.md) | Komponenten, Datenfluss, Tresor-Schema |
| [Anforderungen](docs/requirements.md) | Funktionsliste mit Status |
| [Entscheidungen](docs/decisions/) | Warum der Tresor so gebaut ist |
| [Compliance](docs/compliance.md) | Stand für den Chrome Web Store |
| [Manuelle Tests](docs/manual-testing.md) | Testablauf vor einem Release |

## Unterstützen

draob ist kostenlos und bleibt es. Wenn es dir Zeit spart, freue ich mich über ein freiwilliges Bier:
**[🍺 paypal.me/engelrico](https://paypal.me/engelrico)**. Der Link steht auch im About-Tab der Erweiterung.
Auch ohne Bier ist ein Stern fürs Repo oder eine Idee als Issue viel wert.

## Kontakt

Fragen, Ideen und Fehler am liebsten als [Issue](https://github.com/engelrico/draob/issues) (es gibt Vorlagen). Beide Wege stehen auch im About-Tab der Erweiterung. Vertrauliche Anliegen und Sicherheitsmeldungen per E-Mail an **draob@engelrico.de**.

## Hinweis

draob ist ein unabhängiges Projekt und **nicht mit Miro verbunden, von Miro unterstützt oder geprüft**.
„Miro“ ist eine Marke der jeweiligen Inhaberin.

Lizenz: [MIT](LICENSE).
