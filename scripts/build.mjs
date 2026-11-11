#!/usr/bin/env node
// Builds the extension into dist/ (or `--outdir <dir>`): copies public/ and bundles the entry points with esbuild.
// Everything the extension needs ends up in the output folder; nothing is loaded from the network (strict CSP).
//
// `--browser firefox` builds the Firefox variant from the same sources into dist-firefox/: public/manifest.json
// stays the single manifest, scripts/manifest.firefox.json is merged over it (see docs/decisions/ADR-0005).
import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const option = (name) => {
  const index = process.argv.indexOf(name);
  return index > -1 ? process.argv[index + 1] : undefined;
};

const browser = option('--browser') ?? 'chrome';
if (!['chrome', 'firefox'].includes(browser)) {
  console.error(`Unknown --browser "${browser}" (use chrome or firefox)`);
  process.exit(1);
}
const outdir = path.resolve(
  root,
  option('--outdir') ?? (browser === 'firefox' ? 'dist-firefox' : 'dist'),
);

/** Deep-merges `overlay` into `base`; a `null` in the overlay removes the key. Arrays are replaced. */
function applyOverlay(base, overlay) {
  const result = { ...base };
  for (const [key, value] of Object.entries(overlay)) {
    if (value === null) delete result[key];
    else if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = applyOverlay(result[key] ?? {}, value);
    } else result[key] = value;
  }
  return result;
}

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

fs.rmSync(outdir, { recursive: true, force: true });
fs.cpSync(path.join(root, 'public'), outdir, { recursive: true });

const manifestPath = path.join(outdir, 'manifest.json');
if (browser === 'firefox') {
  // Firefox has no extension service worker (it runs background.scripts as an event page), wants
  // options_ui and an explicit add-on ID. It ignores the Chrome-only manifest "key".
  const overlay = readJson(path.join(root, 'scripts', 'manifest.firefox.json'));
  const manifest = applyOverlay(readJson(manifestPath), overlay);
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
} else if (!process.argv.includes('--store')) {
  // Stable extension ID for installs outside the Chrome Web Store: an unpacked extension without a
  // manifest "key" gets its ID (and therefore its storage) from the folder path. The key is public.
  // `--store` leaves it out: the Web Store assigns its own ID (see docs/releasing.md).
  const manifest = readJson(manifestPath);
  manifest.key = fs.readFileSync(path.join(root, 'scripts', 'extension-key.txt'), 'utf8').trim();
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

const common = {
  absWorkingDir: root,
  outdir,
  bundle: true,
  minify: true,
  target: browser === 'firefox' ? 'firefox140' : 'chrome110',
  // External source maps only: eval-based ones would violate the extension CSP.
  sourcemap: true,
  logLevel: 'info',
};

await build({
  ...common,
  entryPoints: {
    'background.bundle': 'src/background/index.js',
    'content.bundle': 'src/content/index.js',
    'popup.bundle': 'src/popup/index.jsx',
    'options.bundle': 'src/options/index.jsx',
  },
  format: 'iife',
  jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"production"' },
  // Keeps the license headers of React and friends in separate *.LEGAL.txt files next to the bundles.
  legalComments: 'linked',
});

// One stylesheet for popup and management page.
await build({ ...common, entryPoints: { theme: 'src/shared/theme.css' } });
