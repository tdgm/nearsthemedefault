import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { z } from 'zod';
import { nearsConfigSchema, type NearsConfig } from './schemas/nears-config';
import { routesManifestSchema, type RoutesManifest } from './schemas/routes-manifest';
import { sectionsRegistrySchema, type SectionsRegistry } from './schemas/sections-registry';
import { contractsSchema, type Contracts } from './schemas/contracts';

/** Forma minima de um issue do Zod, estavel entre v3 e v4. */
type Issue = { path: ReadonlyArray<string | number>; message: string };

export class ManifestValidationError extends Error {
  constructor(
    public readonly file: string,
    public readonly issues: readonly Issue[],
  ) {
    const lines = issues.map((issue) => {
      const path = issue.path.length ? issue.path.join('.') : '(raiz)';
      return `  - ${path}: ${issue.message}`;
    });
    super(`${file}: schema invalido\n${lines.join('\n')}`);
    this.name = 'ManifestValidationError';
  }
}

function readYaml(nearsDir: string, file: string): unknown {
  const raw = readFileSync(resolve(nearsDir, file), 'utf8');
  return parseYaml(raw);
}

function parseWith<Schema extends z.ZodType>(file: string, schema: Schema, data: unknown): z.infer<Schema> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ManifestValidationError(file, result.error.issues);
  }
  return result.data;
}

/** Valida e tipa nears.config.yaml. */
export function loadNearsConfig(nearsDir: string): NearsConfig {
  return parseWith('nears.config.yaml', nearsConfigSchema, readYaml(nearsDir, 'nears.config.yaml'));
}

/** Valida e tipa routes.manifest.yaml. */
export function loadRoutesManifest(nearsDir: string): RoutesManifest {
  return parseWith('routes.manifest.yaml', routesManifestSchema, readYaml(nearsDir, 'routes.manifest.yaml'));
}

/** Valida e tipa sections.registry.yaml. */
export function loadSectionsRegistry(nearsDir: string): SectionsRegistry {
  return parseWith('sections.registry.yaml', sectionsRegistrySchema, readYaml(nearsDir, 'sections.registry.yaml'));
}

/** Valida e tipa contracts.yaml. */
export function loadContracts(nearsDir: string): Contracts {
  return parseWith('contracts.yaml', contractsSchema, readYaml(nearsDir, 'contracts.yaml'));
}

export type AllManifests = {
  nearsConfig: NearsConfig;
  routesManifest: RoutesManifest;
  sectionsRegistry: SectionsRegistry;
  contracts: Contracts;
};

/** Carrega e valida os 4 manifests de uma vez. Lanca no primeiro invalido. */
export function loadAllManifests(nearsDir: string): AllManifests {
  return {
    nearsConfig: loadNearsConfig(nearsDir),
    routesManifest: loadRoutesManifest(nearsDir),
    sectionsRegistry: loadSectionsRegistry(nearsDir),
    contracts: loadContracts(nearsDir),
  };
}
