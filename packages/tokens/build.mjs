// Build de tokens (Style Dictionary 5). Le packages/tokens/tokens.json e gera:
//   dist/tokens.css          CSS custom properties (--nears-*), tema claro/escuro
//   dist/theme.css           @theme do Tailwind 4 apontando para as vars acima
//   dist/figma.tokens.json   formato Tokens Studio (sets global/light/dark)
//   apps/web/app/_generated/fonts.ts   loader next/font/local (ou modo system)
// Os arquivos gerados ficam versionados; `--check` falha se o disco divergir do
// que o build produziria (gate no `pnpm validate`). Decisoes: docs/adr/0011.
//
// Uso: node packages/tokens/build.mjs [--check]
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import StyleDictionary from 'style-dictionary';
import YAML from 'yaml';
import { flatten, resolveAll, stripNotes, THEMES, validateTokens } from './src/core.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../..');
const HEADER = 'GERADO por packages/tokens/build.mjs a partir de tokens.json. NAO edite a mao.';

// ------------------------------------------------------------------ nomes

const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

/**
 * Mapeia o caminho do token para { css, tw } (nomes SEM o prefixo `--`).
 * Retorna null para o que nao vira variavel (fonte, metricas, media.sizes...).
 * `tw` e o nome na namespace do Tailwind 4 (--color-*, --text-*, ...).
 */
export function names(path) {
  const [g, a, b] = path;
  const rest = path.slice(1).map(kebab);
  switch (g) {
    case 'color':
      return { css: `color-${rest.join('-')}`, tw: `color-${rest.join('-')}` };
    case 'semantic':
      return { css: `color-${kebab(b)}`, tw: `color-${kebab(b)}`, theme: a };
    case 'typography': {
      const k = kebab(b ?? '');
      if (a === 'size') return { css: `text-${k}`, tw: `text-${k}` };
      if (a === 'family') return { css: `font-${k}`, tw: k === 'brand' ? 'font-sans' : `font-${k}` };
      if (a === 'weight') {
        const tw = { regular: 'normal', medium: 'medium', bold: 'bold' }[b];
        return { css: `font-weight-${k}`, tw: tw ? `font-weight-${tw}` : null };
      }
      if (a === 'leading') return { css: `leading-${k}`, tw: `leading-${k}` };
      if (a === 'tracking') return { css: `tracking-${k}`, tw: `tracking-${k}` };
      return null;
    }
    case 'space':
      return a === 'base' ? null : { css: `space-${a}`, tw: null };
    case 'radius':
      return { css: `radius-${a}`, tw: `radius-${a}` };
    case 'shadow':
      return { css: `shadow-${a}`, tw: `shadow-${a}` };
    case 'zIndex':
      return { css: `z-${kebab(a)}`, tw: null };
    case 'breakpoint':
      return { css: `breakpoint-${a}`, tw: `breakpoint-${a}` };
    case 'grid':
      return { css: `grid-${rest.join('-')}`, tw: null };
    case 'motion':
      if (a === 'duration') return { css: `duration-${kebab(b)}`, tw: null };
      if (a === 'easing') return { css: `ease-${kebab(b)}`, tw: `ease-${kebab(b)}` };
      return null;
    case 'media':
      return a === 'aspect' ? { css: `aspect-${kebab(b)}`, tw: `aspect-${kebab(b)}` } : null;
    case 'target':
      return { css: `target-${kebab(a)}`, tw: null };
    default:
      return null;
  }
}

const pathKey = (p) => p.join('.');
const refToVar = (value, nameOf) =>
  String(value).replace(/\{([^{}]+)\}/g, (_, ref) => {
    const n = nameOf.get(ref);
    if (!n) throw new Error(`Referencia {${ref}} aponta para token que nao vira variavel CSS`);
    return `var(--nears-${n})`;
  });

// ---------------------------------------------------------------- formatos

function tokenList(dictionary) {
  // `original.value` preserva a referencia ({color.neutral.0}); `value` e o
  // valor ja resolvido pelo Style Dictionary.
  return dictionary.allTokens.map((t) => ({
    path: t.path,
    key: pathKey(t.path),
    raw: (t.original.$value ?? t.original.value),
    value: (t.$value ?? t.value),
  }));
}

