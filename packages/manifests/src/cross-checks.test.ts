import { mkdtempSync, writeFileSync, readFileSync, cpSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import { describe, expect, it } from 'vitest';
import { loadAllManifests } from './loader';
import { runCrossChecks } from './cross-checks';

const nearsDir = fileURLToPath(new URL('../../../nears', import.meta.url));

function tempNearsDir(): string {
  const dir = mkdtempSync(join(tmpdir(), 'nears-cross-checks-test-'));
  cpSync(nearsDir, dir, { recursive: true });
  return dir;
}

describe('runCrossChecks contra os manifests reais', () => {
  it('nao acusa nenhum erro (preset generic, como esta commitado)', () => {
    const errors = runCrossChecks(loadAllManifests(nearsDir));
    expect(errors).toEqual([]);
  });
});

describe('runCrossChecks pega referencias e invariantes quebradas', () => {
  it('pega enabledBy apontando pra um caminho inexistente em nears.config.yaml', () => {
    const dir = tempNearsDir();
    const raw = readFileSync(join(dir, 'routes.manifest.yaml'), 'utf8');
    const parsed = parseYaml(raw) as { routes: Array<Record<string, unknown>> };
    const route = parsed.routes.find((r) => r.id === 'category-flat')!;
    route.enabledBy = 'catalog.campoQueNaoExiste.enabled';
    writeFileSync(join(dir, 'routes.manifest.yaml'), stringifyYaml(parsed));

    const errors = runCrossChecks(loadAllManifests(dir));
    expect(errors.some((e) => e.includes('catalog.campoQueNaoExiste.enabled'))).toBe(true);
  });

  it('pega id de rota duplicado', () => {
    const dir = tempNearsDir();
    const raw = readFileSync(join(dir, 'routes.manifest.yaml'), 'utf8');
    const parsed = parseYaml(raw) as { routes: Array<Record<string, unknown>> };
    parsed.routes.push({ ...parsed.routes[0] });
    writeFileSync(join(dir, 'routes.manifest.yaml'), stringifyYaml(parsed));

    const errors = runCrossChecks(loadAllManifests(dir));
    expect(errors.some((e) => e.includes('duplicados'))).toBe(true);
  });

  it('pega section priority:inherit usada direto num template', () => {
    const dir = tempNearsDir();
    const raw = readFileSync(join(dir, 'sections.registry.yaml'), 'utf8');
    const parsed = parseYaml(raw) as { templates: Record<string, { sections: unknown[] }> };
    // product-card tem priority inherit; colocar direto na lista do template e invalido.
    parsed.templates.home.sections.push('product-card');
    writeFileSync(join(dir, 'sections.registry.yaml'), stringifyYaml(parsed));

    const errors = runCrossChecks(loadAllManifests(dir));
    expect(errors.some((e) => e.includes('inherit'))).toBe(true);
  });
});
