// Roda o E2E do fluxo descoberta -> PLP -> PDP -> carrinho (e2e/flow.spec.ts) uma
// vez por preset de nicho (e2e/presets.ts), em sequencia: cada rodada faz o build
// de producao com NEARS_PRESET=<preset> e sobe o servidor na porta 3000.
// Atencao: apps/web/.next fica com o build do ULTIMO preset. Antes de `pnpm lh` ou
// `pnpm check-budgets` rode `pnpm build` de novo (docs/adr/0024).
// TypeScript roda direto no Node (type stripping, Node >= 22.18).
import { spawnSync } from 'node:child_process';
import { E2E_PRESETS } from '../e2e/presets.ts';

const extra = process.argv.slice(2); // ex.: --headed, --grep "PDP"
const only = process.env.E2E_PRESET; // opcional: roda um preset so
const presets = only ? E2E_PRESETS.filter((p) => p === only) : E2E_PRESETS;
if (presets.length === 0) {
  console.error(`E2E_PRESET="${only}" nao esta em e2e/presets.ts (${E2E_PRESETS.join(', ')})`);
  process.exit(1);
}

const failed = [];
for (const preset of presets) {
  console.log(`\n=== E2E do fluxo de compra, preset "${preset}" ===`);
  const run = spawnSync('pnpm', ['exec', 'playwright', 'test', '--project=preset', ...extra], {
    stdio: 'inherit',
    env: { ...process.env, NEARS_PRESET: preset },
  });
  if (run.status !== 0) failed.push(preset);
}

if (failed.length > 0) {
  console.error(`\nE2E falhou nos presets: ${failed.join(', ')}`);
  process.exit(1);
}
console.log(`\nE2E OK nos presets: ${presets.join(', ')}`);
