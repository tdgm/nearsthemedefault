// Orcamento de JS/CSS/HTML por rota, medido estaticamente a partir do output
// do build (.next), sem precisar de servidor rodando. O que isto NAO pode
// medir - requisicoes iniciais, hosts de terceiros, JS de terceiros, LCP/
// INP/CLS/TTFB - exige uma pagina carregada de verdade e e aplicado via
// Lighthouse CI (lighthouserc.json > settings.budgets + scripts/
// check-third-party-hosts.mjs), que roda depois deste no job `lighthouse`.
// Ver docs/adr/0005-enforcement-de-budgets.md para o mapa completo.
import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';
import YAML from 'yaml';

const cfg = YAML.parse(await readFile('nears/nears.config.yaml', 'utf8'));
const routesManifest = YAML.parse(await readFile('nears/routes.manifest.yaml', 'utf8'));
const B = cfg.budgets;
const APP_ROOT = 'apps/web';
const APP_DIR = 'apps/web/app';
const BUILD_DIR = 'apps/web/.next';

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

// Next 16 + Turbopack nao gera mais app-build-manifest.json. As fontes sao:
//  - diagnostics/route-bundle-stats.json: chunks de JS do primeiro carregamento
//    de cada rota (firstLoadChunkPaths, relativos a apps/web);
//  - app-path-routes-manifest.json: "/[slug]/page" -> "/[slug]", a mesma chave
//    de appRoute do routes.manifest.yaml. Ver docs/adr/0009-fase-0-fundacao.md.
const STATS_FILE = join(BUILD_DIR, 'diagnostics/route-bundle-stats.json');
const PATHS_FILE = join(BUILD_DIR, 'app-path-routes-manifest.json');
if (!existsSync(STATS_FILE) || !existsSync(PATHS_FILE)) {
  console.error(
    `\nNao encontrei ${STATS_FILE} ou ${PATHS_FILE}. Rode "pnpm build" antes deste ` +
      'script (e o que o job `budgets` do CI faz). Se o build rodou, a versao do Next ' +
      'mudou o formato dos diagnosticos: ajuste este script, nao o budget.\n'
  );
  process.exit(1);
}
const routeStats = JSON.parse(await readFile(STATS_FILE, 'utf8'));
const appPathRoutes = JSON.parse(await readFile(PATHS_FILE, 'utf8'));

// --- rotas criticas: lidas de routes.manifest.yaml > appRoute, nunca ------
// adivinhadas. Varias rotas compartilham o mesmo appRoute (grupo ambiguo de
// 1o/2o segmento, ver nota no topo do manifest) - agrupamos para medir o
// bundle uma unica vez por arquivo fisico.
const keyFromAppRoute = (appRoute) => appRoute; // ja' esta no formato de chave do manifest
const folderFromAppRoute = (appRoute) =>
  join(APP_DIR, appRoute.replace(/\/page$/, ''));
const pageFileExists = (folder) =>
  ['page.tsx', 'page.ts', 'page.jsx', 'page.js'].some((f) =>
    existsSync(join(folder, f))
  );

const criticalRoutes = routesManifest.routes.filter((r) => r.jsBudgetCritical);
if (criticalRoutes.length === 0) {
  console.error(
    '\nNenhuma rota em routes.manifest.yaml declara jsBudgetCritical: true. ' +
      'O orcamento de JS da rota critica (CLAUDE.md) ficaria sem gate algum - ' +
      'isso e erro de configuracao, nao uma loja sem rotas criticas.\n'
  );
  process.exit(1);
}
for (const r of criticalRoutes) {
  if (!r.appRoute) {
    console.error(`\nFALHOU   rota "${r.id}" e jsBudgetCritical mas nao declara appRoute.\n`);
    process.exit(1);
  }
}

// agrupa ids por appRoute fisico
const byAppRoute = new Map();
for (const r of criticalRoutes) {
  if (!byAppRoute.has(r.appRoute)) byAppRoute.set(r.appRoute, []);
  byAppRoute.get(r.appRoute).push(r.id);
}

let failed = false;
const checked = [];
const notImplemented = [];

