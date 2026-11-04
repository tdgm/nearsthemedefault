// Valida os 4 YAML de /nears. Fase 0: parse + invariantes cruzados que ja
// estao documentados (docs/adr/0003). Os schemas Zod completos e a geracao de
// tipos sao a Fase 2 (docs/ROADMAP.md); este script e substituido por eles.
import { readFile } from 'node:fs/promises';
import YAML from 'yaml';

const FILES = [
  'nears/nears.config.yaml',
  'nears/routes.manifest.yaml',
  'nears/sections.registry.yaml',
  'nears/contracts.yaml',
];

const errors = [];
const docs = {};

for (const f of FILES) {
  try {
    docs[f] = YAML.parse(await readFile(f, 'utf8'));
    if (docs[f] === null || typeof docs[f] !== 'object') errors.push(`${f}: documento vazio ou nao e um objeto`);
    else console.log(`ok      ${f}`);
  } catch (e) {
    errors.push(`${f}: YAML invalido - ${e.message}`);
  }
}

const routes = docs['nears/routes.manifest.yaml'];
if (routes) {
  const reserved = new Set(routes.resolution?.reserved?.firstSegment ?? []);
  const segments = [
    ...(routes.excluded?.disallowSegments ?? []),
    ...(routes.forbiddenInProduction?.segments ?? []),
  ];
  for (const seg of segments) {
    if (!reserved.has(seg)) {
      errors.push(
        `routes.manifest.yaml: segmento "${seg}" (excluded/forbiddenInProduction) precisa estar em resolution.reserved.firstSegment`,
      );
    }
  }
  for (const seg of routes.excluded?.disallowSegments ?? []) {
    if (String(seg).includes('*')) errors.push(`routes.manifest.yaml: disallowSegments nao aceita "*" (${seg})`);
  }
  for (const p of routes.excluded?.disallowPrefixes ?? []) {
    if (!String(p).endsWith('/')) errors.push(`routes.manifest.yaml: disallowPrefixes deve terminar em "/" (${p})`);
  }
  const ids = (routes.routes ?? []).map((r) => r.id);
  const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dup.length) errors.push(`routes.manifest.yaml: ids de rota duplicados: ${[...new Set(dup)].join(', ')}`);
}

if (errors.length) {
  console.error('\nFALHOU\n' + errors.map((e) => `  - ${e}`).join('\n') + '\n');
  process.exit(1);
}
console.log('\nManifests validos (parse + invariantes). Schemas Zod completos: Fase 2.\n');
