import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import zip from 'bestzip';

export const createReleaseArchive = async ({ repositoryRoot } = {}) => {
  const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
  const root = repositoryRoot || path.resolve(scriptDirectory, '..');
  const packageJson = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
  const manifest = JSON.parse(await readFile(path.join(root, 'dist', 'manifest.json'), 'utf8'));

  if (packageJson.version !== manifest.version) {
    throw new Error(`package.json (${packageJson.version}) とmanifest.json (${manifest.version}) のバージョンが一致しません。`);
  }

  const artifactsDirectory = path.join(root, 'artifacts');
  const archiveName = `enspell-v${packageJson.version}.zip`;
  const archivePath = path.join(artifactsDirectory, archiveName);

  await mkdir(artifactsDirectory, { recursive: true });
  await rm(archivePath, { force: true });
  await zip({
    source: '*',
    destination: archivePath,
    cwd: path.join(root, 'dist'),
  });

  const archive = await readFile(archivePath);
  const checksum = createHash('sha256').update(archive).digest('hex');
  await writeFile(`${archivePath}.sha256`, `${checksum}  ${archiveName}\n`, 'utf8');

  return { archivePath, checksum };
};

const invokedUrl = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : '';
if (import.meta.url === invokedUrl) {
  const result = await createReleaseArchive();
  console.log(`作成: ${result.archivePath}`);
  console.log(`SHA-256: ${result.checksum}`);
}
