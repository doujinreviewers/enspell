import { createHash } from 'node:crypto';
import { cp, mkdir, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import zip from 'bestzip';

export const createReleaseArchive = async ({ repositoryRoot } = {}) => {
  const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
  const root = path.resolve(repositoryRoot || path.join(scriptDirectory, '..'));
  const packageJson = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
  const manifest = JSON.parse(await readFile(path.join(root, 'dist', 'manifest.json'), 'utf8'));

  if (packageJson.version !== manifest.version) {
    throw new Error(`package.json (${packageJson.version}) とmanifest.json (${manifest.version}) のバージョンが一致しません。`);
  }

  const artifactsDirectory = path.join(root, 'artifacts');
  const archiveName = `enspell-v${packageJson.version}.zip`;
  const archivePath = path.join(artifactsDirectory, archiveName);

  await mkdir(artifactsDirectory, { recursive: true });
  const stagingDirectory = await mkdtemp(path.join(artifactsDirectory, '.release-'));
  try {
    await cp(path.join(root, 'dist'), path.join(stagingDirectory, 'enspell'), { recursive: true });
    const stagedArchive = path.join(stagingDirectory, archiveName);
    await zip({ source: 'enspell', destination: stagedArchive, cwd: stagingDirectory });

    const archive = await readFile(stagedArchive);
    const checksum = createHash('sha256').update(archive).digest('hex');
    await rename(stagedArchive, archivePath);
    await writeFile(`${archivePath}.sha256`, `${checksum}  ${archiveName}\n`, 'utf8');
    return { archivePath, checksum };
  } finally {
    // 今回作成したartifacts直下の一時ディレクトリ以外は削除しない。
    if (path.dirname(stagingDirectory) !== artifactsDirectory || !path.basename(stagingDirectory).startsWith('.release-')) {
      throw new Error('一時ディレクトリの削除対象が不正です。');
    }
    await rm(stagingDirectory, { recursive: true, force: true });
  }
};

const invokedUrl = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : '';
if (import.meta.url === invokedUrl) {
  const result = await createReleaseArchive();
  console.log(`作成: ${result.archivePath}`);
  console.log(`SHA-256: ${result.checksum}`);
}
