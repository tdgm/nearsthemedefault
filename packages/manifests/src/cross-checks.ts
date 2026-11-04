import type { NearsConfig } from './schemas/nears-config';
import type { RoutesManifest } from './schemas/routes-manifest';
import type { SectionsRegistry, TemplateSectionItem } from './schemas/sections-registry';
import type { AllManifests } from './loader';

/**
 * Checks que nao cabem num schema Zod porque cruzam mais de um manifest, ou
 * dependem de valores (nao so de forma): referencias `from:`/`enabledBy:` de
 * sections.registry.yaml e routes.manifest.yaml contra nears.config.yaml,
 * invariantes de routes.manifest.yaml (docs/adr/0003) e a regra
 * `priority: inherit` + `nestedOnlyIn` do section registry.
 */
export type CrossCheckError = string;

/** Le um caminho tipo "catalog.flatAxis.enabled" dentro de um objeto qualquer. */
function getPath(root: unknown, path: string): { found: boolean; value: unknown } {
  const parts = path.split('.');
  let cur: unknown = root;
  for (const part of parts) {
    if (cur === null || typeof cur !== 'object' || !(part in (cur as Record<string, unknown>))) {
      return { found: false, value: undefined };
    }
    cur = (cur as Record<string, unknown>)[part];
  }
  return { found: true, value: cur };
}

function checkRoutesInvariants(routes: RoutesManifest): CrossCheckError[] {
  const errors: CrossCheckError[] = [];

  const reserved = new Set(routes.resolution.reserved.firstSegment);
  const segmentsToCheck = [...routes.excluded.disallowSegments, ...routes.forbiddenInProduction.segments];
  for (const seg of segmentsToCheck) {
    if (!reserved.has(seg)) {
      errors.push(
        `routes.manifest.yaml: segmento "${seg}" (excluded/forbiddenInProduction) precisa estar em resolution.reserved.firstSegment`,
      );
    }
  }

  for (const seg of routes.excluded.disallowSegments) {
    if (seg.includes('*')) errors.push(`routes.manifest.yaml: disallowSegments nao aceita "*" (${seg})`);
  }
  for (const p of routes.excluded.disallowPrefixes) {
    if (!p.endsWith('/')) errors.push(`routes.manifest.yaml: disallowPrefixes deve terminar em "/" (${p})`);
  }

  const ids = routes.routes.map((r) => r.id);
  const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dup.length) {
    errors.push(`routes.manifest.yaml: ids de rota duplicados: ${[...new Set(dup)].join(', ')}`);
  }

  // Toda rota referenciada em resolution.slugIndex.sources / secondSegment precisa existir.
  const knownIds = new Set(ids);
  for (const source of routes.resolution.slugIndex.sources) {
    if (!knownIds.has(source.route)) {
      errors.push(`routes.manifest.yaml: resolution.slugIndex.sources referencia rota inexistente "${source.route}"`);
    }
  }
  for (const [firstSegmentRoute, secondSegmentRoute] of Object.entries(routes.resolution.secondSegment)) {
    if (!knownIds.has(firstSegmentRoute)) {
      errors.push(`routes.manifest.yaml: resolution.secondSegment chave "${firstSegmentRoute}" nao e uma rota conhecida`);
    }
    if (!knownIds.has(secondSegmentRoute)) {
      errors.push(`routes.manifest.yaml: resolution.secondSegment valor "${secondSegmentRoute}" nao e uma rota conhecida`);
    }
  }
  for (const route of routes.routes) {
    if (route.canonicalTo && !knownIds.has(route.canonicalTo)) {
      errors.push(`routes.manifest.yaml: rota "${route.id}" tem canonicalTo para rota inexistente "${route.canonicalTo}"`);
    }
  }

  return errors;
}

/** `enabledBy:`/`from:` de sections.registry.yaml e routes.manifest.yaml apontam pra dentro de nears.config.yaml. */
function checkManifestReferences(nearsConfig: NearsConfig, routes: RoutesManifest, sections: SectionsRegistry): CrossCheckError[] {
  const errors: CrossCheckError[] = [];

  for (const [templateId, template] of Object.entries(sections.templates)) {
    for (const item of template.sections) {
      if (typeof item === 'string') continue;
      const { limit } = item.repeat;
      if (limit && typeof limit === 'object' && 'from' in limit) {
        checkRef('sections.registry.yaml', `templates.${templateId}.sections[].repeat.limit.from`, limit.from);
      }
    }
  }

  function checkRef(file: string, where: string, path: string) {
    const { found } = getPath(nearsConfig, path);
    if (!found) {
      errors.push(`${file}: "${where}" referencia "${path}", que nao existe em nears.config.yaml`);
    }
  }

  for (const route of routes.routes) {
    // `enabledBy:` sempre aponta para dentro de nears.config.yaml. `params.*.from`
    // e' deliberadamente diferente: aponta para uma FONTE de dados em runtime
    // (ex.: "navigation.departments", resolvida pelo data layer, nao pelo
    // manifest de config) - por isso nao e validado aqui.
    if (route.enabledBy) checkRef('routes.manifest.yaml', `routes.${route.id}.enabledBy`, route.enabledBy);
  }

  const allSections = [...sections.globals, ...sections.sections, ...sections.pdpSections];
  for (const section of allSections) {
    for (const [key, value] of Object.entries(section.props ?? {})) {
      if (value && typeof value === 'object' && 'enabledBy' in value) {
        const enabledBy = (value as { enabledBy: unknown }).enabledBy;
        if (typeof enabledBy === 'string') {
          checkRef('sections.registry.yaml', `sections.${section.id}.props.${key}.enabledBy`, enabledBy);
        }
      }
      if (value && typeof value === 'object' && 'from' in value) {
        const from = (value as { from: unknown }).from;
        if (typeof from === 'string' && from.startsWith('catalog.')) {
          checkRef('sections.registry.yaml', `sections.${section.id}.props.${key}.from`, from);
        }
      }
    }
  }

  return errors;
}

