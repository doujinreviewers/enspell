import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contentDirectory = path.join(repositoryRoot, 'src', 'content');
const publicDirectory = path.join(repositoryRoot, 'src', 'public');

test('コンテンツスクリプトが参照する公開リソースがすべて存在する', async () => {
  const filenames = (await readdir(contentDirectory)).filter((filename) => filename.endsWith('.js'));
  const missingResources = [];

  for (const filename of filenames) {
    const source = await readFile(path.join(contentDirectory, filename), 'utf8');
    const resourcePattern = /chrome\.runtime\.getURL\(['"]([^'"]+)['"]\)/g;

    for (const match of source.matchAll(resourcePattern)) {
      const resourcePath = match[1];
      try {
        await access(path.join(publicDirectory, resourcePath));
      } catch {
        missingResources.push(`${filename}: ${resourcePath}`);
      }
    }
  }

  assert.deepEqual(missingResources, []);
});
