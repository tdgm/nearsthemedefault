// @vitest-environment node
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { loadManifests } from '@nears/manifests/node';
import { RegistryError, createRegistry, defineSpec, pendingSections } from './index.ts';
import { sectionSpecs } from './specs.ts';

const root = resolve(__dirname, '../../..');
const manifests = loadManifests({ nearsDir: resolve(root, 'nears'), tokensFile: resolve(root, 'packages/tokens/tokens.json') });

const ok = defineSpec({
  id: 'benefit-bar',
  schema: z.object({}),
  meta: { priority: 'high', cwv: { reservedHeight: 44 }, a11y: { role: 'list' } },
  story: 'packages/sections/src/benefit-bar.stories.tsx',
});
const exists = () => true;

describe('createRegistry', () => {
  it('aceita section completa e consistente com o manifest', () => {
    const registry = createRegistry(manifests, [ok], exists);
    expect(registry.get('benefit-bar')).toBe(ok);
    expect(pendingSections(manifests, registry)).not.toContain('benefit-bar');
  });

  it('registra as globais (Fase 4) de conteudo (Fase 5) e da PDP (Fase 6)', () => {
    const registry = createRegistry(manifests, sectionSpecs, exists);
    expect([...registry.keys()].sort()).toEqual(
      [
        'banner-full', 'banner-grid', 'benefit-bar', 'breadcrumb', 'category-hub', 'customer-service', 'event-banner', 'faq',
        'footer', 'header', 'hero', 'minicart', 'nav-drawer', 'product-card', 'product-grid', 'promo-bar', 'quick-filter',
        'related-links', 'section-title', 'showcase', 'text-seo',
        'pdp-gallery', 'pdp-buybox', 'pdp-shipping', 'pdp-details', 'pdp-reviews', 'pdp-bundle', 'pdp-related',
      ].sort(),
    );
    expect(pendingSections(manifests, registry)).not.toContain('hero');
    expect(pendingSections(manifests, registry)).toEqual([]);
  });

  const failing = (patch: Record<string, unknown>) => () =>
    createRegistry(manifests, [{ ...ok, ...patch } as unknown as typeof ok], exists);

  it.each([
    ['id fora do manifest', { id: 'nao-existe' }, 'nao existe em sections.registry.yaml'],
    ['sem schema', { schema: undefined }, 'nao exporta `schema`'],
    ['sem meta', { meta: undefined }, 'nao exporta `meta`'],
    ['priority divergente', { meta: { ...ok.meta, priority: 'critical' } }, 'diverge do manifest'],
    ['sem cwv', { meta: { ...ok.meta, cwv: {} } }, 'meta.cwv ausente'],
    ['sem a11y', { meta: { ...ok.meta, a11y: undefined } }, 'meta.a11y ausente'],
    ['sem story', { story: '' }, 'nao declara a story'],
  ])('rejeita %s', (_n, patch, message) => {
    const fn = failing(patch);
    expect(fn).toThrow(RegistryError);
    expect(fn).toThrow(message);
  });

  it('rejeita story que nao existe em disco', () => {
    expect(() => createRegistry(manifests, [ok], () => false)).toThrow('story nao encontrada');
  });

  it('rejeita registro duplicado', () => {
    expect(() => createRegistry(manifests, [ok, ok], exists)).toThrow('registrada duas vezes');
  });
});
