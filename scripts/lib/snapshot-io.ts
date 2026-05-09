// Read / write the snapshot JSON, plus stabilising the timestamp so re-runs
// against unchanged upstream data produce zero file diffs.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { Snapshot } from './types.js';

export async function readPrevSnapshot(path: string): Promise<Snapshot | null> {
  try {
    return JSON.parse(await readFile(path, 'utf8')) as Snapshot;
  } catch {
    return null;
  }
}

// Preserve the previous generatedAt iff every other field is identical, so
// re-runs without real changes don't trigger a Pages rebuild.
export async function stabiliseTimestamp(
  path: string,
  next: Snapshot,
): Promise<Snapshot> {
  const prev = await readPrevSnapshot(path);
  if (!prev) return next;
  const { generatedAt: _a, ...prevCore } = prev;
  const { generatedAt: _b, ...nextCore } = next;
  if (JSON.stringify(prevCore) === JSON.stringify(nextCore)) {
    return { ...next, generatedAt: prev.generatedAt };
  }
  return next;
}

export async function writeSnapshotFile(path: string, snapshot: Snapshot): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(snapshot, null, 2) + '\n', 'utf8');
}
