# Releases

Ein Release ist ein fertiger Download (`draob-<Version>.zip`) auf der GitHub-Seite unter **Releases**. Er entsteht aus einem Versions-Tag.
Für den Chrome Web Store baust du das Paket ohne Schlüssel (`npm run build -- --store`, siehe unten).

## Neues Release in drei Befehlen
```bash
npm version minor                      # 0.1.0 -> 0.2.0 (oder patch / major / eine feste Zahl wie 1.0.0)
git push origin 001-f-hre-eine:main    # den Release-Commit zu GitHub schicken
git push origin v0.2.0                 # den Tag schicken: das startet den Release-Workflow
```
`npm version` erhöht die Version in `package.json` und `package-lock.json`, gleicht `public/manifest.json` über
`scripts/sync-manifest-version.js` an, macht daraus den Commit „Release vX.Y.Z“ und setzt den Tag `vX.Y.Z`. Der Arbeitsbaum muss dafür sauber sein.
**Versionen nie von Hand ändern.**

## Was dann passiert
Der Workflow `Release` (`.github/workflows/release.yml`) startet nur bei einem Tag `v*` und:
1. führt Lint, Tests und Build aus,
2. prüft, dass Tag, `package.json` und `manifest.json` dieselbe Version haben (sonst Abbruch),
3. packt `dist/` ohne `.map`-Dateien zu `draob-<Version>.zip` und erzeugt `draob-<Version>.zip.sha256`,
4. legt das GitHub-Release mit Installationstext an (oder hängt die Dateien an ein schon vorhandenes Release an).
Versionen vor 1.0 erscheinen als **Vorabversion** (pre-release). Normale Pushes auf `main` starten nur die CI, nie ein Release.

## Erstes Release ohne Versionssprung
Die Version steht schon auf `0.1.0`, also nur Tag setzen und schicken:
```bash
git tag -a v0.1.0 -m "Release v0.1.0"
git push origin v0.1.0
```

## Probelauf ohne Release
Actions → **Release** → **Run workflow**. Das baut und lädt nur die ZIP als Workflow-Artefakt hoch (90 Tage). Es entsteht kein Release.

## Release korrigieren
- ZIP ersetzen: den Workflow für den Tag erneut starten, er überschreibt die Dateien im vorhandenen Release (`--clobber`).
- Falschen Tag entfernen: `git push --delete origin vX.Y.Z` und `git tag -d vX.Y.Z`; das Release auf der GitHub-Seite getrennt löschen.

## Hinweise
- **Sichtbarkeit:** Das Repo ist öffentlich, die Release-Seite ist damit für alle erreichbar (auch ohne GitHub-Konto). Alles, was im Repo oder in einem Release liegt, ist öffentlich: keine Zugangsdaten, keine privaten Daten committen.
- **Version für Chrome:** 1 bis 4 Zahlenblöcke, keine Zusätze wie `-beta`. Jeder Store-Upload braucht eine höhere Version als der vorherige.
- **Installation aus der ZIP:** entpacken → `chrome://extensions` → Entwicklermodus → „Entpackte Erweiterung laden“. Chrome installiert Erweiterungen außerhalb des
  Stores nicht per Doppelklick.

## Feste Erweiterungs-ID (Installation ohne Store)

Eine entpackte Erweiterung ohne `key` im Manifest bekommt ihre ID aus dem Ordnerpfad. Ein anderer Ordner hieße eine andere ID und damit einen leeren Tresor.
Deshalb fügt `npm run build` den öffentlichen Schlüssel aus `scripts/extension-key.txt` als `key` in `dist/manifest.json` ein. Die ID ist dann immer `kifhfncchlpbohakjahaafjmfhfcaabj`, egal, wohin die ZIP entpackt wird.
`public/manifest.json` enthält den Schlüssel bewusst nicht.

- **Schlüssel:** nur der öffentliche Teil liegt im Repo. Der private Teil wurde verworfen, er wird nur zum Signieren eigener CRX-Dateien gebraucht. Den Schlüssel nie austauschen, sonst ändert sich die ID wieder und alle müssen ihre Sicherung einspielen.
- **Store-Paket:** `npm run build -- --store` lässt den Schlüssel weg (so baut der Workflow „Package extension“). Der Store vergibt eine eigene ID. Wer vom ZIP-Weg auf die Store-Version wechselt, hat dort einen neuen, leeren Tresor und spielt die Sicherung ein.
- **Einmalig beim Umstieg:** Wer bisher eine Version ohne `key` geladen hat (bis v0.1.1), bekommt mit der ersten Version mit `key` eine neue ID. Vorher in der alten Installation exportieren, danach in der neuen wiederherstellen.

## Firefox

Der Firefox-Build kommt aus demselben Quellcode und derselben Version (ADR-0005): `npm run build:firefox` schreibt nach `dist-firefox/`. Der Workflow `Release` packt ihn noch nicht; das ist offen (`specs/002-firefox-support/tasks.md`).

Firefox installiert Erweiterungen dauerhaft nur, wenn Mozilla sie signiert hat. Zwei Wege, beide ohne öffentliche Listung:

1. **Signieren lassen, selbst verteilen (empfohlen für die Firma):** Einmalig ein Konto auf addons.mozilla.org anlegen und unter „Developer Hub → Manage API Keys“ Schlüssel erzeugen. Dann
   ```bash
   npm run build:firefox
   npx web-ext sign --source-dir dist-firefox --channel unlisted --ignore-files "*.map" "*.LEGAL.txt" \
     --api-key "$AMO_JWT_ISSUER" --api-secret "$AMO_JWT_SECRET"
   ```
   Das Ergebnis ist eine signierte `.xpi` in `web-ext-artifacts/`. Ein Doppelklick bzw. „Add-on aus Datei installieren…“ installiert sie dauerhaft. Schlüssel nie committen und nie in Logs ausgeben.
   Jede Version braucht eine höhere Versionsnummer als die vorherige (`npm version`).
2. **Öffentlich auf AMO (listed):** ZIP aus `dist-firefox/` (ohne `.map`) hochladen, dazu den Quellcode mit der Bauanleitung (`npm ci && npm run build:firefox`, Node laut `.nvmrc`), weil der Code gebündelt und minifiziert ist.

Zum Ausprobieren ohne Signatur: `about:debugging#/runtime/this-firefox` → „Temporäres Add-on laden…“. Das Add-on ist nach dem Neustart weg.
Mit Firefox Developer Edition oder Nightly lässt sich die Signaturpflicht über `xpinstall.signatures.required = false` abschalten.
Firmen können signierte Erweiterungen außerdem per Richtlinie (`ExtensionSettings`) verteilen.
