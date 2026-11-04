// Gate de contraste AA (contracts.yaml > gates.accessibility.contrastPairs).
// Calcula a razao de contraste WCAG 2.x de cada par semantico nos temas light
// e dark e falha se algum ficar abaixo do minimo (texto 4.5:1, UI 3:1).
// Matematica em packages/tokens/src/core.mjs; decisao em docs/adr/0004.
import { readFile } from 'node:fs/promises';
import YAML from 'yaml';
import { evaluatePairs, flatten, resolveAll, stripNotes } from '../packages/tokens/src/core.mjs';

const tokensPath = process.argv[2] ?? 'packages/tokens/tokens.json';

const tokens = JSON.parse(await readFile(tokensPath, 'utf8'));
const contracts = YAML.parse(await readFile('nears/contracts.yaml', 'utf8'));
const { contrastPairs, contrastMin } = contracts.gates.accessibility;

const rows = evaluatePairs(resolveAll(flatten(stripNotes(tokens))), contrastPairs, contrastMin);

let failed = 0;
for (const r of rows) {
  const line = `${r.theme.padEnd(5)} ${r.fg.padEnd(17)} sobre ${r.bg.padEnd(15)} ${r.ratio.toFixed(2).padStart(5)}:1  (min ${r.required}:1, ${r.min})`;
  if (r.ok) {
    if (process.argv.includes('--verbose')) console.log(`ok      ${line}`);
  } else {
    failed++;
    console.error(`FALHOU  ${line}`);
  }
}

const lowest = rows.reduce((a, b) => (b.ratio / b.required < a.ratio / a.required ? b : a));
console.log(
  `\n${rows.length} pares checados (${rows.length / 2} por tema), ${failed} abaixo do minimo. ` +
    `Menor folga: ${lowest.fg} / ${lowest.bg} (${lowest.theme}) = ${lowest.ratio.toFixed(2)}:1 (min ${lowest.required}:1).`,
);
if (failed) process.exit(1);