for (const [appRoute, ids] of byAppRoute) {
  const folder = folderFromAppRoute(appRoute);
  if (!pageFileExists(folder)) {
    notImplemented.push(...ids);
    continue; // fase ainda nao implementou esta rota - nao e regressao
  }
  const key = keyFromAppRoute(appRoute);
  const routeName = appPathRoutes[key];
  const entry = routeName && routeStats.find((s) => s.route === routeName);
  if (!entry) {
    console.error(
      `\nFALHOU   ${ids.join('/')} tem page em ${folder} mas a chave ` +
        `"${key}" nao existe nos diagnosticos do build (${PATHS_FILE}). O build e o ` +
        'routes.manifest.yaml divergiram - confira o nome da pasta/arquivo.\n'
    );
    failed = true;
    continue;
  }
  // firstLoadChunkPaths vem relativo a apps/web (".next/static/chunks/x.js").
  const js = entry.firstLoadChunkPaths.filter((f) => f.endsWith('.js'));
  let kb = 0;
  for (const f of js) kb += await gzipKb(join(APP_ROOT, f));
  kb = Math.round(kb * 10) / 10;
  const over = kb > B.js_initial_kb;
  if (over) failed = true;
  checked.push({ ids, key, kb, over });
}

console.log('\nORCAMENTO DE JS POR ROTA CRITICA (gzip, limite ' + B.js_initial_kb + ' KB)\n');
for (const r of checked.sort((a, b) => b.kb - a.kb)) {
  console.log(
    (r.over ? 'FALHOU  ' : 'ok      ') + r.key.padEnd(30) +
      String(r.kb).padStart(7) + ' KB   (' + r.ids.join(', ') + ')'
  );
}
if (notImplemented.length) {
  console.log(
    '\nainda nao implementadas (sem page.tsx): ' + notImplemented.join(', ')
  );
}

// --- CSS total -------------------------------------------------------------
// Turbopack grava o CSS em static/chunks; o webpack usava static/css.
const cssFiles = (await walk(join(BUILD_DIR, 'static'))).filter((f) => f.endsWith('.css'));
let cssKb = 0;
for (const f of cssFiles) cssKb += await gzipKb(f);
cssKb = Math.round(cssKb * 10) / 10;
const cssOver = cssKb > B.css_initial_kb;
if (cssOver) failed = true;
console.log(
  '\n' + (cssOver ? 'FALHOU  ' : 'ok      ') + 'CSS total'.padEnd(28) +
    ''.padEnd(30) + String(cssKb).padStart(7) + ' KB  (limite ' + B.css_initial_kb + ' KB)'
);

// --- HTML, so para rotas 100% estaticas (SSG) sem segmento dinamico --------
// ISR/dinamico so tem HTML real apos uma requisicao: isso e medido pelo
// job `lighthouse` (document size), nao aqui. Nao adivinhamos.
console.log(`\nORCAMENTO DE HTML (gzip, limite ${B.html_kb} KB)\n`);
let htmlChecked = 0;
for (const route of routesManifest.routes) {
  if (route.render !== 'ssg' || !route.appRoute || /\[/.test(route.appRoute)) continue;
  const htmlRel = route.appRoute === '/page' ? 'index' : route.appRoute.replace(/^\//, '').replace(/\/page$/, '');
  const htmlPath = join(BUILD_DIR, 'server/app', `${htmlRel}.html`);
  if (!existsSync(htmlPath)) continue; // rota ainda nao implementada
  htmlChecked++;
  const kb = await gzipKb(htmlPath);
  const over = kb > B.html_kb;
  if (over) failed = true;
  console.log(
    (over ? 'FALHOU  ' : 'ok      ') + route.id.padEnd(28) + String(Math.round(kb * 10) / 10).padStart(7) + ' KB'
  );
}
if (htmlChecked === 0) {
  console.log('(nenhuma rota SSG implementada ainda - nada para medir)');
}

console.log(
  '\nRequisicoes iniciais, hosts de terceiros e JS de terceiros nao sao ' +
    'medidos aqui: dependem de uma pagina carregada de verdade. Rode "pnpm lh" ' +
    '(lighthouserc.json > settings.budgets cobre os tres) e, para a contagem ' +
    'de hosts distintos, scripts/check-third-party-hosts.mjs.'
);

if (failed) {
  console.error(
    '\nBudget estourado. Reduza o bundle ou abra um ADR em docs/adr ' +
      'justificando a mudanca de limite em nears/nears.config.yaml.'
  );
  process.exit(1);
}
console.log('\nTodos os budgets medidos estaticamente foram respeitados.\n');
