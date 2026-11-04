// Parte Node do pacote: le os YAML do disco. Importe daqui apenas em codigo de
// servidor ou scripts; o client nunca deve puxar este arquivo (fs + yaml + zod).
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import YAML from 'yaml';
import { ManifestError, type Issue, type Manifests, type TokensMedia } from './manifests.ts';
import { validateCross } from './refs.ts';
import { configSchema, presetSchema, type Preset } from './schemas/config.ts';
import { contractsSchema } from './schemas/contracts.ts';
import { routesSchema } from './schemas/routes.ts';
import { sectionsRegistrySchema } from './schemas/sections.ts';
import type { z } from 'zod';

export type LoadOptions = {
  /** Pasta /nears. */
  nearsDir: string;
  /** Caminho do tokens.json (para conferir `media.aspect`). */
  tokensFile: string;
  /** Nome de um preset em nears/presets (sem .yaml). Omitido = catalogo do nears.config.yaml. */
  preset?: string;
};

const readYaml = (file: string): unknown => YAML.parse(readFileSync(file, 'utf8'));

function parse<S extends z.ZodType>(schema: S, data: unknown, file: string, issues: Issue[]): z.output<S> | undefined {
  const r = schema.safeParse(data);
  if (r.success) return r.data;
  for (const i of r.error.issues) issues.push({ file, path: i.path.join('.'), message: i.message });
  return undefined;
}

export function listPresets(nearsDir: string): string[] {
  const dir = join(nearsDir, 'presets');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.yaml'))
    .map((f) => f.replace(/\.yaml$/, ''))
    .sort();
}

/**
 * Carrega, valida (schemas + referencias cruzadas) e devolve os 4 manifests.
 * Lanca ManifestError com TODAS as falhas de uma vez.
 */
export function loadManifests(opts: LoadOptions): Manifests {
  const issues: Issue[] = [];
  const rawConfig = readYaml(join(opts.nearsDir, 'nears.config.yaml')) as Record<string, unknown>;

  if (opts.preset) {
    const file = `presets/${opts.preset}.yaml`;
    const preset = parse(presetSchema, readYaml(join(opts.nearsDir, file)), file, issues) as Preset | undefined;
    if (preset) {
      rawConfig.catalog = preset.catalog;
      rawConfig.vocabulary = { ...(rawConfig.vocabulary as object), ...preset.vocabulary };
    }
  }

  const config = parse(configSchema, rawConfig, 'nears.config.yaml', issues);
  const routes = parse(routesSchema, readYaml(join(opts.nearsDir, 'routes.manifest.yaml')), 'routes.manifest.yaml', issues);
  const sections = parse(
    sectionsRegistrySchema,
    readYaml(join(opts.nearsDir, 'sections.registry.yaml')),
    'sections.registry.yaml',
    issues,
  );
  const contracts = parse(contractsSchema, readYaml(join(opts.nearsDir, 'contracts.yaml')), 'contracts.yaml', issues);

  // Sem os 4 parseados nao ha como cruzar: devolve o que ja falhou.
  if (!config || !routes || !sections || !contracts) throw new ManifestError(issues);

  const tokens = JSON.parse(readFileSync(opts.tokensFile, 'utf8')) as { media?: Partial<TokensMedia> };
  const media: TokensMedia = { aspect: tokens.media?.aspect ?? {}, sizes: tokens.media?.sizes ?? {} };

  const manifests: Manifests = { config, routes, sections, contracts };
  issues.push(...validateCross(manifests, media));
  if (issues.length) throw new ManifestError(issues);
  return manifests;
}