function sectionIdsFromTemplateItem(item: TemplateSectionItem): string[] {
  if (typeof item === 'string') {
    // "showcase:tabs" -> id base "showcase"; o sufixo e uma variante, checada
    // contra section.variants em checkSectionRegistry.
    const [id] = item.split(':');
    return [id];
  }
  return item.repeat.blocks.flatMap((block) => {
    const [id] = block.split(':');
    return [id];
  });
}

function checkSectionRegistry(sections: SectionsRegistry): CrossCheckError[] {
  const errors: CrossCheckError[] = [];

  const globalIds = new Set(sections.globals.map((s) => s.id));
  const sectionIds = new Set(sections.sections.map((s) => s.id));
  const pdpSectionIds = new Set(sections.pdpSections.map((s) => s.id));
  const allIds = new Set([...globalIds, ...sectionIds, ...pdpSectionIds]);
  const priorityLevelIds = new Set(Object.keys(sections.priorityLevels));

  const byId = new Map(
    [...sections.globals, ...sections.sections, ...sections.pdpSections].map((s) => [s.id, s] as const),
  );

  // ids duplicados entre globals/sections/pdpSections.
  const seen = new Map<string, string>();
  for (const [bucketName, ids] of [
    ['globals', globalIds],
    ['sections', sectionIds],
    ['pdpSections', pdpSectionIds],
  ] as const) {
    for (const id of ids) {
      const prevBucket = seen.get(id);
      if (prevBucket) {
        errors.push(`sections.registry.yaml: id "${id}" aparece em "${prevBucket}" e em "${bucketName}"`);
      } else {
        seen.set(id, bucketName);
      }
    }
  }

  for (const section of byId.values()) {
    if (!priorityLevelIds.has(section.priority)) {
      errors.push(
        `sections.registry.yaml: section "${section.id}" tem priority "${section.priority}", que nao esta em priorityLevels`,
      );
    }
    // priority: inherit so faz sentido com nestedOnlyIn declarado, e todo
    // id listado ali precisa existir (ver comentario em priorityLevels.inherit).
    if (section.priority === 'inherit') {
      if (!section.nestedOnlyIn || section.nestedOnlyIn.length === 0) {
        errors.push(`sections.registry.yaml: section "${section.id}" tem priority inherit mas nao declara nestedOnlyIn`);
      } else {
        for (const containerId of section.nestedOnlyIn) {
          if (!allIds.has(containerId)) {
            errors.push(
              `sections.registry.yaml: section "${section.id}" tem nestedOnlyIn com id inexistente "${containerId}"`,
            );
          }
        }
      }
    }
  }

  // Toda section usada em templates.*.sections precisa existir, e uma
  // section priority:inherit nunca pode aparecer direto num template (so'
  // dentro de um dos ids listados no proprio nestedOnlyIn, o que este
  // formato de manifest nao expressa estruturalmente - so' os `repeat.blocks`
  // sao aceitos como "dentro de um container").
  for (const [templateId, template] of Object.entries(sections.templates)) {
    const distinctIds = new Set<string>();
    for (const item of template.sections) {
      for (const id of sectionIdsFromTemplateItem(item)) {
        distinctIds.add(id);
        const section = byId.get(id);
        if (!section) {
          errors.push(`sections.registry.yaml: templates.${templateId} referencia section inexistente "${id}"`);
          continue;
        }
        const isTopLevel = typeof item === 'string';
        if (isTopLevel && section.priority === 'inherit') {
          errors.push(
            `sections.registry.yaml: templates.${templateId} usa "${id}" direto na lista, mas ela tem priority inherit (so pode aparecer dentro de ${section.nestedOnlyIn?.join(', ') ?? '?'})`,
          );
        }
      }
    }
    if (distinctIds.size > sections.validation.maxSectionsPerPage) {
      errors.push(
        `sections.registry.yaml: templates.${templateId} tem ${distinctIds.size} tipos de section, acima do limite de validation.maxSectionsPerPage (${sections.validation.maxSectionsPerPage})`,
      );
    }
  }

  return errors;
}

/** Roda todos os checks cruzados. Retorna a lista de erros (vazia = tudo ok). */
export function runCrossChecks({ nearsConfig, routesManifest, sectionsRegistry }: AllManifests): CrossCheckError[] {
  return [
    ...checkRoutesInvariants(routesManifest),
    ...checkManifestReferences(nearsConfig, routesManifest, sectionsRegistry),
    ...checkSectionRegistry(sectionsRegistry),
  ];
}
