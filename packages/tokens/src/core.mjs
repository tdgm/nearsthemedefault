// Nucleo do pacote de tokens: resolucao de referencias, matematica de contraste
// WCAG e validacoes. JS puro, sem dependencias, para rodar no build, no gate
// `pnpm tokens:contrast` e nos testes sem precisar do Style Dictionary.
// Docs: docs/adr/0004-contraste-e-tema-escuro.md e 0011-build-de-tokens.md.

export const THEMES = ['light', 'dark'];

/** Um "token" e qualquer objeto com a chave `value`. */
export const isToken = (node) =>
  node !== null && typeof node === 'object' && !Array.isArray(node) && 'value' in node;

/**
 * Remove o que nao e token: `$schema`, `meta`, qualquer chave iniciada em `$`
 * (notas de grupo) e a chave `note` dentro de cada token.
 */
export function stripNotes(tokens) {
  const walk = (node) => {
    if (isToken(node)) return { value: node.value };
    const out = {};
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith('$') || k === 'meta') continue;
      if (v !== null && typeof v === 'object') out[k] = walk(v);
    }
    return out;
  };
  return walk(tokens);
}

/** Achata a arvore em `Map<"color.neutral.500", valorBruto>`. */
export function flatten(tree, prefix = '', out = new Map()) {
  for (const [k, v] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (isToken(v)) out.set(path, v.value);
    else if (v !== null && typeof v === 'object') flatten(v, path, out);
  }
  return out;
}

const REF = /\{([^{}]+)\}/g;

/** Resolve `{a.b.c}` recursivamente (inclusive dentro de strings maiores). */
export function resolveAll(flat) {
  const resolved = new Map();
  const resolve = (path, stack) => {
    if (resolved.has(path)) return resolved.get(path);
    if (stack.includes(path)) {
      throw new Error(`Referencia circular: ${[...stack, path].join(' -> ')}`);
    }
    const raw = flat.get(path);
    if (raw === undefined) {
      throw new Error(`Referencia sem token: {${path}}${stack.length ? ` (usada em ${stack.at(-1)})` : ''}`);
    }
    let value = raw;
    if (typeof raw === 'string' && raw.includes('{')) {
      const whole = raw.match(/^\{([^{}]+)\}$/);
      value = whole
        ? resolve(whole[1], [...stack, path])
        : raw.replace(REF, (_, ref) => String(resolve(ref, [...stack, path])));
    }
    resolved.set(path, value);
    return value;
  };
  for (const path of flat.keys()) resolve(path, []);
  return resolved;
}

/** Tokens semanticos de um tema: `Map<"surface", "#FFFFFF">`. */
export function themeColors(resolved, theme) {
  const prefix = `semantic.${theme}.`;
  const out = new Map();
  for (const [path, value] of resolved) {
    if (path.startsWith(prefix)) out.set(path.slice(prefix.length), value);
  }
  return out;
}

// ---------------------------------------------------------------- contraste

export function hexToRgb(hex) {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(hex).trim());
  if (!m) throw new Error(`Cor invalida para calculo de contraste: "${hex}" (use #RGB ou #RRGGBB)`);
  const h = m[1].length === 3 ? [...m[1]].map((c) => c + c).join('') : m[1];
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
}

export function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Avalia os pares de contracts.yaml > gates.accessibility.contrastPairs nos
 * dois temas. `min` do par e a chave de `contrastMin` (text 4.5, ui 3.0).
 * Retorna uma linha por par x fundo x tema, com `ok` e `ratio`.
 */
export function evaluatePairs(resolved, pairs, contrastMin) {
  const rows = [];
  for (const theme of THEMES) {
    const colors = themeColors(resolved, theme);
    for (const pair of pairs) {
      const required = contrastMin[pair.min];
      if (required === undefined) throw new Error(`Par "${pair.fg}" usa min "${pair.min}" inexistente em contrastMin`);
      for (const bg of pair.bg) {
        for (const name of [pair.fg, bg]) {
          if (!colors.has(name)) throw new Error(`Token semantico "${name}" nao existe no tema ${theme}`);
        }
        const ratio = contrastRatio(colors.get(pair.fg), colors.get(bg));
        rows.push({ theme, fg: pair.fg, bg, min: pair.min, required, ratio, ok: ratio >= required });
      }
    }
  }
  return rows;
}

// --------------------------------------------------------------- validacao

const FONT_SOURCES = ['self-hosted', 'system'];
const FALLBACKS = ['Arial', 'Times New Roman'];
const NEUTRAL_STEPS = ['0', '50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '1000'];

/**
 * Valida o que o schema Zod da Fase 2 ainda nao cobre. Retorna lista de
 * mensagens (vazia = ok). `opts.licenses` vem de nears.config.yaml >
 * design.typography.licenses; `opts.fileExists(path)` e injetado pelo build.
 */
export function validateTokens(tokens, opts) {
  const errors = [];
  let resolved;
  try {
    resolved = resolveAll(flatten(stripNotes(tokens)));
  } catch (e) {
    return [e.message];
  }

  // Fonte (CLAUDE.md > Performance; ADR 0001).
  const font = (k) => resolved.get(`typography.font.brand.${k}`);
  const source = font('source');
  if (!FONT_SOURCES.includes(source)) {
    errors.push(`typography.font.brand.source "${source}" invalido (use ${FONT_SOURCES.join(' | ')})`);
  }
  if (!opts.licenses.includes(font('license'))) {
    errors.push(
      `Licenca da fonte "${font('license')}" nao aceita. Permitidas: ${opts.licenses.join(', ')} (docs/adr/0001)`,
    );
  }
  if (!FALLBACKS.includes(font('fallback'))) {
    errors.push(`typography.font.brand.fallback "${font('fallback')}" invalido (use ${FALLBACKS.join(' | ')})`);
  }
  if (source === 'self-hosted') {
    const file = font('file');
    if (typeof file !== 'string' || !file.endsWith('.woff2')) {
      errors.push(`typography.font.brand.file "${file}" deve ser um .woff2`);
    } else if (opts.fileExists && !opts.fileExists(file)) {
      errors.push(
        `Arquivo da fonte nao encontrado: packages/tokens/${file}. Adicione o woff2 ou use source: "system" (zero download).`,
      );
    }
  }

  // Temas com exatamente as mesmas chaves (ADR 0004).
  const light = [...themeColors(resolved, 'light').keys()].sort();
  const dark = [...themeColors(resolved, 'dark').keys()].sort();
  const missingInDark = light.filter((k) => !dark.includes(k));
  const missingInLight = dark.filter((k) => !light.includes(k));
  if (missingInDark.length) errors.push(`Tema dark sem as chaves: ${missingInDark.join(', ')}`);
  if (missingInLight.length) errors.push(`Tema light sem as chaves: ${missingInLight.join(', ')}`);

  // Escala neutra completa e cores em hex (necessario para calcular contraste).
  for (const step of NEUTRAL_STEPS) {
    if (!resolved.has(`color.neutral.${step}`)) errors.push(`Escala neutral sem o passo ${step}`);
  }
  for (const [path, value] of resolved) {
    if (!path.startsWith('color.') && !path.startsWith('semantic.')) continue;
    if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(String(value))) {
      errors.push(`${path} = "${value}" nao e hex (#RGB ou #RRGGBB)`);
    }
  }
  return errors;
}