function cssFormat({ dictionary }) {
  const list = tokenList(dictionary);
  const nameOf = new Map();
  for (const t of list) {
    const n = names(t.path);
    if (n && !n.theme) nameOf.set(t.key, n.css);
  }
  // Referencias dos temas apontam para primitivos (sem tema).
  const decl = (t, n) => `  --nears-${n.css}: ${refToVar(t.raw, nameOf)};`;
  const base = [];
  const themed = { light: [], dark: [] };
  for (const t of list) {
    const n = names(t.path);
    if (!n) continue;
    if (n.theme) themed[n.theme].push(decl(t, n));
    else base.push(decl(t, n));
  }
  return [
    `/* ${HEADER} */`,
    '',
    ':root {',
    ...base,
    '}',
    '',
    '/* Tema claro (padrao) */',
    ':root {',
    '  color-scheme: light;',
    ...themed.light,
    '}',
    '',
    '/* Tema escuro: manual via [data-theme="dark"] ou automatico pelo sistema */',
    ':root[data-theme="dark"] {',
    '  color-scheme: dark;',
    ...themed.dark,
    '}',
    '',
    '@media (prefers-color-scheme: dark) {',
    '  :root:not([data-theme="light"]) {',
    '    color-scheme: dark;',
    ...themed.dark.map((l) => `  ${l}`),
    '  }',
    '}',
    '',
  ].join('\n');
}

function tailwindFormat({ dictionary }) {
  const list = tokenList(dictionary);
  const lines = [];
  const seen = new Set();
  for (const t of list) {
    const n = names(t.path);
    if (!n || !n.tw || (n.theme && n.theme !== 'light') || seen.has(n.tw)) continue;
    seen.add(n.tw);
    // Media queries nao aceitam var(): breakpoints entram como valor literal.
    const literal = n.tw.startsWith('breakpoint-');
    lines.push(`  --${n.tw}: ${literal ? t.value : `var(--nears-${n.css})`};`);
  }
  const base = Number(list.find((t) => t.key === 'space.base')?.value ?? 4);
  return [
    `/* ${HEADER} */`,
    '/* Tailwind 4 nao tem preset JS: o tema e CSS. Zera a paleta/escalas padrao para',
    '   que so exista o que vem de tokens.json (CLAUDE.md: nunca cor literal em classe). */',
    '@theme inline {',
    '  --color-*: initial;',
    '  --text-*: initial;',
    '  --shadow-*: initial;',
    '  --radius-*: initial;',
    '  --breakpoint-*: initial;',
    '  --leading-*: initial;',
    '  --tracking-*: initial;',
    '  --ease-*: initial;',
    '  --aspect-*: initial;',
    `  --spacing: ${base / 16}rem;`,
    ...lines,
    '  --text-base: var(--nears-text-md);',
    '}',
    '',
  ].join('\n');
}

const FIGMA_TYPE = (path) => {
  const [g, a] = path;
  if (g === 'color' || g === 'semantic') return 'color';
  if (g === 'typography') {
    return { size: 'fontSizes', family: 'fontFamilies', weight: 'fontWeights', leading: 'lineHeights', tracking: 'letterSpacing' }[a] ?? 'other';
  }
  if (g === 'space') return 'spacing';
  if (g === 'radius') return 'borderRadius';
  if (g === 'shadow') return 'boxShadow';
  if (g === 'breakpoint') return 'sizing';
  return 'other';
};

function figmaFormat({ dictionary }) {
  const sets = { global: {}, light: {}, dark: {} };
  const put = (obj, path, leaf) => {
    let cur = obj;
    for (const k of path.slice(0, -1)) cur = cur[k] ??= {};
    cur[path.at(-1)] = leaf;
  };
  for (const t of tokenList(dictionary)) {
    const [g, a] = t.path;
    if (g === 'typography' && (a === 'font' || a === 'fallbackMetrics')) continue;
    const leaf = { value: t.raw, type: FIGMA_TYPE(t.path) };
    if (g === 'semantic') put(sets[a], t.path.slice(2), leaf);
    else put(sets.global, t.path, leaf);
  }
  const out = {
    ...sets,
    $themes: THEMES.map((id) => ({ id, name: id, selectedTokenSets: { global: 'source', [id]: 'enabled' } })),
    $metadata: { tokenSetOrder: ['global', ...THEMES] },
  };
  return `${JSON.stringify(out, null, 2)}\n`;
}

