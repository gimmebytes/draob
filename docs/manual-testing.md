# Manuelle Release-Checkliste (echtes Chrome und Firefox)

Vor jedem Einreichen im Chrome Web Store einmal komplett durchgehen. Ergebnis mit Datum und Chrome-Version unten eintragen.
Mindestversion laut Manifest: Chrome 110.

## Vorbereitung

- [ ] `npm ci && npm run build`
- [ ] `chrome://extensions` → Entwicklermodus → „Entpackte Erweiterung laden“ → `dist/`
- [ ] Name „draob“, Icon, Version und genau diese Berechtigungen sehen: `storage`, `activeTab`, `scripting` (+ Zugriff nur auf miro.com Boards)
- [ ] Fehlerseite der Erweiterung („Fehler“-Knopf) ist leer, Service-Worker-Konsole ohne Fehler

## Tresor

- [ ] Erster Start: Masterpasswort mit < 8 Zeichen wird abgelehnt, mit ≥ 8 klappt es
- [ ] Falsches Passwort beim Entsperren zeigt „Falsches Masterpasswort“
- [ ] „Sperren“ sperrt, Chrome komplett schließen und neu öffnen: Entsperren nötig, Einträge noch da
- [ ] **Migration:** Hast du einen Tresor aus der MiroHero-Zeit (Schema v1)? Entsperren, prüfen, dass alle Einträge samt Passwörtern da
      sind (Titel, URLs, Passwörter über „In Liste klicken“ kontrollieren)

## Board erkennen und einfügen

- [ ] Miro-Board öffnen und neu laden: goldener Punkt am Symbol, Tooltip „draob: Passwort für dieses Board“
- [ ] Popup auf einem **neuen** Board: Hinweis „Neues Miro-Board erkannt“, Titel ohne „| Miro“ und URL ohne Query vorausgefüllt
- [ ] Passwort eintragen, Tags vergeben, speichern; Popup schließen, erneut öffnen: „Dieses Board ist bereits gespeichert“, Eintrag geladen
- [ ] Passwortgeschütztes Board (Passwortseite): „In Miro einfügen“ trägt das Passwort ein, **ohne** abzusenden
- [ ] Auf einer Nicht-Board-Seite (z. B. miro.com/app/dashboard/) bleibt das Formular leer, kein Badge

## Liste, Suche, Ordnung

- [ ] Mehrere Einträge anlegen; Suche (Teilwort, Akzent, mehrere Wörter), Tag-Filter (mehrere Tags), Favoriten-Filter
- [ ] Stern setzt Favorit, Favoriten stehen oben
- [ ] Löschen fragt nach („Löschen? / Nein“)
- [ ] Link-Symbol an einem Eintrag: öffnet die gespeicherte Seite in einem **neuen Tab** (Popup schließt sich); Cmd/Strg-Klick öffnet im Hintergrund und das Popup bleibt
- [ ] Klick auf den Eintrag selbst öffnet **nur** das Formular, es öffnet sich kein Tab
- [ ] Auf dem geöffneten Board: goldener Punkt am Symbol → Icon klicken → „bereits gespeichert“ → „In Miro einfügen“
- [ ] Eintrag mit ungültiger Adresse (z. B. `irgendwas`): Link-Symbol ist deaktiviert
- [ ] Gleiches Board zweimal speichern: Hinweis „Für dieses Board gibt es schon einen Eintrag“ → „Bestehenden Eintrag aktualisieren“
- [ ] Config → „Doppelte Einträge“ zeigt keine Treffer (oder fasst vorhandene zusammen)

## Sicherung, Wiederherstellung, Reset

