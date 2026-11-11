import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const root = path.resolve(__dirname, '../..');
let out;

beforeAll(() => {
  out = fs.mkdtempSync(path.join(os.tmpdir(), 'draob-build-'));
  execFileSync(process.execPath, [path.join(root, 'scripts', 'build.mjs'), '--outdir', out], {
    stdio: 'pipe',
  });
});

afterAll(() => fs.rmSync(out, { recursive: true, force: true }));

const read = (file) => fs.readFileSync(path.join(out, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(out, file));

describe('build output', () => {
  it('pins the extension ID with a public key, but not in the store build', () => {
    const { createHash } = require('node:crypto');
    const key = JSON.parse(read('manifest.json')).key;
    const hex = createHash('sha256').update(Buffer.from(key, 'base64')).digest('hex').slice(0, 32);
    const id = [...hex].map((c) => String.fromCharCode(97 + parseInt(c, 16))).join('');
    expect(id).toBe('kifhfncchlpbohakjahaafjmfhfcaabj');

    const store = fs.mkdtempSync(path.join(os.tmpdir(), 'draob-store-'));
    execFileSync(
      process.execPath,
      [path.join(root, 'scripts', 'build.mjs'), '--outdir', store, '--store'],
      { stdio: 'pipe' },
    );
    const storeManifest = JSON.parse(fs.readFileSync(path.join(store, 'manifest.json'), 'utf8'));
    fs.rmSync(store, { recursive: true, force: true });
    expect(storeManifest.key).toBeUndefined();
    expect(
      JSON.parse(fs.readFileSync(path.join(root, 'public/manifest.json'), 'utf8')).key,
    ).toBeUndefined();
  });

  it('contains every file the manifest points to', () => {
    const manifest = JSON.parse(read('manifest.json'));
    const files = [
      manifest.background.service_worker,
      manifest.action.default_popup,
      manifest.options_page,
      ...Object.values(manifest.action.default_icon),
      ...Object.values(manifest.icons),
      ...manifest.content_scripts.flatMap((c) => c.js),
    ];
    for (const file of files) expect([file, exists(file)]).toEqual([file, true]);
  });

  it('lets popup and management page load existing scripts and the stylesheet', () => {
    for (const page of ['popup.html', 'options.html']) {
      const refs = [...read(page).matchAll(/(?:src|href)="([^"]+)"/g)].map((m) => m[1]);
      expect(refs).toEqual(expect.arrayContaining(['theme.css']));
      for (const ref of refs) expect([page, ref, exists(ref)]).toEqual([page, ref, true]);
    }
  });

  it('bundles without eval or new Function (strict extension CSP)', () => {
    for (const bundle of fs.readdirSync(out).filter((f) => f.endsWith('.bundle.js'))) {
      expect([bundle, /\beval\(|new Function\(/.test(read(bundle))]).toEqual([bundle, false]);
    }
  });

  it('does not change the Chrome manifest apart from the pinned key', () => {
    const { key: _key, ...built } = JSON.parse(read('manifest.json')); // eslint-disable-line no-unused-vars
    expect(built).toEqual(
      JSON.parse(fs.readFileSync(path.join(root, 'public/manifest.json'), 'utf8')),
    );
  });

  it('keeps the license notices of the bundled React packages', () => {
    expect(read('popup.bundle.js.LEGAL.txt')).toMatch(/@license React/);
  });

  it('writes source maps next to the bundles but never inlines them', () => {
    expect(exists('popup.bundle.js.map')).toBe(true);
    expect(read('popup.bundle.js')).not.toMatch(/sourceMappingURL=data:/);
  });
});

describe('Firefox build', () => {
  let ff;
  const readFf = (file) => fs.readFileSync(path.join(ff, file), 'utf8');
  const manifestFf = () => JSON.parse(readFf('manifest.json'));

  beforeAll(() => {
    ff = fs.mkdtempSync(path.join(os.tmpdir(), 'draob-firefox-'));
    execFileSync(
      process.execPath,
      [path.join(root, 'scripts', 'build.mjs'), '--browser', 'firefox', '--outdir', ff],
      { stdio: 'pipe' },
    );
  });

  afterAll(() => fs.rmSync(ff, { recursive: true, force: true }));

  it('runs the background as an event page and has no Chrome-only keys', () => {
    const manifest = manifestFf();
    expect(manifest.background).toEqual({ scripts: ['background.bundle.js'] });
    for (const key of ['key', 'minimum_chrome_version', 'options_page']) {
      expect([key, manifest[key]]).toEqual([key, undefined]);
    }
  });

  it('declares a fixed add-on ID, a minimum version and that no data is collected', () => {
    const { gecko } = manifestFf().browser_specific_settings;
    expect(gecko.id).toBe('draob@engelrico.de');
    expect(parseInt(gecko.strict_min_version, 10)).toBeGreaterThanOrEqual(140);
    expect(gecko.data_collection_permissions).toEqual({ required: ['none'] });
  });

  it('opens the management page in a tab and keeps everything else from public/manifest.json', () => {
    const manifest = manifestFf();
    expect(manifest.options_ui).toEqual({ page: 'options.html', open_in_tab: true });
    const base = JSON.parse(fs.readFileSync(path.join(root, 'public/manifest.json'), 'utf8'));
    for (const key of ['version', 'permissions', 'action', 'icons', 'content_scripts']) {
      expect([key, manifest[key]]).toEqual([key, base[key]]);
    }
    expect(manifest.content_security_policy).toEqual(base.content_security_policy);
  });

  it('contains every file the manifest points to', () => {
    const manifest = manifestFf();
    const files = [
      ...manifest.background.scripts,
      manifest.action.default_popup,
      manifest.options_ui.page,
      ...Object.values(manifest.action.default_icon),
      ...Object.values(manifest.icons),
      ...manifest.content_scripts.flatMap((c) => c.js),
    ];
    for (const file of files) {
      expect([file, fs.existsSync(path.join(ff, file))]).toEqual([file, true]);
    }
  });

  it('bundles without eval or new Function (strict extension CSP)', () => {
    for (const bundle of fs.readdirSync(ff).filter((f) => f.endsWith('.bundle.js'))) {
      expect([bundle, /\beval\(|new Function\(/.test(readFf(bundle))]).toEqual([bundle, false]);
    }
  });

  it('rejects an unknown browser', () => {
    expect(() =>
      execFileSync(
        process.execPath,
        [path.join(root, 'scripts', 'build.mjs'), '--browser', 'safari'],
        {
          stdio: 'pipe',
        },
      ),
    ).toThrow();
  });
});
