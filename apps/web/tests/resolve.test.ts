import { describe, expect, it } from 'vitest';
import { allSegmentPaths, isCampaignActive, resolveLongtail, resolveProduct, resolveSegments } from '../lib/routing/resolve';

describe('resolveSegments', () => {
  it('resolve cada forma de URL pela fonte do 1o segmento', async () => {
    expect((await resolveSegments(['departamento-exemplo']))?.route).toBe('department');
    expect((await resolveSegments(['departamento-exemplo', 'categoria-exemplo']))?.route).toBe('department-category');
    expect((await resolveSegments(['departamento-exemplo', 'categoria-exemplo', 'sub-exemplo']))?.route).toBe('department-category-sub');
    expect((await resolveSegments(['tipo-exemplo']))?.route).toBe('category-flat');
    expect((await resolveSegments(['campanha-exemplo']))?.route).toBe('campaign');
    expect((await resolveSegments(['campanha-exemplo', 'segmento-exemplo']))?.route).toBe('campaign-segment');
    expect((await resolveSegments(['pagina-exemplo']))?.route).toBe('institutional');
  });

  it('slug fora do indice, ou 2o segmento fora da fonte, e null (404 real)', async () => {
    expect(await resolveSegments(['nao-existe'])).toBeNull();
    expect(await resolveSegments([])).toBeNull();
    expect(await resolveSegments(['departamento-exemplo', 'nao-existe'])).toBeNull();
    expect(await resolveSegments(['departamento-exemplo', 'categoria-exemplo', 'nao-existe'])).toBeNull();
    // o 2o segmento de um departamento nao e procurado entre campanhas
    expect(await resolveSegments(['departamento-exemplo', 'segmento-exemplo'])).toBeNull();
    // eixo plano sem secondLevelAttribute nao tem nivel 2; paginas institucionais nao tem filhos
    expect(await resolveSegments(['tipo-exemplo', 'qualquer'])).toBeNull();
    expect(await resolveSegments(['pagina-exemplo', 'filho'])).toBeNull();
    expect(await resolveSegments(['campanha-exemplo', 'segmento-exemplo', 'x'])).toBeNull();
  });

  it('slugs reservados nunca resolvem', async () => {
    for (const slug of ['s', 'b', 'api', 'checkout', 'design-system']) expect(await resolveSegments([slug])).toBeNull();
  });

  it('longtail e produto', async () => {
    expect((await resolveLongtail('palavra-chave-exemplo'))?.route).toBe('longtail');
    expect(await resolveLongtail('x')).toBeNull();
    expect((await resolveProduct('produto-exemplo'))?.route).toBe('pdp');
    expect(await resolveProduct('x')).toBeNull();
  });

  it('allSegmentPaths cobre todos os niveis sem repetir caminho', async () => {
    const paths = (await allSegmentPaths()).map((p) => p.join('/'));
    expect(new Set(paths).size).toBe(paths.length);
    expect(paths).toContain('departamento-exemplo/categoria-exemplo/sub-exemplo');
    expect(paths).toContain('campanha-exemplo/segmento-exemplo');
  });
});

describe('isCampaignActive', () => {
  const c = { startsAt: '2026-06-01T00:00:00-03:00', endsAt: '2026-06-30T23:59:59-03:00' };
  it('so vale dentro da janela', () => {
    expect(isCampaignActive(c, new Date('2026-06-15T12:00:00-03:00'))).toBe(true);
    expect(isCampaignActive(c, new Date('2026-05-31T12:00:00-03:00'))).toBe(false);
    expect(isCampaignActive(c, new Date('2026-07-01T00:00:01-03:00'))).toBe(false);
  });
});
