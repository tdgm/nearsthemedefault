import type { NearsConfig } from './schemas/config.ts';
import type { Contracts } from './schemas/contracts.ts';
import type { RoutesManifest } from './schemas/routes.ts';
import type { SectionsRegistry } from './schemas/sections.ts';

/** Os 4 manifests ja validados pelos schemas, com o catalogo do nicho aplicado. */
export type Manifests = {
  config: NearsConfig;
  routes: RoutesManifest;
  sections: SectionsRegistry;
  contracts: Contracts;
};

/** Trecho de tokens.json que os manifests referenciam (`media.aspect[...]`). */
export type TokensMedia = { aspect: Record<string, unknown>; sizes: Record<string, unknown> };

export type Issue = { file: string; path: string; message: string };

export class ManifestError extends Error {
  readonly issues: Issue[];
  constructor(issues: Issue[]) {
    super(`Manifests invalidos (${issues.length}):\n${issues.map(formatIssue).join('\n')}`);
    this.name = 'ManifestError';
    this.issues = issues;
  }
}

export const formatIssue = (i: Issue) => `  - ${i.file}${i.path ? ` > ${i.path}` : ''}: ${i.message}`;