- [ ] Config → „Sicherung“ lädt `draob-backup-JJJJ-MM-TT.json` herunter; Datei öffnen: kein Titel, keine URL, kein Passwort im Klartext
- [ ] Config → „Verwaltung“ öffnet die Verwaltungsseite in einem Tab
- [ ] Verwaltung → Wiederherstellen: eine Textdatei oder fremde JSON wird abgelehnt, die echte Sicherung wird akzeptiert
- [ ] Nach dem Wiederherstellen: Entsperren mit dem Masterpasswort der Sicherung, alle Einträge da
- [ ] Entsperr-Bildschirm → „Passwort vergessen?“ → „Verschlüsselte Sicherung speichern“ funktioniert; „Abbrechen“ lässt alles unverändert
- [ ] „Ja, alles löschen“ führt zur Einrichtung („Masterpasswort festlegen“), alte Daten sind weg

## Oberfläche und Qualität

- [ ] About-Tab: Spendenlink öffnet paypal.me in neuem Tab (nur auf Klick, kein Popup beim Start)
- [ ] Feste ID: Eine Build-ZIP in zwei verschiedene Ordner entpacken und nacheinander laden: `chrome://extensions` zeigt beide Male `kifhfncchlpbohakjahaafjmfhfcaabj`, der Tresor bleibt erhalten
- [ ] About-Tab, Feedback: „Fehler oder Idee auf GitHub melden“ zeigt die Vorlagen-Auswahl (Fehler, Idee); „E-Mail“ öffnet das Mailprogramm mit Entwurf an draob@engelrico.de (kein leerer neuer Tab; Betreff mit Version, Version/Browser/System im Text, Hinweis „keine Passwörter“)
- [ ] „Kopieren“ legt die Adresse in die Zwischenablage; der ganze About-Tab passt ohne Scrollen ins Popup; die Karte zeigt Adresse, Version und Browser als Text
- [ ] Popup öffnet in unter 200 ms, Tabs reagieren sofort
- [ ] Keine CSP-Fehler und keine Fehler in der Popup-Konsole (Rechtsklick auf das Popup → Untersuchen)
- [ ] Erweiterung deaktivieren/aktivieren, entfernen und neu laden: ohne Fehler
- [ ] Optional: Edge ausprobieren (gleicher Build)

## Firefox (`npm run build:firefox`)

Mindestversion laut Manifest: Firefox 140. Gleiche Abläufe wie oben, dazu:

- [ ] `about:debugging#/runtime/this-firefox` → „Temporäres Add-on laden…“ → `dist-firefox/manifest.json`; keine Warnung zum Manifest
- [ ] Berechtigungen im Erweiterungen-Menü (Zahnrad → „Erweiterung verwalten“ → Berechtigungen): nur Zugriff auf miro.com; bei der signierten Installation zeigt Firefox „keine Daten werden gesammelt“
- [ ] Icon über das Erweiterungen-Menü (Puzzle-Symbol) anheften, Popup öffnet, Masterpasswort anlegen, Eintrag speichern
- [ ] Miro-Board öffnen: Badge erscheint am Icon (Miro-Seite ggf. einmal neu laden). Fehlt es, steht der Zugriff auf miro.com in Firefox womöglich noch auf „nicht erlaubt“ (Berechtigungen der Erweiterung prüfen) und das Ergebnis hier vermerken
- [ ] Auf einem Board mit Passwortabfrage: „In Miro einfügen“ trägt das Passwort ein (activeTab und `scripting` nach Klick auf das Icon)
- [ ] „Config“ → Sicherung speichern lädt die Datei herunter; auf der Verwaltungsseite (öffnet in einem Tab) Wiederherstellen mit dieser Datei funktioniert
- [ ] Eine Sicherung aus Chrome lässt sich in Firefox wiederherstellen (und umgekehrt)
- [ ] Firefox komplett schließen und neu öffnen: Tresor ist gesperrt (Sitzungsschlüssel weg), Einträge noch da (nur bei signierter Installation, ein temporäres Add-on verschwindet)
- [ ] Browser-Konsole (`Strg+Umschalt+J`) und Popup-Konsole (Untersuchen) ohne CSP- oder Berechtigungsfehler
- [ ] About-Tab zeigt „Firefox <Version>“ in der Feedback-Karte

## Ergebnis

| Datum | Browser und Version | Ergebnis | Bemerkungen |
| ----- | ------------------- | -------- | ----------- |
|       |                |          |             |
