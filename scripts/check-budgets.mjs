import { readFile, readdir } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';
import YAML from 'yaml';

// Fonte unica de verdade dos limites: nears/nears.config.yaml
const cfg = YAML.parse(await readFile('nears/nears.config.yaml', 'utf8'));
const B = cfg.budgets;

const gzipKb = async (p) =>
  Math.round(gzipSync(await readFile(p)).length / 102.4) / 10;

const walk = async (dir) => {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
};

const manifest = JSON.parse(
  await readFile('apps/web/.next/app-build-manifest.json', 'utf8')
);

const results = [];
for (const [route, files] of Object.entries(manifest.pages)) {
  const js = files.filter((f) => f.endsWith('.js'));
  let kb = 0;
  for (const f of js) kb += await gzipKb(join('apps/web/.next', f));
  results.push({ route, kb: Math.round(kb * 10) / 10 });
}

const critical = ['/page', '/[...slug]/page', '/[slug]/p/page'];
let failed = false;

console.log('\nORCAMENTO DE JS POR ROTA (gzip)\n');
for (const r of results.sort((a, b) => b.kb - a.kb)) {
  const isCritical = critical.includes(r.route);
  const over = isCritical && r.kb > B.js_initial_kb;
  if (over) failed = true;
  console.log(
    (over ? 'FALHOU  ' : 'ok      ') +
      r.route.padEnd(36) +
      String(r.kb).padStart(7) +
      ' KB' +
      (isCritical ? '  (limite ' + B.js_initial_kb + ' KB)' : '')
  );
}

const cssFiles = (await walk('apps/web/.next/static/css')).filter((f) =>
  f.endsWith('.css')
);
let cssKb = 0;
for (const f of cssFiles) cssKb += await gzipKb(f);
cssKb = Math.round(cssKb * 10) / 10;
if (cssKb > B.css_initial_kb) failed = true;

console.log(
  '\n' +
    (cssKb > B.css_initial_kb ? 'FALHOU  ' : 'ok      ') +
    'CSS total'.padEnd(36) +
    String(cssKb).padStart(7) +
    ' KB  (limite ' + B.css_initial_kb + ' KB)'
);

if (failed && B.onExceed === 'fail') {
  console.error(
    '\nBudget estourado. Reduza o bundle ou abra um ADR em docs/adr ' +
      'justificando a mudanca de limite em nears/nears.config.yaml.'
  );
  process.exit(1);
}

console.log('\nTodos os budgets respeitados.\n');
