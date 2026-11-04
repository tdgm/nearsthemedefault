// Resolucao de referencias (`from:`, `enabledBy:`, `{media.aspect[...]}`) e
// invariantes ENTRE manifests. Schemas Zod validam a forma de cada arquivo;
// aqui entra tudo o que cruza arquivos (docs/adr/0012).
import { variantAxisSchema } from './schemas/config.ts';
import type { Issue, Manifests, TokensMedia } from './manifests.ts';
import type { Section, TemplateEntry } from './schemas/sections.ts';

/** Raizes que uma referencia pode ter. `navigation` e do CMS: nao existe no repo. */
const EXTERNAL_ROOTS = new Set(['navigation']);
const REF_KEYS = new Set(['from', 'enabledBy', 'indexableFrom', 'requiredForGeoFrom', 'variesBy']);

/** Chaves validas dentro de itens de array referenciados com `[]`. */
const ARRAY_ITEM_KEYS: Record<string, string[]> = {
  'catalog.variantAxes': Object.keys(variantAxisSchema.shape),
};

export type RefContext = { catalog: unknown; vocabulary: unknown; composition: unknown; media: TokensMedia };

export type Resolved = { ok: true; value: unknown } | { ok: false; reason: string };

/** Resolve `catalog.facets.available`, `catalog.variantAxes[].schemaOrg` etc. */
export function resolveRef(ref: string, ctx: RefContext): Resolved {
  const root = ref.split(/[.[]/)[0] ?? '';
  if (EXTERNAL_ROOTS.has(root)) return { ok: true, value: undefined };
  const roots: Record<string, unknown> = {
    catalog: ctx.catalog,
    vocabulary: ctx.vocabulary,
    composition: ctx.composition,
    media: ctx.media,
  };
  if (!(root in roots)) {
    return { ok: false, reason: `raiz "${root}" desconhecida (use ${[...Object.keys(roots), ...EXTERNAL_ROOTS].join(', ')})` };
  }
  let node: unknown = roots[root];
  let walked = root;
  for (const raw of ref.slice(root.length + 1).split('.').filter(Boolean)) {
    const isArray = raw.endsWith('[]');
    const key = isArray ? raw.slice(0, -2) : raw;
    if (Array.isArray(node)) {
      const allowed = ARRAY_ITEM_KEYS[walked] ?? [];
      if (!allowed.includes(key)) return { ok: false, reason: `"${key}" nao existe nos itens de ${walked}` };
      return { ok: true, value: undefined };
    }
    if (node === null || typeof node !== 'object' || !(key in node)) {
      return { ok: false, reason: `"${walked}.${key}" nao existe` };
    }
    node = (node as Record<string, unknown>)[key];
    walked += `.${key}`;
    if (isArray) {
      if (!Array.isArray(node)) return { ok: false, reason: `"${walked}" nao e lista` };
      if (!ARRAY_ITEM_KEYS[walked]) return { ok: true, value: node };
    }
  }
  return { ok: true, value: node };
}

/** `{media.aspect[catalog.productMedia.aspect]}`, `{media.sizes.productCard}`. */
function checkBraceTemplate(text: string, ctx: RefContext): string | null {
  // So placeholders de referencia (ex.: "{media.aspect[...]}"); "{page} | {brand}" e um template de texto.
  const m = /^\{((?:media|catalog|vocabulary|composition)[.[][^{}]*)\}$/.exec(text);
  if (!m) return null;
  const inner = m[1] ?? '';
  const indexed = /^([a-zA-Z.]+)\[([a-zA-Z.]+)\]$/.exec(inner);
  if (indexed) {
    const table = resolveRef(indexed[1] ?? '', ctx);
    const key = resolveRef(indexed[2] ?? '', ctx);
    if (!table.ok) return table.reason;
    if (!key.ok) return key.reason;
    if (typeof key.value !== 'string') return `"${indexed[2]}" nao e texto`;
    if (typeof table.value !== 'object' || table.value === null || !(key.value in table.value)) {
      return `"${key.value}" nao existe em ${indexed[1]}`;
    }
    return null;
  }
  const plain = resolveRef(inner, ctx);
  return plain.ok ? null : plain.reason;
}

type Walk = (node: unknown, path: string, file: string) => void;

function walkRefs(root: unknown, file: string, ctx: RefContext, issues: Issue[], skip: (path: string) => boolean) {
  const visit: Walk = (node, path, f) => {
    if (skip(path)) return;
    if (typeof node === 'string') {
      const err = checkBraceTemplate(node, ctx);
      if (err) issues.push({ file: f, path, message: `referencia ${node}: ${err}` });
      return;
    }
    if (Array.isArray(node)) return node.forEach((n, i) => visit(n, `${path}[${i}]`, f));
    if (node === null || typeof node !== 'object') return;
    for (const [k, v] of Object.entries(node)) {
      const p = path ? `${path}.${k}` : k;
      if (REF_KEYS.has(k) && typeof v === 'string' && v.includes('.')) {
        const r = resolveRef(v, ctx);
        if (!r.ok) issues.push({ file: f, path: p, message: `${k}: ${v} -> ${r.reason}` });
      } else if (k === 'default' && typeof v === 'string' && v.startsWith('vocabulary.')) {
        const r = resolveRef(v, ctx);
        if (!r.ok) issues.push({ file: f, path: p, message: `default: ${v} -> ${r.reason}` });
      } else {
        visit(v, p, f);
      }
    }
  };
  visit(root, '', file);
}

// ----------------------------------------------------------------- secoes

const sectionSource = (m: Manifests) => [
  ...m.sections.sections.map((s) => ({ s, group: 'sections' })),
  ...m.sections.pdpSections.map((s) => ({ s, group: 'pdpSections' })),
];

/** Quebra `showcase:tabs` em id e variante. */
export const splitEntry = (entry: string): { id: string; variant: string | undefined } => {
  const [id = '', variant] = entry.split(':');
  return { id, variant };
};

type Counted = { types: Set<string>; instances: number; critical: number };

function checkTemplates(m: Manifests, issues: Issue[]) {
  const file = 'sections.registry.yaml';
  const all = new Map<string, Section>();
  const dupes: string[] = [];
  for (const { s } of [...m.sections.globals.map((s) => ({ s })), ...sectionSource(m)]) {
    if (all.has(s.id)) dupes.push(s.id);
    all.set(s.id, s);
  }
  if (dupes.length) issues.push({ file, path: 'sections', message: `ids duplicados: ${[...new Set(dupes)].join(', ')}` });

  const pageable = new Map(sectionSource(m).map(({ s }) => [s.id, s]));
  const v = m.sections.validation;

  for (const s of all.values()) {
    if (s.variantRules?.length) {
      for (const r of s.variantRules) {
        if (!s.variants?.includes(r.variant)) {
          issues.push({ file, path: `${s.id}.variantRules`, message: `variante "${r.variant}" nao existe em ${s.id}.variants` });
        }
      }
    }
    if (s.priority === 'inherit') {
      if (!s.nestedOnlyIn?.length) {
        issues.push({ file, path: s.id, message: 'priority: inherit exige nestedOnlyIn (nao ha mae de quem herdar)' });
      }
      for (const parent of s.nestedOnlyIn ?? []) {
        const p = all.get(parent);
        if (!p) issues.push({ file, path: `${s.id}.nestedOnlyIn`, message: `container "${parent}" nao existe` });
        else if (p.priority === 'inherit') {
          issues.push({ file, path: `${s.id}.nestedOnlyIn`, message: `container "${parent}" tambem herda: heranca em cadeia nao e suportada` });
        }
      }
    } else if (s.nestedOnlyIn?.length) {
      issues.push({ file, path: s.id, message: 'nestedOnlyIn so vale com priority: inherit' });
    }
  }

  for (const [name, tpl] of Object.entries(m.sections.templates)) {
    const count: Counted = { types: new Set(), instances: 0, critical: 0 };
    const addBlock = (entry: string, path: string, times: number) => {
      const { id, variant } = splitEntry(entry);
      const sec = pageable.get(id);
      if (!sec) {
        const hint = all.has(id) ? ' (e uma section global, nao entra em template)' : '';
        issues.push({ file, path, message: `section "${id}" nao existe${hint}` });
        return;
      }
      if (sec.priority === 'inherit') {
        issues.push({ file, path, message: `"${id}" tem priority: inherit e so pode aparecer dentro de ${sec.nestedOnlyIn?.join(', ')}` });
      }
      if (variant && !sec.variants?.includes(variant)) {
        issues.push({ file, path, message: `variante "${variant}" nao existe em ${id}.variants` });
      }
      count.types.add(id);
      count.instances += times;
      if (sec.priority === 'critical') count.critical += times;
    };
    tpl.sections.forEach((entry: TemplateEntry, i) => {
      const path = `templates.${name}.sections[${i}]`;
      if (typeof entry === 'string') return addBlock(entry, path, 1);
      const { over, limit, blocks } = entry.repeat;
      let times = 1; // sem `limit`, o numero real so existe em runtime: conta uma volta
      if (typeof limit === 'number') times = limit;
      else if (limit) {
        const r = resolveRef(limit.from, refContext(m));
        if (r.ok && typeof r.value === 'number') times = r.value;
        else issues.push({ file, path: `${path}.repeat.limit`, message: `limit.from ${limit.from} nao resolve para numero` });
      }
      if (!over) issues.push({ file, path, message: 'repeat.over vazio' });
      blocks.forEach((b) => addBlock(b, `${path}.repeat.blocks`, times));
    });
    if (count.types.size > v.maxSectionsPerPage) {
      issues.push({ file, path: `templates.${name}`, message: `${count.types.size} tipos de section (maximo ${v.maxSectionsPerPage})` });
    }
    if (count.instances > v.maxSectionInstancesPerPage) {
      issues.push({ file, path: `templates.${name}`, message: `${count.instances} instancias (maximo ${v.maxSectionInstancesPerPage})` });
    }
    if (count.critical > v.maxCriticalSections) {
      issues.push({ file, path: `templates.${name}`, message: `${count.critical} sections critical (maximo ${v.maxCriticalSections})` });
    }
  }
}

// ------------------------------------------------------------------ rotas

function checkRoutes(m: Manifests, issues: Issue[]) {
  const file = 'routes.manifest.yaml';
  const { routes, resolution, excluded, forbiddenInProduction, facets } = m.routes;
  const ids = routes.map((r) => r.id);
  const dupIds = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dupIds.length) issues.push({ file, path: 'routes', message: `ids duplicados: ${[...new Set(dupIds)].join(', ')}` });
  const patterns = routes.map((r) => r.pattern);
  const dupPatterns = patterns.filter((p, i) => patterns.indexOf(p) !== i);
  if (dupPatterns.length) issues.push({ file, path: 'routes', message: `padroes duplicados: ${[...new Set(dupPatterns)].join(', ')}` });

  const known = new Set(ids);
  const templates = new Set(Object.keys(m.sections.templates));
  const reserved1 = new Set(resolution.reserved.firstSegment);
  const reserved2 = new Set(resolution.reserved.secondSegment);

  for (const r of routes) {
    if (!templates.has(r.template)) {
      issues.push({ file, path: r.id, message: `template "${r.template}" nao existe em sections.registry.yaml > templates` });
    }
    if (r.canonicalTo && !known.has(r.canonicalTo)) {
      issues.push({ file, path: `${r.id}.canonicalTo`, message: `rota "${r.canonicalTo}" nao existe` });
    }
    const [first = '', second] = r.pattern.split('/').filter(Boolean);
    if (first && !first.startsWith('{') && !reserved1.has(first)) {
      issues.push({ file, path: `${r.id}.pattern`, message: `segmento literal "${first}" precisa estar em resolution.reserved.firstSegment` });
    }
    if (second && !second.startsWith('{') && !reserved2.has(second)) {
      issues.push({ file, path: `${r.id}.pattern`, message: `segmento literal "${second}" precisa estar em resolution.reserved.secondSegment` });
    }
  }
  if (!known.has('sitemap-html')) {
    issues.push({ file, path: 'routes', message: 'rota sitemap-html e obrigatoria no template padrao (docs/adr/0006)' });
  }
  for (const [i, s] of resolution.slugIndex.sources.entries()) {
    if (!known.has(s.route)) issues.push({ file, path: `resolution.slugIndex.sources[${i}]`, message: `rota "${s.route}" nao existe` });
  }
  for (const [from, to] of Object.entries(resolution.secondSegment)) {
    if (!known.has(to)) issues.push({ file, path: `resolution.secondSegment.${from}`, message: `rota "${to}" nao existe` });
  }
  for (const seg of [...excluded.disallowSegments, ...forbiddenInProduction.segments]) {
    if (!reserved1.has(seg)) {
      issues.push({ file, path: 'excluded', message: `segmento "${seg}" (excluded/forbiddenInProduction) precisa estar em resolution.reserved.firstSegment` });
    }
  }
  const never = new Set(facets.neverIndexable);
  for (const f of m.config.catalog.facets.indexable) {
    if (never.has(f)) {
      issues.push({ file: 'nears.config.yaml', path: 'catalog.facets.indexable', message: `faceta "${f}" esta em routes.facets.neverIndexable` });
    }
  }
}

// ------------------------------------------------------------- contratos

function checkContracts(m: Manifests, issues: Issue[]) {
  const file = 'contracts.yaml';
  const targets = new Set([...Object.keys(m.sections.templates), ...m.routes.routes.map((r) => r.id)]);
  for (const key of Object.keys(m.contracts.seo.byTemplate)) {
    if (!targets.has(key)) issues.push({ file, path: `seo.byTemplate.${key}`, message: 'nao e template nem rota' });
  }
  const declares = [...m.contracts.gates.governance.everySectionDeclares].sort().join(',');
  const required = [...m.sections.validation.everySectionMustDeclare].sort().join(',');
  if (declares !== required) {
    issues.push({ file, path: 'gates.governance.everySectionDeclares', message: `diverge de sections.registry.yaml > validation (${required})` });
  }
}

export const refContext = (m: Manifests, media: TokensMedia = { aspect: {}, sizes: {} }): RefContext => ({
  catalog: m.config.catalog,
  vocabulary: m.config.vocabulary,
  composition: m.config.composition,
  media,
});

/** Todas as validacoes entre manifests. Retorna a lista (vazia = ok). */
export function validateCross(m: Manifests, media: TokensMedia): Issue[] {
  const issues: Issue[] = [];
  const ctx = refContext(m, media);

  if (!(m.config.catalog.productMedia.aspect in media.aspect)) {
    issues.push({
      file: 'nears.config.yaml',
      path: 'catalog.productMedia.aspect',
      message: `"${m.config.catalog.productMedia.aspect}" nao existe em tokens.json > media.aspect (${Object.keys(media.aspect).join(', ')})`,
    });
  }
  walkRefs(m.config, 'nears.config.yaml', ctx, issues, (p) => p.startsWith('catalog') || p.startsWith('vocabulary'));
  walkRefs(m.routes, 'routes.manifest.yaml', ctx, issues, (p) => p.startsWith('resolution.slugIndex.sources'));
  walkRefs(m.sections, 'sections.registry.yaml', ctx, issues, () => false);
  walkRefs(m.contracts, 'contracts.yaml', ctx, issues, () => false);

  checkTemplates(m, issues);
  checkRoutes(m, issues);
  checkContracts(m, issues);
  return issues;
}
