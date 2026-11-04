// Registry de sections: cruza o que o codigo exporta com o que o manifest
// declara e FALHA O BUILD se algo faltar (scripts/manifests-validate.mjs).
import type { Manifests } from '@nears/manifests';
import type { AnySectionSpec } from './define.ts';

export type RegistryIssue = { section: string; message: string };

export class RegistryError extends Error {
  readonly issues: RegistryIssue[];
  constructor(issues: RegistryIssue[]) {
    super(`Registry de sections invalido (${issues.length}):\n${issues.map((i) => `  - ${i.section}: ${i.message}`).join('\n')}`);
    this.name = 'RegistryError';
    this.issues = issues;
  }
}

export type SectionRegistry = ReadonlyMap<string, AnySectionSpec>;

const nonEmpty = (v: unknown) => typeof v === 'object' && v !== null && Object.keys(v).length > 0;

/**
 * Valida as sections implementadas contra o manifest e devolve o registry.
 * Recebe as SPECS (parte pura, carregavel em Node); que cada spec tem componente
 * e conferido por `modules.test.ts`, que carrega os modulos completos.
 * `storyExists` e injetado (fs no build, fake nos testes).
 */
export function createRegistry(
  manifests: Pick<Manifests, 'sections'>,
  modules: readonly AnySectionSpec[],
  storyExists: (path: string) => boolean,
): SectionRegistry {
  const declared = new Map(
    [...manifests.sections.sections, ...manifests.sections.pdpSections, ...manifests.sections.globals].map((s) => [s.id, s]),
  );
  const issues: RegistryIssue[] = [];
  const registry = new Map<string, AnySectionSpec>();

  for (const mod of modules) {
    const id = mod.id;
    const add = (message: string) => issues.push({ section: id || '(sem id)', message });
    if (!id) {
      add('section sem id');
      continue;
    }
    if (registry.has(id)) add('registrada duas vezes');
    const spec = declared.get(id);
    if (!spec) add('nao existe em sections.registry.yaml');
    if (!mod.schema || typeof mod.schema.safeParse !== 'function') add('nao exporta `schema` (Zod)');
    if (!mod.meta) add('nao exporta `meta`');
    else {
      if (!mod.meta.priority) add('meta.priority ausente');
      else if (spec && mod.meta.priority !== spec.priority) {
        add(`meta.priority "${mod.meta.priority}" diverge do manifest ("${spec.priority}")`);
      }
      if (!nonEmpty(mod.meta.cwv)) add('meta.cwv ausente ou vazio');
      if (!nonEmpty(mod.meta.a11y)) add('meta.a11y ausente ou vazio');
    }
    if (!mod.story) add('nao declara a story');
    else if (!storyExists(mod.story)) add(`story nao encontrada: ${mod.story}`);
    registry.set(id, mod);
  }

  if (issues.length) throw new RegistryError(issues);
  return registry;
}

/** Sections do manifest que ainda nao tem implementacao (informativo ate a Fase 5). */
export const pendingSections = (manifests: Pick<Manifests, 'sections'>, registry: SectionRegistry): string[] =>
  [...manifests.sections.sections, ...manifests.sections.pdpSections]
    .map((s) => s.id)
    .filter((id) => !registry.has(id));
