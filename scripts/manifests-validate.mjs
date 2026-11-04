// Valida os 4 YAML de /nears com os schemas Zod de @nears/manifests e confere
// as referencias entre eles (from:/enabledBy:, templates, rotas, facetas).
// Roda o nicho configurado (`generic`) e TODOS os presets de nears/presets, e
// gera os tipos de cada um em memoria (gate da Fase 2, docs/ROADMAP.md).
// TypeScript roda direto no Node (type stripping, Node >= 22.18).
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { formatIssue, generateTypes } from '../packages/manifests/src/index.ts';
import { ManifestError } from '../packages/manifests/src/manifests.ts';
import { listPresets, loadManifests } from '../packages/manifests/src/node.ts';
import { RegistryError, createRegistry, pendingSections, sectionModules } from '../packages/sections/src/index.ts';

const root = resolve(fileURLToPath(import.meta.url), '../..');
const nearsDir = resolve(root, 'nears');
const tokensFile = resolve(root, 'packages/tokens/tokens.json');

const targets = [{ label: 'generic (nears.config.yaml)', preset: undefined }, ...listPresets(nearsDir).map((p) => ({ label: `preset ${p}`, preset: p }))];

let failed = false;
let generic;
for (const t of targets) {
  try {
    const m = loadManifests({ nearsDir, tokensFile, preset: t.preset });
    if (!t.preset) generic = m;
    const types = generateTypes(m);
    if (!types.includes('export type VariantAxisId')) throw new Error('geracao de tipos incompleta');
    const sections = m.sections.sections.length + m.sections.pdpSections.length;
    console.log(
      `ok      ${t.label.padEnd(30)} ${m.config.catalog.variantAxes.length} eixos, ${m.config.catalog.facets.available.length} facetas, ${sections} sections, ${m.routes.routes.length} rotas`,
    );
  } catch (e) {
    failed = true;
    console.error(`FALHOU  ${t.label}`);
    if (e instanceof ManifestError) console.error(e.issues.map(formatIssue).join('\n'));
    else console.error(`  - ${e instanceof Error ? e.message : String(e)}`);
  }
}

// Registry: toda section implementada precisa de componente, schema, meta
// (priority, cwv, a11y) e story, e bater com o manifest. Falha o build.
if (generic) {
  try {
    const registry = createRegistry(generic, sectionModules, (p) => existsSync(resolve(root, p)));
    const pending = pendingSections(generic, registry);
    console.log(
      `ok      registry de sections            ${registry.size} implementadas, ${pending.length} pendentes (Fases 4 e 5)`,
    );
  } catch (e) {
    failed = true;
    console.error('FALHOU  registry de sections');
    if (e instanceof RegistryError) console.error(e.issues.map((i) => `  - ${i.section}: ${i.message}`).join('\n'));
    else console.error(`  - ${e instanceof Error ? e.message : String(e)}`);
  }
}

if (failed) {
  console.error('\nManifests invalidos.\n');
  process.exit(1);
}
console.log(`\nManifests validos (schemas Zod + referencias) em ${targets.length} configuracoes de nicho.\n`);
