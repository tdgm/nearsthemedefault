import { mkdtempSync, writeFileSync, readFileSync, cpSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import { describe, expect, it } from 'vitest';
import {
  loadNearsConfig,
  loadRoutesManifest,
  loadSectionsRegistry,
  loadContracts,
  loadAllManifests,
  ManifestValidationError,
} from './loader';

const nearsDir = fileURLToPath(new URL('../../../nears', import.meta.url));

/** Copia os 4 manifests reais para um dir temporario, pra testar variacoes sem tocar nos arquivos de verdade. */
function tempNearsDir(): string {
  const dir = mkdtempSync(join(tmpdir(), 'nears-manifests-test-'));
  cpSync(nearsDir, dir, { recursive: true });
  return dir;
}

describe('loaders contra os manifests reais (preset generic)', () => {
  it('carrega e valida nears.config.yaml', () => {
    const config = loadNearsConfig(nearsDir);
    expect(config.platform).toBe('nears');
    expect(config.catalog.vertical).toBe('generic');
  });

  it('carrega e valida routes.manifest.yaml', () => {
    const routes = loadRoutesManifest(nearsDir);
    expect(routes.routes.length).toBeGreaterThan(0);
    expect(routes.routes.find((r) => r.id === 'home')).toBeDefined();
  });

  it('carrega e valida sections.registry.yaml', () => {
    const registry = loadSectionsRegistry(nearsDir);
    expect(registry.sections.length).toBeGreaterThan(0);
    expect(registry.templates.home).toBeDefined();
  });

  it('carrega e valida contracts.yaml', () => {
    const contracts = loadContracts(nearsDir);
    expect(contracts.data.product.required).toContain('sku');
  });

  it('loadAllManifests carrega os 4 de uma vez', () => {
    const all = loadAllManifests(nearsDir);
    expect(all.nearsConfig).toBeDefined();
    expect(all.routesManifest).toBeDefined();
    expect(all.sectionsRegistry).toBeDefined();
    expect(all.contracts).toBeDefined();
  });
});

describe('loaders rejeitam manifests invalidos', () => {
  it('lanca ManifestValidationError quando um campo obrigatorio falta', () => {
    const dir = tempNearsDir();
    const raw = readFileSync(join(dir, 'nears.config.yaml'), 'utf8');
    // remove a linha "platform: nears" inteira - campo obrigatorio do schema.
    writeFileSync(join(dir, 'nears.config.yaml'), raw.replace(/^platform: nears\n/, ''));

    expect(() => loadNearsConfig(dir)).toThrow(ManifestValidationError);
  });

  it('lanca erro quando o YAML nem parseia', () => {
    const dir = tempNearsDir();
    writeFileSync(join(dir, 'contracts.yaml'), 'isso: [nao fecha a lista');
    expect(() => loadContracts(dir)).toThrow();
  });

  it('rejeita uma section sem cwv (campo obrigatorio pela regra everySectionMustDeclare)', () => {
    const dir = tempNearsDir();
    const raw = readFileSync(join(dir, 'sections.registry.yaml'), 'utf8');
    const parsed = parseYaml(raw) as { sections: Array<Record<string, unknown>> };
    delete parsed.sections[0].cwv;
    writeFileSync(join(dir, 'sections.registry.yaml'), stringifyYaml(parsed));

    expect(() => loadSectionsRegistry(dir)).toThrow(ManifestValidationError);
  });
});
