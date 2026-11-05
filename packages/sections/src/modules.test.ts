// @vitest-environment node
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadManifests } from '@nears/manifests/node';
import { createRegistry, sectionModules, sectionSpecs } from './index.ts';

const root = resolve(__dirname, '../../..');
const manifests = loadManifests({ nearsDir: resolve(root, 'nears'), tokensFile: resolve(root, 'packages/tokens/tokens.json') });
const declared = new Map(
  [...manifests.sections.sections, ...manifests.sections.pdpSections, ...manifests.sections.globals].map((s) => [s.id, s]),
);

describe('sections implementadas', () => {
  it('cada modulo tem componente (function) e as specs batem 1:1 com os modulos', () => {
    expect(sectionModules.map((m) => m.id).sort()).toEqual(sectionSpecs.map((s) => s.id).sort());
    for (const mod of sectionModules) expect(typeof mod.Component, mod.id).toBe('function');
  });

  it('passam pelo registry (priority, cwv, a11y, story em disco)', () => {
    expect(() => createRegistry(manifests, sectionModules, (p) => existsSync(resolve(root, p)))).not.toThrow();
  });

  // Paridade: o schema escrito a mao nao pode divergir das props do manifest.
  it.each(sectionModules.map((m) => [m.id, m] as const))('%s: schema cobre exatamente as props do manifest', (id, mod) => {
    const shape = (mod.schema as unknown as { shape: Record<string, unknown> }).shape;
    expect(Object.keys(shape).sort(), id).toEqual(Object.keys(declared.get(id)!.props).sort());
  });
});
