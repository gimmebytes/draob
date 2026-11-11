# Feature Specification: Firefox-Unterstützung

**Feature Branch**: `002-firefox-support`  
**Created**: 2026-11-11  
**Status**: Draft  
**Input**: User description: "Ein Kollege hat eine Chrome-Extension gebaut, die Miro-Board-Passwörter verwaltet (bei uns sind Miro-Passwörter Pflicht, weil nicht jeder einen echten Miro-/SAML-Account hat). Ich nutze Firefox. Baue eine Firefox-Variante, so dass beide Extensions nebeneinander im Repo leben können, oder entscheide, ob ein eigenes Repo besser ist. Die Specs sollen im selben Format wie bisher entstehen."
## Execution Flow (main)
```
1. Parse user description from Input
   → If empty: ERROR "No feature description provided"
2. Extract key concepts from description
   → Identify: actors, actions, data, constraints
3. For each unclear aspect:
   → Mark with [NEEDS CLARIFICATION: specific question]
4. Fill User Scenarios & Testing section
   → If no clear user flow: ERROR "Cannot determine user scenarios"
5. Generate Functional Requirements
   → Each requirement must be testable
   → Mark ambiguous requirements
6. Identify Key Entities (if data involved)
7. Run Review Checklist
   → If any [NEEDS CLARIFICATION]: WARN "Spec has uncertainties"
   → If implementation details found: ERROR "Remove tech details"
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

## Clarifications
### Session 2026-11-11
- Q: Eigenes Repo oder gemeinsames Repo für die Firefox-Variante? → A: gemeinsames Repo, ein Quellcode (Begründung in `docs/decisions/ADR-0005-firefox-build.md`)
- Q: Welche Browser werden unterstützt? → A: Firefox auf dem Desktop; Chrome bleibt unverändert (vorher: FR-017 in Spec 001, "später Chrome, Edge, Firefox")
- Q: Muss eine Sicherung zwischen Chrome und Firefox austauschbar sein? → A: ja, wer den Browser wechselt oder beide nutzt, soll seine Einträge mitnehmen können
- Q: Wie wird die Firefox-Variante verteilt? → A: [NEEDS CLARIFICATION: nur intern signiert und selbst verteilt (ohne Veröffentlichung) oder öffentlich auf addons.mozilla.org? Vorläufige Annahme: intern signiert]
- Q: Wird Firefox für Android gebraucht? → A: [NEEDS CLARIFICATION: Annahme "nein", die Bedienung ist für das Desktop-Popup entworfen]
- Q: Welche Firefox-Versionen müssen laufen? → A: [NEEDS CLARIFICATION: Annahme "ab Version 140" (aktuelle Anforderung von Mozilla an neue Erweiterungen); ältere ESR-Versionen wären möglich, wenn nötig]

## User Scenarios & Testing *(mandatory)*

### Primary User Story
Als Office Worker, der Firefox benutzt, möchte ich draob genauso verwenden wie Kolleginnen und Kollegen in Chrome, damit ich Passwörter für Miro-Boards sicher speichern, wiederfinden und mit einem Klick einfügen kann und nicht auf Chrome ausweichen muss.

### Acceptance Scenarios
1. **Given** draob ist in Firefox installiert, **When** ich ein Miro-Board öffne und das draob-Icon anklicke, **Then** kann ich das Passwort für das Board speichern und später abrufen.
2. **Given** für das geöffnete Board ist ein Eintrag gespeichert und die Abfrage nach dem Board-Passwort ist sichtbar, **When** ich "In Miro einfügen" klicke, **Then** steht das Passwort im Feld und nichts wird abgeschickt.
3. **Given** ich habe in Chrome eine Sicherung gespeichert, **When** ich sie in Firefox wiederherstelle, **Then** sind alle Einträge nach Eingabe des alten Masterpassworts vorhanden (und umgekehrt).
4. **Given** der Tresor ist entsperrt, **When** ich Firefox beende und neu starte, **Then** ist der Tresor gesperrt, die Einträge sind noch da.
5. **Given** ich nutze draob in Chrome und in Firefox, **When** ich eine neue Version veröffentliche, **Then** haben beide Varianten dieselbe Versionsnummer und dieselben Funktionen.
6. **Given** ich installiere draob in Firefox, **When** Firefox die Berechtigungen anzeigt, **Then** verlangt draob nicht mehr als in Chrome und erklärt, dass keine Daten gesammelt oder übertragen werden.

### Edge Cases
- Was passiert, wenn der Zugriff auf miro.com in Firefox nicht erlaubt ist (Firefox lässt Nutzer Seitenzugriff einzeln freigeben)? Das Einfügen per Klick muss trotzdem funktionieren, nur der Hinweis am Icon fehlt dann.
- Was passiert mit einer nur "temporär" geladenen Erweiterung nach einem Neustart von Firefox? Sie verschwindet; das muss in der Anleitung stehen, damit niemand seinen Tresor verliert.
- Was passiert, wenn dieselbe Person Chrome und Firefox nutzt? Beide Tresore sind getrennt und werden nur über Sicherungen abgeglichen.
- Was passiert, wenn die Erweiterungs-ID in Firefox später geändert würde? Alle Nutzer hätten einen leeren Tresor. Die ID muss deshalb vor der ersten Verteilung festgelegt und bestätigt sein.
- Was passiert bei einer Firefox-Version unter der Mindestversion? Die Installation wird von Firefox abgelehnt, es entstehen keine halb funktionierenden Zustände.

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: Die Erweiterung MUST in Firefox (Desktop, ab der festgelegten Mindestversion) alle Funktionen bieten, die sie in Chrome hat: Tresor anlegen und entsperren, Einträge verwalten, Suche, Tags, Favoriten, Board-Erkennung mit Hinweis am Icon, "In Miro einfügen", Sicherung, Wiederherstellen, Zurücksetzen.
- **FR-002**: Chrome-Variante und Firefox-Variante MUST aus demselben Quellcode entstehen. Fachlogik, Verschlüsselung und Tresor-Format dürfen es nur einmal geben.
- **FR-003**: Das Verhalten der Chrome-Variante MUST unverändert bleiben (gleiche Ausgabe, gleiche ID, gleiche Pakete für Release und Web Store).
- **FR-004**: Sicherungsdateien MUST zwischen Chrome und Firefox austauschbar sein.
- **FR-005**: Die Firefox-Variante MUST dieselben Berechtigungen anfordern wie die Chrome-Variante und MUST gegenüber Firefox angeben, dass keine Daten gesammelt oder übertragen werden.
- **FR-006**: Die Firefox-Variante MUST eine feste, dauerhafte Erweiterungs-Kennung haben, damit der Tresor bei Updates und Neuinstallationen derselben Variante erhalten bleibt.
- **FR-007**: Die Versionsnummer MUST für beide Varianten an einer Stelle geführt werden.
- **FR-008**: Jede Änderung am gemeinsamen Code MUST automatisch gegen beide Varianten gebaut und getestet werden (CI).
- **FR-009**: Die Firefox-Variante MUST sich mit dem offiziellen Prüfwerkzeug von Mozilla ohne Fehler validieren lassen.
- **FR-010**: Die Dokumentation MUST für Firefox beschreiben: Ausprobieren, dauerhaft Installieren (Signierung), Umzug von Chrome, bekannte Einschränkungen.
- **FR-011**: Die Anzeige von Browser und Version im Feedback-Entwurf MUST Firefox erkennen.
- **FR-012**: Ein Release für Firefox MUST für Nutzer dauerhaft installierbar sein. [NEEDS CLARIFICATION: Verteilweg (intern signiert oder öffentlich) entscheidet, ob Signierung automatisiert werden soll]

### Key Entities
- **Tresor / Sicherung**: bleibt unverändert (ADR-0001, ADR-0002); ein Tresor liegt pro Browser-Profil und Variante, die Sicherung ist der Austauschweg.
- **Variante**: eine Ausprägung der Erweiterung für einen Browser (Chrome, Firefox) mit eigenem Paket und eigener Kennung, gleiche Version und gleiche Funktionen.

---

## Review & Acceptance Checklist
*GATE: Automated checks run during main() execution*

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [ ] No [NEEDS CLARIFICATION] markers remain (drei offen: Verteilweg, Android, Mindestversion)
- [x] Requirements are testable and unambiguous  
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

---

## Execution Status
*Updated by main() during processing*

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [ ] Review checklist passed (wartet auf die drei offenen Fragen)

---
