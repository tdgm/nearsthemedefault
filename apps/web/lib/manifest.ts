import { loadNearsConfig, loadRoutesManifest, type ManifestRoute, type NearsConfig } from '@nears/manifests';
import { nearsDir } from './repo';

export type { ManifestRoute, NearsConfig };

/** Config raiz, validada por Zod (@nears/manifests). Sync de proposito: roda so no servidor, em build/prerender. */
export function loadConfig(): NearsConfig {
  return loadNearsConfig(nearsDir);
}

export function loadRoutes(): ManifestRoute[] {
  return loadRoutesManifest(nearsDir).routes;
}

/**
 * Le uma chave do vocabulary. Falha alto se faltar: texto de interface
 * ausente nao pode virar string vazia em producao sem ninguem perceber.
 */
export function vocab(key: string): string {
  const value = loadConfig().vocabulary[key];
  if (typeof value !== 'string' || value === '') {
    throw new Error(`nears.config.yaml > vocabulary.${key} nao definido`);
  }
  return value;
}
