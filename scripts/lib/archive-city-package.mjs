import { copyFile, mkdir, rm, stat, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const OPTIONAL_CITY_FILES = [
  (cityId) => `src/data/generated/${cityId}-snapshot.json`,
  (cityId) => `src/data/${cityId}-english-copy.ts`,
  (cityId) => `src/data/${cityId}-overrides.ts`,
  (cityId) => `src/data/cities/${cityId}/index.ts`,
  (cityId) => `scripts/city-configs/${cityId}.mjs`,
];

async function pathExists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function copyIntoArchive(rootDir, archiveDir, relativeFile) {
  const sourcePath = resolve(rootDir, relativeFile);
  const targetPath = resolve(archiveDir, relativeFile);

  await mkdir(dirname(targetPath), { recursive: true });
  await copyFile(sourcePath, targetPath);
}

function tryZipArchive(latestDir, zipPath) {
  if (process.platform !== "win32") {
    return null;
  }

  const command = [
    "-NoProfile",
    "-Command",
    `Compress-Archive -Path '${latestDir}\\*' -DestinationPath '${zipPath}' -Force`,
  ];
  const result = spawnSync("powershell", command, {
    cwd: latestDir,
    stdio: "pipe",
    encoding: "utf8",
  });

  if (result.status !== 0) {
    return null;
  }

  return zipPath;
}

export async function archiveCityPackage(cityId, cwd = process.cwd()) {
  const rootDir = resolve(cwd);
  const cityCacheDir = resolve(rootDir, ".city-cache", cityId);
  const latestDir = resolve(cityCacheDir, "latest");
  const zipPath = resolve(cityCacheDir, `${cityId}-package.zip`);
  const includedFiles = [];

  await rm(latestDir, { recursive: true, force: true });
  await mkdir(latestDir, { recursive: true });

  for (const candidate of OPTIONAL_CITY_FILES) {
    const relativeFile = candidate(cityId);
    const absoluteFile = resolve(rootDir, relativeFile);

    if (!(await pathExists(absoluteFile))) {
      continue;
    }

    includedFiles.push(relativeFile);
    await copyIntoArchive(rootDir, latestDir, relativeFile);
  }

  if (!includedFiles.some((file) => file.endsWith(`${cityId}-snapshot.json`))) {
    throw new Error(`Cannot archive ${cityId}: snapshot file is missing.`);
  }

  const manifest = {
    cityId,
    archivedAt: new Date().toISOString(),
    files: includedFiles,
    latestDirectory: `.city-cache/${cityId}/latest`,
    zipArchive: `.city-cache/${cityId}/${cityId}-package.zip`,
  };

  await writeFile(
    resolve(latestDir, "manifest.json"),
    JSON.stringify(manifest, null, 2) + "\n",
  );

  return {
    latestDir,
    zipPath: tryZipArchive(latestDir, zipPath),
    files: includedFiles,
  };
}
