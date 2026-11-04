// Gera packages/manifests/_generated/nears.types.ts a partir do nicho
// configurado em nears.config.yaml. `--check` (CI) falha se o arquivo
// versionado divergir; sem a flag, regrava.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateTypes } from '../packages/manifests/src/index.ts';
import { loadManifests } from '../packages/manifests/src/node.ts';

const root = resolve(fileURLToPath(import.meta.url), '../..');
const out = resolve(root, 'packages/manifests/_generated/nears.types.ts');
const check = process.argv.includes('--check');

const content = generateTypes(
  loadManifests({ nearsDir: resolve(root, 'nears'), tokensFile: resolve(root, 'packages/tokens/tokens.json') }),
);

if (check) {
  const current = existsSync(out) ? readFileSync(out, 'utf8') : '';
  if (current !== content) {
    console.error('packages/manifests/_generated/nears.types.ts desatualizado. Rode: pnpm manifests:types');
    process.exit(1);
  }
  console.log('Tipos dos manifests em dia.');
} else {
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, content);
  console.log('Gerado packages/manifests/_generated/nears.types.ts');
}
