import { describe, expect, it, vi } from 'vitest';
import { getSnapshot } from '../lib/data/client';
import { graphqlRequest, GraphQLError } from '../lib/data/graphql';
import { toProductCard } from '../lib/data/mappers';
import { z } from 'zod';
import { exampleHref } from '../lib/evolution';
import { getSlugIndex } from '../lib/routing';

describe('mock do data layer', () => {
  it('passa pelo schema do snapshot', async () => {
    const s = await getSnapshot();
    expect(s.products).toHaveLength(24);
    expect(s.departments.length).toBeGreaterThanOrEqual(3);
  });

  it('nao tem conflito de slugs nem slug reservado (gate do build)', async () => {
    const index = await getSlugIndex();
    expect(index.get('departamento-exemplo')?.route).toBe('department');
    expect(index.get('tipo-exemplo')?.route).toBe('category-flat');
    expect(index.get('campanha-exemplo')?.route).toBe('campaign');
    expect(index.get('pagina-exemplo')?.route).toBe('institutional');
    expect(index.get('inexistente')).toBeUndefined();
  });

  it('os links de exemplo do painel existem no mock', async () => {
    const s = await getSnapshot();
    const slugs = new Set([...s.departments, ...s.productTypes, ...s.campaigns, ...s.pages].map((x) => x.slug));
    for (const id of ['department', 'category-flat', 'campaign', 'institutional'] as const) {
      expect(slugs.has(exampleHref[id]!.slice(1))).toBe(true);
    }
    expect(s.products.some((p) => `/${p.slug}/p` === exampleHref.pdp)).toBe(true);
    expect(s.longtails.some((l) => `/b/${l.keyword}` === exampleHref.longtail)).toBe(true);
  });

  it('toda longtail tem texto unico e FAQ (routes.manifest > longtail.requires)', async () => {
    for (const l of (await getSnapshot()).longtails) {
      expect(l.intro.length).toBeGreaterThan(0);
      expect(l.faq.length).toBeGreaterThanOrEqual(3);
    }
  });
});

describe('toProductCard', () => {
  it('usa o nome como alt e so inclui o que existe', async () => {
    const [p] = (await getSnapshot()).products;
    const card = toProductCard(p!, { aspect: 'portrait' });
    expect(card.image.alt).toBe(p!.name);
    expect(card.href).toBe(`/${p!.slug}/p`);
    expect(card).not.toHaveProperty('priority');
  });
});

describe('graphqlRequest', () => {
  const schema = z.object({ n: z.number() });
  const ok = (body: unknown, status = 200) => vi.fn(async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch;

  it('valida a resposta com Zod', async () => {
    const data = await graphqlRequest({ endpoint: 'https://x.test/graphql', query: '{n}', schema, fetcher: ok({ data: { n: 1 } }) });
    expect(data).toEqual({ n: 1 });
  });

  it('rejeita resposta fora do contrato', async () => {
    await expect(graphqlRequest({ endpoint: 'https://x.test', query: '{n}', schema, fetcher: ok({ data: { n: 'x' } }) })).rejects.toThrow(/fora do contrato/);
  });

  it('propaga erros GraphQL e HTTP', async () => {
    await expect(graphqlRequest({ endpoint: 'https://x.test', query: '{n}', schema, fetcher: ok({ errors: [{ message: 'boom' }] }) })).rejects.toThrow('boom');
    await expect(graphqlRequest({ endpoint: 'https://x.test', query: '{n}', schema, fetcher: ok({}, 500) })).rejects.toBeInstanceOf(GraphQLError);
  });

  it('envia o token so no header Authorization', async () => {
    const f = ok({ data: { n: 1 } });
    await graphqlRequest({ endpoint: 'https://x.test', query: '{n}', schema, token: 't0k', fetcher: f });
    const init = (f as unknown as ReturnType<typeof vi.fn>).mock.calls[0]![1] as RequestInit;
    expect((init.headers as Record<string, string>).authorization).toBe('Bearer t0k');
    expect(String(init.body)).not.toContain('t0k');
  });
});
