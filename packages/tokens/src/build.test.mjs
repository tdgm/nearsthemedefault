// @vitest-environment node
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { generate, names } from '../build.mjs';

const dist = (files, name) => [...files].find(([p]) => p.endsWith(name))?.[1] ?? '';
const base = JSON.parse(readFileSync(new URL('../tokens.json', import.meta.url), 'utf8'));

describe('nomes das variaveis', () => {
  it('mapeia grupos para nomes CSS e da namespace do Tailwind', () => {
    expect(names(['color', 'neutral', '500'])).toEqual({ css: 'color-neutral-500', tw: 'color-neutral-500' });
    expect(names(['semantic', 'dark', 'surface'])).toMatchObject({ css: 'color-surface', theme: 'dark' });
    expect(names(['typography', 'size', 'md'])).toEqual({ css: 'text-md', tw: 'text-md' });
    expect(names(['media', 'aspect', 'bannerMobile'])).toEqual({ css: 'aspect-banner-mobile', tw: 'aspect-banner-mobile' });
    expect(names(['typography', 'font', 'brand', 'name'])).toBeNull();
    expect(names(['space', 'base'])).toBeNull();
  });
});

describe('saidas do build', () => {
  it('gera CSS com temas claro e escuro, theme.css do Tailwind e JSON do Figma', async () => {
    const files = await generate();
    const css = dist(files, 'tokens.css');
    expect(css).toContain('--nears-color-neutral-500: #667085;');
    expect(css).toContain('--nears-color-surface: var(--nears-color-neutral-0);');
    expect(css).toContain(':root[data-theme="dark"] {');
    expect(css).toContain('@media (prefers-color-scheme: dark)');
    expect(css).toContain('--nears-font-brand: var(--font-brand, var(--nears-font-system));');
    expect(css).toContain('--nears-target-min-touch: 44px;');

    const theme = dist(files, 'theme.css');
    expect(theme).toContain('@theme inline {');
    expect(theme).toContain('--color-*: initial;');
    expect(theme).toContain('--color-surface: var(--nears-color-surface);');
    expect(theme).toContain('--spacing: 0.25rem;');
    // media query nao aceita var(): breakpoint sai literal
    expect(theme).toContain('--breakpoint-xs: 360px;');
    expect(theme).not.toMatch(/#[0-9a-f]{6}/i); // nenhuma cor literal no tema

    const figma = JSON.parse(dist(files, 'figma.tokens.json'));
    expect(Object.keys(figma)).toEqual(expect.arrayContaining(['global', 'light', 'dark', '$themes', '$metadata']));
    expect(figma.global.color.neutral['500']).toEqual({ value: '#667085', type: 'color' });
    expect(figma.light.surface.value).toBe('{color.neutral.0}');
    expect(Object.keys(figma.light)).toEqual(Object.keys(figma.dark));
  });

  it('modo system nao importa next/font (zero download)', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'nears-tokens-'));
    const t = structuredClone(base);
    t.typography.font.brand.source.value = 'system';
    const tokensPath = join(dir, 'tokens.json');
    await writeFile(tokensPath, JSON.stringify(t));
    const fonts = dist(await generate({ tokensPath, fontsOut: join(dir, 'fonts.ts') }), 'fonts.ts');
    expect(fonts).toContain('export const fontVariableClass = "";');
    expect(fonts).not.toContain('next/font/local');
  });

  it('self-hosted gera next/font/local com swap, preload e fallback calculado', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'nears-tokens-'));
    const t = structuredClone(base);
    t.typography.font.brand.source.value = 'self-hosted';
    const tokensPath = join(dir, 'tokens.json');
    await writeFile(tokensPath, JSON.stringify(t));
    // fontFilesDir aponta para o diretorio que contem o arquivo da fonte
    await mkdir(join(dir, 'fonts'), { recursive: true });
    await writeFile(join(dir, 'fonts', 'brand-variable.woff2'), 'x');
    const files = await generate({ tokensPath, fontFilesDir: dir, fontsOut: join(dir, 'app', 'fonts.ts') });
    const fonts = dist(files, 'fonts.ts');
    expect(fonts).toContain("import localFont from 'next/font/local';");
    expect(fonts).toContain("display: 'swap'");
    expect(fonts).toContain('preload: true');
    expect(fonts).toContain("adjustFontFallback: 'Arial'");
    expect(fonts).toContain("src: '../fonts/brand-variable.woff2'");
  });

  it('build falha com licenca de fonte invalida', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'nears-tokens-'));
    const t = structuredClone(base);
    t.typography.font.brand.license.value = 'Proprietary';
    const tokensPath = join(dir, 'tokens.json');
    await writeFile(tokensPath, JSON.stringify(t));
    await expect(generate({ tokensPath, distDir: dir })).rejects.toThrow(/Licenca da fonte "Proprietary"/);
  });
});

describe('troca de marca por um unico arquivo', () => {
  it('outro tokens.json muda as cores geradas sem tocar em codigo', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'nears-brand-'));
    const t = structuredClone(base);
    t.color.brand['600'].value = '#0B6E4F'; // marca verde
    t.color.accent['600'].value = '#8A2BE2';
    const tokensPath = join(dir, 'tokens.json');
    await writeFile(tokensPath, JSON.stringify(t));
    const css = dist(await generate({ tokensPath }), 'tokens.css');
    expect(css).toContain('--nears-color-brand-600: #0B6E4F;');
    expect(css).toContain('--nears-color-accent-600: #8A2BE2;');
    // semanticos continuam apontando para os mesmos primitivos
    expect(css).toContain('--nears-color-link: var(--nears-color-brand-700);');
  });
});
