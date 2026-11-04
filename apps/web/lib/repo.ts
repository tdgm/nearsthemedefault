import { resolve } from 'node:path';

/** Raiz do monorepo. O Next roda com cwd = apps/web (dev, build e start). */
export const repoRoot = resolve(process.cwd(), '../..');

export const nearsDir = resolve(repoRoot, 'nears');
