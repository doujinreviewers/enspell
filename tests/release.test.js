import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('リリース対象のバージョンが各設定ファイルで一致する', async () => {
  const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
  const packageLock = JSON.parse(await readFile(new URL('../package-lock.json', import.meta.url), 'utf8'));
  const manifest = JSON.parse(await readFile(new URL('../src/public/manifest.json', import.meta.url), 'utf8'));

  assert.equal(packageLock.version, packageJson.version);
  assert.equal(packageLock.packages[''].version, packageJson.version);
  assert.equal(manifest.version, packageJson.version);
  assert.match(packageJson.version, /^\d+(?:\.\d+){0,3}$/);
});
