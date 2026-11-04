// @vitest-environment node
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import YAML from 'yaml';
import { readFileSync } from 'node:fs';

const repoRoot = resolve(__dirname, '../../..');
const appDir = join(repoRoot, 'apps/web/app');

type Route = { id: string; appRoute: string | null };
const routes = (
  YAML.parse(readFileSync(join(repoRoot, 'nears/routes.manifest.yaml'), 'utf8')) as {
    routes: Route[];
  }
).routes;

function pageFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return pageFiles(p);
    return /^page\.(tsx|ts|jsx|js)$/.test(name) ? [p] : [];
  });
}

describe('routes.manifest.yaml x apps/web/app', () => {
  const declared = [...new Set(routes.map((r) => r.appRoute).filter((r): r is string => !!r))];

  it.each(declared)('appRoute %s tem page.tsx no caminho exato', (appRoute) => {
    const folder = join(appDir, appRoute.replace(/\/page$/, ''));
    const exists = ['page.tsx', 'page.ts'].some((f) => existsSync(join(folder, f)));
    expect(exists).toBe(true);
  });

  it('nao ha page.tsx orfa fora do manifest', () => {
    const declaredFolders = new Set(declared.map((r) => r.replace(/\/page$/, '') || '/'));
    const found = pageFiles(appDir).map((f) => {
      const rel = '/' + relative(appDir, join(f, '..')).split('\\').join('/');
      return rel === '/.' ? '/' : rel;
    });
    const orphans = found.filter((f) => !declaredFolders.has(f === '/' ? '/' : f));
    expect(orphans).toEqual([]);
  });

  it('not-found.tsx existe (rota 404 e arquivo especial do Next)', () => {
    expect(existsSync(join(appDir, 'not-found.tsx'))).toBe(true);
  });
});
