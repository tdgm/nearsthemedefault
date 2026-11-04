import { mkdtempSync, writeFileSync, readFileSync, cpSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import { describe, expect, it } from 'vitest';
import { loadAllManifests } from './loader';
import { runCrossChecks } from './cross-checks';

/**
 * Gate da Fase 2 (docs/ROADMAP.md): "gera os tipos para o preset generic e
 * para pelo menos dois presets de docs/adr/0002-template-multinicho.md".
 * Os presets abaixo sao os blocos `catalog`/`vocabulary` copiados verbatim
 * do ADR 0002 - cada um e um override PARCIAL (o resto do catalog/vocabulary
 * continua vindo do preset generic, como o proprio ADR instrui: "copie o
 * bloco... e ajuste").
 */

const nearsDir = fileURLToPath(new URL('../../../nears', import.meta.url));

type Preset = { catalog: Record<string, unknown>; vocabulary?: Record<string, string> };

const presets: Record<string, Preset> = {
  fashion: {
    catalog: {
      vertical: 'fashion',
      productMedia: { aspect: 'portrait', hoverImage: true },
      variantAxes: [
        { id: 'color', label: 'Cor', display: 'swatch', schemaOrg: 'color' },
        { id: 'size', label: 'Tamanho', display: 'option', schemaOrg: 'size' },
      ],
      facets: { available: ['category', 'size', 'color', 'price', 'brand'], indexable: ['category', 'color'] },
      geoAttributes: ['color', 'size', 'material', 'audience'],
      guide: { enabled: true, label: 'Guia de medidas' },
      flatAxis: { enabled: true, secondLevelAttribute: 'fit' },
    },
    vocabulary: { cart: 'Sacola', bundle: 'Complete o look' },
  },
  electronics: {
    catalog: {
      vertical: 'electronics',
      productMedia: { aspect: 'product', hoverImage: false },
      variantAxes: [
        { id: 'color', label: 'Cor', display: 'swatch', schemaOrg: 'color' },
        { id: 'voltage', label: 'Voltagem', display: 'option' },
        { id: 'storage', label: 'Armazenamento', display: 'option' },
      ],
      facets: { available: ['category', 'brand', 'price', 'voltage', 'storage'], indexable: ['category', 'brand'] },
      geoAttributes: ['model', 'mpn', 'weight'],
      guide: { enabled: true, label: 'Compatibilidade' },
      flatAxis: { enabled: true, secondLevelAttribute: null },
    },
    vocabulary: { bundle: 'Compre junto' },
  },
  grocery: {
    catalog: {
      vertical: 'grocery',
      productMedia: { aspect: 'product', hoverImage: false },
      variantAxes: [{ id: 'weight', label: 'Peso', display: 'option', schemaOrg: 'weight' }],
      facets: { available: ['category', 'brand', 'price', 'dietary'], indexable: ['category', 'brand'] },
      geoAttributes: ['brand', 'weight'],
      guide: { enabled: true, label: 'Tabela nutricional' },
      flatAxis: { enabled: false, secondLevelAttribute: null },
    },
    vocabulary: { cart: 'Cesta', bundle: 'Leve também' },
  },
};

function tempNearsDirWithPreset(preset: Preset): string {
  const dir = mkdtempSync(join(tmpdir(), 'nears-preset-test-'));
  cpSync(nearsDir, dir, { recursive: true });

  const configPath = join(dir, 'nears.config.yaml');
  const config = parseYaml(readFileSync(configPath, 'utf8')) as {
    catalog: Record<string, unknown>;
    vocabulary: Record<string, string>;
  };
  config.catalog = { ...config.catalog, ...preset.catalog };
  config.vocabulary = { ...config.vocabulary, ...(preset.vocabulary ?? {}) };
  writeFileSync(configPath, stringifyYaml(config));

  return dir;
}

describe.each(Object.entries(presets))('preset %s (docs/adr/0002)', (name, preset) => {
  it(`valida com Zod e passa nos cross-checks`, () => {
    const dir = tempNearsDirWithPreset(preset);
    const manifests = loadAllManifests(dir);

    expect(manifests.nearsConfig.catalog.vertical).toBe(preset.catalog.vertical);

    const errors = runCrossChecks(manifests);
    expect(errors).toEqual([]);
  });
});