StyleDictionary.registerFormat({ name: 'nears/css', format: cssFormat });
StyleDictionary.registerFormat({ name: 'nears/tailwind', format: tailwindFormat });
StyleDictionary.registerFormat({ name: 'nears/figma', format: figmaFormat });

// -------------------------------------------------------------------- fonte

function fontsModule(resolved, fontsDir, fontFilesDir) {
  const f = (k) => resolved.get(`typography.font.brand.${k}`);
  const head = ['/* eslint-disable */', `// ${HEADER}`];
  if (f('source') === 'system') {
    return [
      ...head,
      '// Modo "system": zero download. --font-brand fica indefinida e a custom',
      '// property --nears-font-brand cai na pilha websafe (tokens.json).',
      'export const fontVariableClass = "";',
      '',
    ].join('\n');
  }
  const src = relative(fontsDir, join(fontFilesDir, f('file'))).split('\\').join('/');
  return [
    ...head,
    "import localFont from 'next/font/local';",
    '',
    '// Uma familia variavel, self-hosted, font-display: swap, preload do unico',
    '// arquivo (peso 400 incluso). size-adjust/ascent/descent/line-gap do fallback',
    '// sao calculados no build pelo next/font (adjustFontFallback), nunca a mao.',
    `// Fonte: ${f('name')} (${f('license')}).`,
    'const brand = localFont({',
    `  src: '${src}',`,
    "  weight: '400 700',",
    "  display: 'swap',",
    '  preload: true,',
    "  variable: '--font-brand',",
    `  adjustFontFallback: '${f('fallback')}',`,
    '});',
    '',
    'export const fontVariableClass = brand.variable;',
    '',
  ].join('\n');
}

// ---------------------------------------------------------------- principal

/**
 * Gera todos os arquivos em memoria: Map<caminho absoluto, conteudo>.
 * `opts` existe para os testes (troca de marca com outro tokens.json).
 */
export async function generate(opts = {}) {
  const tokensPath = opts.tokensPath ?? join(HERE, 'tokens.json');
  const configPath = opts.configPath ?? join(ROOT, 'nears/nears.config.yaml');
  const distDir = opts.distDir ?? join(HERE, 'dist');
  const fontsOut = opts.fontsOut ?? join(ROOT, 'apps/web/app/_generated/fonts.ts');
  const fontFilesDir = opts.fontFilesDir ?? HERE;

  const raw = JSON.parse(await readFile(tokensPath, 'utf8'));
  const config = YAML.parse(await readFile(configPath, 'utf8'));

  const errors = validateTokens(raw, {
    licenses: config.design.typography.licenses,
    fileExists: (file) => existsSync(join(fontFilesDir, file)),
  });
  if (errors.length) {
    const err = new Error(`tokens.json invalido:\n - ${errors.join('\n - ')}`);
    err.errors = errors;
    throw err;
  }

  const tokens = stripNotes(raw);
  const sd = new StyleDictionary({
    tokens,
    log: { verbosity: 'silent', warnings: 'disabled' },
    platforms: {
      css: { transforms: [], files: [{ destination: 'tokens.css', format: 'nears/css' }] },
      tailwind: { transforms: [], files: [{ destination: 'theme.css', format: 'nears/tailwind' }] },
      figma: { transforms: [], files: [{ destination: 'figma.tokens.json', format: 'nears/figma' }] },
    },
  });

  const files = new Map();
  for (const platform of ['css', 'tailwind', 'figma']) {
    for (const out of await sd.formatPlatform(platform)) {
      files.set(join(distDir, out.destination), out.output);
    }
  }
  const resolved = resolveAll(flatten(tokens));
  files.set(fontsOut, fontsModule(resolved, dirname(fontsOut), fontFilesDir));
  return files;
}

async function main() {
  const check = process.argv.includes('--check');
  const files = await generate();
  let drift = 0;
  for (const [file, content] of files) {
    const rel = relative(ROOT, file);
    if (check) {
      const current = existsSync(file) ? await readFile(file, 'utf8') : null;
      if (current !== content) {
        console.error(`DIVERGENTE  ${rel} (rode "pnpm tokens:build" e comite)`);
        drift++;
      } else console.log(`ok          ${rel}`);
    } else {
      await mkdir(dirname(file), { recursive: true });
      await writeFile(file, content);
      console.log(`gerado      ${rel}`);
    }
  }
  if (drift) process.exit(1);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
}
