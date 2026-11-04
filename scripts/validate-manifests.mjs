// Validacao real (schema Zod gerado a partir dos 4 YAML, com tipos
// TypeScript derivados) chega na Fase 2 - docs/ROADMAP.md. Por enquanto
// este script so confirma que os 4 arquivos de /nears tem sintaxe YAML
// valida: e o minimo pra `pnpm validate` nao mascarar um manifesto quebrado
// antes da Fase 2 existir (um YAML invalido em routes.manifest.yaml ja
// aconteceu neste repo - ver docs/adr/0003).
import { readFile } from 'node:fs/promises';
import YAML from 'yaml';

const files = [
  'nears/nears.config.yaml',
  'nears/routes.manifest.yaml',
  'nears/sections.registry.yaml',
  'nears/contracts.yaml',
];

let failed = false;
for (const f of files) {
  try {
    YAML.parse(await readFile(f, 'utf8'));
    console.log(`ok      ${f}`);
  } catch (err) {
    failed = true;
    console.error(`FALHOU  ${f}: ${err.message}`);
  }
}

console.log(
  '\nSchema Zod completo (tipos gerados, validacao de catalog/vocabulary ' +
    'contra os presets, from:/enabledBy:) chega na Fase 2. Isto aqui so ' +
    'garante sintaxe YAML valida nos 4 manifests.'
);

if (failed) {
  process.exit(1);
}
