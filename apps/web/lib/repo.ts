import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

/**
 * Raiz do monorepo: sobe a partir do cwd ate achar nears/nears.config.yaml. O
 * Next roda com cwd = apps/web (dev, build e start) e o Vitest com cwd = raiz;
 * procurar o arquivo evita depender de qual dos dois e.
 */
function findRepoRoot(from: string): string {
  for (let dir = from; ; dir = dirname(dir)) {
    if (existsSync(resolve(dir, 'nears/nears.config.yaml'))) return dir;
    if (dirname(dir) === dir) throw new Error(`nears/nears.config.yaml nao encontrado a partir de ${from}`);
  }
}

export const repoRoot = findRepoRoot(process.cwd());

export const nearsDir = resolve(repoRoot, 'nears');
