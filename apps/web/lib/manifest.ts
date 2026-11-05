import { resolve } from 'node:path';
import { loadManifests } from '@nears/manifests/node';
import type { Manifests, NearsConfig, Route } from '@nears/manifests';
import type { VocabularyKey } from '@nears/manifests/types';
import { nearsDir, repoRoot } from './repo';

export type ManifestRoute = Route;
export type { NearsConfig, VocabularyKey };

let cached: Manifests | undefined;

/**
 * Preset de nicho (nears/presets/*.yaml) escolhido por variavel de ambiente
 * server-only (nunca NEXT_PUBLIC_*). Serve para rodar o mesmo build de teste em
 * mais de um nicho (E2E da Fase 8, ADR 0024). Vazio = catalogo do
 * nears.config.yaml. So aceita o formato de nome de arquivo de preset: a
 * variavel vira caminho de leitura, entao nada de `..` ou `/`.
 */
export function selectedPreset(env: NodeJS.ProcessEnv = process.env): string | undefined {
  const name = env.NEARS_PRESET?.trim();
  if (!name) return undefined;
  if (!/^[a-z][a-z0-9-]*$/.test(name)) throw new Error(`NEARS_PRESET invalido: "${name}"`);
  return name;
}

/**
 * Manifests validados (schemas Zod + referencias cruzadas). Sync de proposito:
 * roda so no servidor, em build/prerender. Em producao le uma vez por processo;
 * em dev le a cada chamada para refletir edicoes nos YAML.
 */
export function loadAllManifests(): Manifests {
  if (cached && process.env.NODE_ENV === 'production') return cached;
  const preset = selectedPreset();
  cached = loadManifests({ nearsDir, tokensFile: resolve(repoRoot, 'packages/tokens/tokens.json'), ...(preset ? { preset } : {}) });
  return cached;
}

export function loadConfig(): NearsConfig {
  return loadAllManifests().config;
}

export function loadRoutes(): ManifestRoute[] {
  return loadAllManifests().routes.routes;
}

/**
 * Le uma chave do vocabulary. A chave e tipada (gerada do nears.config.yaml);
 * falha alto se faltar valor: texto de interface ausente nao pode virar string
 * vazia em producao sem ninguem perceber.
 */
export function vocab(key: VocabularyKey): string {
  const value = loadConfig().vocabulary[key];
  if (typeof value !== 'string' || value === '') {
    throw new Error(`nears.config.yaml > vocabulary.${key} nao definido`);
  }
  return value;
}
