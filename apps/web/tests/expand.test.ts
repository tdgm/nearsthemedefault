import { describe, expect, it } from 'vitest';
import { expandTemplate, repeatCountsFor, resolveRepeatLimit } from '../lib/templates/expand';
import { loadAllManifests } from '../lib/manifest';

describe('expandTemplate', () => {
  it('mantem a ordem e numera ocorrencias repetidas', () => {
    const out = expandTemplate(['hero', 'event-banner', 'showcase:tabs', 'event-banner'], {});
    expect(out.map((i) => `${i.id}${i.variant ? `:${i.variant}` : ''}#${i.occurrence}`)).toEqual([
      'hero#0',
      'event-banner#0',
      'showcase:tabs#0',
      'event-banner#1',
    ]);
    expect(new Set(out.map((i) => i.key)).size).toBe(out.length);
  });

  it('repete os blocos por item ate o limite', () => {
    const entries = [{ repeat: { over: 'departments', blocks: ['section-title', 'banner-grid'] } }];
    const out = expandTemplate(entries, { departments: 2 });
    expect(out.map((i) => `${i.id}@${i.repeatIndex}`)).toEqual(['section-title@0', 'banner-grid@0', 'section-title@1', 'banner-grid@1']);
  });

  it('over sem contagem vira zero repeticoes', () => {
    expect(expandTemplate([{ repeat: { over: 'x', blocks: ['faq'] } }], {})).toEqual([]);
  });
});

describe('limite de repeticoes', () => {
  it('le o numero literal ou o caminho na config', () => {
    expect(resolveRepeatLimit(3, {})).toBe(3);
    expect(resolveRepeatLimit({ from: 'a.b' }, { a: { b: 4 } })).toBe(4);
    expect(resolveRepeatLimit(undefined, {})).toBeUndefined();
    expect(() => resolveRepeatLimit({ from: 'a.c' }, { a: {} })).toThrow(/nao e numero/);
  });

  it('a home respeita composition.home.featuredDepartments (ADR 0006)', () => {
    const { config, sections } = loadAllManifests();
    const entries = sections.templates.home!.sections;
    const featured = config.composition.home.featuredDepartments;
    expect(repeatCountsFor(entries, { departments: featured + 5 }, config)).toEqual({ departments: featured });
    expect(repeatCountsFor(entries, { departments: 2 }, config)).toEqual({ departments: 2 });
  });
});
