import { describe, expect, it } from 'vitest';
import { parseCollectionQuery, queryCollection, searchProducts } from '../lib/data/collections';

const base = { filters: {}, sort: 'relevance', page: 1, pageSize: 5 };
const facets = ['category', 'brand', 'price'];

describe('queryCollection', () => {
  it('filtra pelo escopo e pagina', async () => {
    const all = await queryCollection({}, base, facets);
    expect(all.total).toBe(24);
    expect(all.products).toHaveLength(5);
    expect(all.pageCount).toBe(5);
    const dept = await queryCollection({ department: 'departamento-exemplo' }, base, facets);
    expect(dept.total).toBe(8);
    expect(dept.products.every((p) => p.department === 'departamento-exemplo')).toBe(true);
  });

  it('pagina fora do intervalo cai na ultima', async () => {
    const r = await queryCollection({}, { ...base, page: 99 }, facets);
    expect(r.page).toBe(r.pageCount);
  });

  it('ordena por preco e por mais novos', async () => {
    const asc = await queryCollection({}, { ...base, sort: 'price_asc', pageSize: 24 }, facets);
    expect(asc.products.map((p) => p.price)).toEqual([...asc.products.map((p) => p.price)].sort((a, b) => a - b));
    const newest = await queryCollection({}, { ...base, sort: 'newest', pageSize: 24 }, facets);
    expect(newest.products[0]!.createdAt >= newest.products[1]!.createdAt).toBe(true);
  });

  it('aplica facetas e devolve contagens por opcao', async () => {
    const r = await queryCollection({}, { ...base, pageSize: 24, filters: { brand: ['marca-1'] } }, facets, { brand: 'Marca' });
    expect(r.total).toBe(8);
    expect(r.facets.find((f) => f.id === 'brand')?.label).toBe('Marca');
    expect(r.facets.find((f) => f.id === 'brand')?.options.map((o) => o.count).reduce((a, b) => a + b, 0)).toBe(24);
    // faceta de preco por faixas
    const cheap = await queryCollection({}, { ...base, pageSize: 24, filters: { price: ['ate-100'] } }, facets);
    expect(cheap.products.every((p) => p.price <= 100)).toBe(true);
  });
});

describe('parseCollectionQuery', () => {
  it('limita ordenacao, pagina e filtros a valores seguros', () => {
    const q = parseCollectionQuery({ sort: 'DROP', page: '-3', brand: ['a', 'b'], intruso: 'x' }, ['brand'], 24);
    expect(q.sort).toBe('relevance');
    expect(q.page).toBe(1);
    expect(q.filters).toEqual({ brand: ['a', 'b'] });
    expect(parseCollectionQuery({ page: '999999' }, [], 24).page).toBe(1000);
    expect(parseCollectionQuery({ sort: 'price_desc', page: '2' }, [], 24)).toMatchObject({ sort: 'price_desc', page: 2 });
  });
});

describe('searchProducts', () => {
  it('encontra por todos os termos, sem acento e sem caixa', async () => {
    expect((await searchProducts('PRODUTO 12', { sort: 'relevance', page: 1, pageSize: 24 })).total).toBe(1);
    expect((await searchProducts('marca 2', { sort: 'relevance', page: 1, pageSize: 24 })).total).toBe(8);
    expect((await searchProducts('camiseta', { sort: 'relevance', page: 1, pageSize: 24 })).total).toBe(0);
    expect((await searchProducts('   ', { sort: 'relevance', page: 1, pageSize: 24 })).total).toBe(0);
  });
});
