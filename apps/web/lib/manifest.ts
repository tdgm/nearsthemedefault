import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import YAML from 'yaml';
import { nearsDir } from './repo';

export type ManifestRoute = {
  id: string;
  pattern: string;
  template: string;
  appRoute: string | null;
  jsBudgetCritical?: boolean;
};

export type NearsConfig = {
  platform: string;
  template: string;
  version: string;
  locale: { default: string; supported: string[] };
};

function readYaml<T>(file: string): T {
  return YAML.parse(readFileSync(resolve(nearsDir, file), 'utf8')) as T;
}

/** Config raiz. Sync de proposito: roda so no servidor, em build/prerender. */
export function loadConfig(): NearsConfig {
  return readYaml<NearsConfig>('nears.config.yaml');
}

export function loadRoutes(): ManifestRoute[] {
  return readYaml<{ routes: ManifestRoute[] }>('routes.manifest.yaml').routes;
}
