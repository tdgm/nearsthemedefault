// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import YAML from 'yaml';
import {
  contrastRatio,
  evaluatePairs,
  flatten,
  hexToRgb,
  resolveAll,
  stripNotes,
  validateTokens,
} from './core.mjs';

const tokens = JSON.parse(readFileSync(new URL('../tokens.json', import.meta.url), 'utf8'));
const contracts = YAML.parse(readFileSync(new URL('../../../nears/contracts.yaml', import.meta.url), 'utf8'));
const { contrastPairs, contrastMin } = contracts.gates.accessibility;
const clone = () => structuredClone(tokens);
const LICENSES = ['OFL-1.1', 'Apache-2.0'];
const resolvedOf = (t) => resolveAll(flatten(stripNotes(t)));

describe('contraste WCAG', () => {
  it('preto sobre branco e 21:1 e a razao e simetrica', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(contrastRatio('#FFFFFF', '#000000')).toBeCloseTo(21, 5);
  });

  it('iguais dao 1:1', () => {
    expect(contrastRatio('#67717D', '#67717D')).toBeCloseTo(1, 5);
  });

  it('neutral.500 sobre branco passa 4.5:1 (ADR 0004)', () => {
    expect(contrastRatio('#67717D', '#FFFFFF')).toBeGreaterThan(4.5);
  });

  it('aceita #RGB e rejeita cor que nao e hex', () => {
    expect(hexToRgb('#fff')).toEqual([1, 1, 1]);
    expect(() => hexToRgb('rgb(0,0,0)')).toThrow(/Cor invalida/);
  });
});

describe('referencias', () => {
  it('stripNotes tira $schema, meta, notas de grupo e note dos tokens', () => {
    const out = stripNotes(tokens);
    expect(out.$schema).toBeUndefined();
    expect(out.meta).toBeUndefined();
    expect(out.semantic.$note).toBeUndefined();
    expect(out.color.neutral['500']).toEqual({ value: '#67717D' });
  });

  it('resolve referencias aninhadas e dentro de strings', () => {
    const flat = new Map([
      ['a', '#111111'],
      ['b', '{a}'],
      ['c', 'var(--x, {b})'],
    ]);
    const r = resolveAll(flat);
    expect(r.get('b')).toBe('#111111');
    expect(r.get('c')).toBe('var(--x, #111111)');
  });

  it('referencia circular e erro', () => {
    expect(() => resolveAll(new Map([['a', '{b}'], ['b', '{a}']]))).toThrow(/circular/);
  });

  it('referencia para token inexistente e erro', () => {
    expect(() => resolveAll(new Map([['a', '{nao.existe}']]))).toThrow(/sem token/);
  });
});

describe('pares de contraste de contracts.yaml', () => {
  it('todos passam nos dois temas com os tokens atuais', () => {
    const rows = evaluatePairs(resolvedOf(tokens), contrastPairs, contrastMin);
    const failing = rows.filter((r) => !r.ok).map((r) => `${r.theme} ${r.fg}/${r.bg} ${r.ratio.toFixed(2)}`);
    expect(failing).toEqual([]);
    expect(rows.filter((r) => r.theme === 'light')).toHaveLength(rows.length / 2);
  });

  it('detecta um par que quebra (cor de preco clara demais)', () => {
    const t = clone();
    t.semantic.light.price.value = '{color.neutral.300}';
    const rows = evaluatePairs(resolvedOf(t), contrastPairs, contrastMin);
    expect(rows.some((r) => !r.ok && r.fg === 'price' && r.theme === 'light')).toBe(true);
  });

  it('erro claro se o par usa token semantico inexistente', () => {
    expect(() => evaluatePairs(resolvedOf(tokens), [{ fg: 'fantasma', bg: ['surface'], min: 'text' }], contrastMin)).toThrow(
      /fantasma/,
    );
  });
});

describe('validateTokens', () => {
  const opts = { licenses: LICENSES, fileExists: () => true };

  it('tokens atuais sao validos', () => {
    expect(validateTokens(tokens, opts)).toEqual([]);
  });

  it('rejeita licenca fora de OFL-1.1/Apache-2.0', () => {
    const t = clone();
    t.typography.font.brand.license.value = 'GPL-3.0';
    expect(validateTokens(t, opts).join()).toMatch(/Licenca da fonte "GPL-3.0"/);
  });

  it('aceita Apache-2.0', () => {
    const t = clone();
    t.typography.font.brand.license.value = 'Apache-2.0';
    expect(validateTokens(t, opts)).toEqual([]);
  });

  it('self-hosted exige o arquivo woff2 existir', () => {
    const t = clone();
    t.typography.font.brand.source.value = 'self-hosted';
    expect(validateTokens(t, { ...opts, fileExists: () => false }).join()).toMatch(/nao encontrado/);
    expect(validateTokens(t, opts)).toEqual([]);
  });

  it('self-hosted exige extensao .woff2', () => {
    const t = clone();
    t.typography.font.brand.source.value = 'self-hosted';
    t.typography.font.brand.file.value = 'fonts/x.ttf';
    expect(validateTokens(t, opts).join()).toMatch(/woff2/);
  });

  it('temas com chaves diferentes falham', () => {
    const t = clone();
    delete t.semantic.dark['price-list'];
    expect(validateTokens(t, opts).join()).toMatch(/Tema dark sem as chaves: price-list/);
  });

  it('referencia quebrada falha com a mensagem do resolvedor', () => {
    const t = clone();
    t.semantic.light.surface.value = '{color.neutral.9999}';
    expect(validateTokens(t, opts).join()).toMatch(/sem token/);
  });

  it('cor que nao e hex falha (contraste nao seria calculavel)', () => {
    const t = clone();
    t.color.brand['500'].value = 'rgb(63,91,224)';
    expect(validateTokens(t, opts).join()).toMatch(/nao e hex/);
  });

  it('escala neutra incompleta falha', () => {
    // Tira as referencias ao passo antes de remove-lo, para isolar a checagem
    // de escala completa da checagem de referencia quebrada.
    const t = JSON.parse(JSON.stringify(tokens).replaceAll('{color.neutral.300}', '{color.neutral.200}'));
    delete t.color.neutral['300'];
    expect(validateTokens(t, opts).join()).toMatch(/passo 300/);
  });
});
