import { render, screen } from '@testing-library/react';
import { describe, expect, it, onTestFinished, vi } from 'vitest';
import { getProducts } from '../lib/data/client';
import { mockVariantsFor } from '../lib/data/mock';
import { loadAllManifests, loadConfig, type NearsConfig } from '../lib/manifest';
import { buildPdpView } from '../lib/templates/pdp-content';
import { expandTemplate } from '../lib/templates/expand';
import { renderInstances } from '../lib/templates/render';
import { normalizeCep, quoteShipping } from '../lib/data/shipping';
import { POST } from '../app/api/cart/items/route';

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const withAxes = (): NearsConfig => {
  const config = structuredClone(loadConfig());
  config.catalog.variantAxes = [
    { id: 'color', label: 'Cor', display: 'swatch', schemaOrg: 'color' },
    { id: 'size', label: 'Tamanho', display: 'option', schemaOrg: 'size' },
  ];
  config.catalog.guide = { enabled: true, label: 'Medidas' };
  return config;
};

const instances = () => expandTemplate(loadAllManifests().sections.templates.pdp?.sections ?? [], {});

describe('template pdp (manifest)', () => {
  it('declara as sections na ordem do manifest', () => {
    expect(instances().map((i) => i.id)).toEqual([
      'breadcrumb', 'pdp-gallery', 'pdp-buybox', 'pdp-shipping', 'pdp-pickup', 'pdp-details', 'pdp-reviews', 'pdp-bundle', 'pdp-related', 'faq',
    ]);
  });

  it('produto desconhecido nao tem view (vira 404)', async () => {
    expect(await buildPdpView('nao-existe')).toBeNull();
  });

  it('toda section do template passa pelo schema e renderiza com UM h1 (nome do produto)', async () => {
    const view = (await buildPdpView('produto-exemplo'))!;
    render(<>{renderInstances(instances(), (i) => view.propsFor(i))}</>);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Produto 1');
    for (const id of ['pdp-title', 'frete-titulo', 'detalhes-titulo', 'avaliacoes-titulo']) {
      expect(document.getElementById(id), id).not.toBeNull();
    }
    // hierarquia sem pular nivel: nenhum h4+ sem h3 antes, e h3 so depois de h2
    const levels = screen.getAllByRole('heading').map((h) => Number(h.tagName[1]));
    levels.reduce((prev, cur) => {
      expect(cur - prev).toBeLessThanOrEqual(1);
      return cur;
    });
  });

  it('breadcrumb: Inicio > departamento > categoria > produto (ultimo sem link)', async () => {
    const view = (await buildPdpView('produto-exemplo'))!;
    const props = view.propsFor({ id: 'breadcrumb' }) as { items: { label: string; href?: string }[] };
    expect(props.items.map((i) => i.label)).toEqual(['Início', 'Departamento exemplo', 'Categoria exemplo', 'Subcategoria exemplo', 'Produto 1']);
    expect(props.items.at(-1)?.href).toBeUndefined();
  });

  it('galeria: alt gerado por regra a partir do nome/marca e CTA do vocabulario', async () => {
    const view = (await buildPdpView('produto-exemplo'))!;
    const gallery = view.propsFor({ id: 'pdp-gallery' }) as { images: { alt: string }[] };
    expect(gallery.images[0]?.alt).toBe('Produto 1 Marca');
    expect(gallery.images.every((i) => i.alt.length > 0)).toBe(true);
    const buybox = view.propsFor({ id: 'pdp-buybox' }) as { cta: string; addToCartAction: string };
    expect(buybox.cta).toBe(loadConfig().vocabulary.addToCart);
    expect(buybox.addToCartAction).toBe('/api/cart/items');
  });

  it('sem eixos no catalogo nao ha seletor; com eixos ha um radiogroup por eixo, na ordem do nicho', async () => {
    const generic = (await buildPdpView('produto-exemplo'))!;
    expect((generic.propsFor({ id: 'pdp-buybox' }) as { variantSelectors: unknown[] }).variantSelectors).toEqual([]);

    // O catalogo padrao nao tem eixos: o produto passa a oferecer os do nicho (restaurado ao fim).
    const config = withAxes();
    const product = (await getProducts()).find((p) => p.slug === 'produto-exemplo')!;
    const original = product.variants;
    product.variants = mockVariantsFor(config.catalog.variantAxes);
    onTestFinished(() => {
      product.variants = original;
    });
    const view = (await buildPdpView('produto-exemplo', config))!;
    const buybox = view.propsFor({ id: 'pdp-buybox' }) as { variantSelectors: { id: string }[]; guideHref?: string };
    expect(buybox.variantSelectors.map((v) => v.id)).toEqual(['color', 'size']);
    render(<>{renderInstances(expandTemplate(['pdp-buybox'], {}), (i) => view.propsFor(i))}</>);
    expect(screen.getAllByRole('radiogroup')).toHaveLength(2);
  });

  it('guia so aparece com catalog.guide.enabled e o produto ter guia', async () => {
    const generic = (await buildPdpView('produto-exemplo'))!;
    expect((generic.propsFor({ id: 'pdp-details' }) as { guide?: unknown }).guide).toBeUndefined();
    expect((generic.propsFor({ id: 'pdp-buybox' }) as { guideHref?: string }).guideHref).toBeUndefined();
  });

  it('produto sem avaliacoes nao tem agregado e a section explica o vazio', async () => {
    const client = await import('../lib/data/client');
    const all = await client.getProducts();
    const base = structuredClone(all[3]!);
    delete base.rating;
    base.reviews = [];
    const spy = vi.spyOn(client, 'getProducts').mockResolvedValue(all.map((p) => (p.slug === base.slug ? base : p)));
    const view = (await buildPdpView(base.slug))!;
    spy.mockRestore();
    const props = view.propsFor({ id: 'pdp-reviews' }) as { aggregate?: unknown; items: unknown[] };
    expect(props.aggregate).toBeUndefined();
    expect(props.items).toEqual([]);
  });

  it('bundle e relacionados nunca incluem o proprio produto', async () => {
    const view = (await buildPdpView('produto-exemplo'))!;
    for (const id of ['pdp-bundle', 'pdp-related']) {
      const { products } = view.propsFor({ id }) as { products: { href: string }[] };
      expect(products.length).toBeGreaterThan(0);
      expect(products.map((p) => p.href)).not.toContain('/produto-exemplo/p');
    }
  });

  it('FAQ padrao tem ao menos 3 perguntas (FAQPage)', async () => {
    const view = (await buildPdpView('produto-exemplo'))!;
    expect((view.propsFor({ id: 'faq' }) as { items: unknown[] }).items.length).toBeGreaterThanOrEqual(3);
  });

  it('meta description e o 1o paragrafo da descricao (resposta direta, GEO)', async () => {
    const view = (await buildPdpView('produto-exemplo'))!;
    expect(view.description).toMatch(/^Produto 1 é um item de exemplo/);
    expect(view.description).not.toContain('\n');
  });
});

describe('frete', () => {
  it('normaliza CEP com ou sem hifen e rejeita o resto', () => {
    expect(normalizeCep('01310-100')).toBe('01310100');
    expect(normalizeCep('01310100')).toBe('01310100');
    expect(normalizeCep('123')).toBeNull();
    expect(normalizeCep(undefined)).toBeNull();
  });

  it('sem CEP nao ha cotacao; CEP invalido volta erro; valido volta opcoes', async () => {
    expect(await quoteShipping(undefined, 100)).toBeUndefined();
    expect(await quoteShipping('', 100)).toBeUndefined();
    expect(await quoteShipping('12', 100)).toEqual({ error: 'Informe um CEP válido com 8 dígitos.' });
    const quote = await quoteShipping('01310-100', 100);
    expect(quote && 'options' in quote && quote.options.length).toBeGreaterThanOrEqual(2);
  });

  it('frete padrao e gratis a partir do minimo', async () => {
    const cheap = await quoteShipping('01310100', 100);
    const rich = await quoteShipping('01310100', 500);
    const price = (q: typeof cheap) => (q && 'options' in q ? q.options[0]?.price : undefined);
    expect(price(cheap)).toBeGreaterThan(0);
    expect(price(rich)).toBe(0);
  });
});

describe('POST /api/cart/items (mock)', () => {
  const post = (body: Record<string, string>, headers: Record<string, string> = {}) =>
    POST(new Request('http://localhost:3000/api/cart/items', { method: 'POST', body: new URLSearchParams(body), headers }));

  it('JSON quando o cliente pede JSON', async () => {
    const res = await post({ sku: 'S1', quantity: '2' }, { accept: 'application/json' });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, sku: 'S1', quantity: 2 });
  });

  it('sem JS: 303 de volta para a mesma origem; referer externo volta para a home', async () => {
    const back = await post({ sku: 'S1' }, { referer: 'http://localhost:3000/produto-exemplo/p' });
    expect(back.status).toBe(303);
    expect(back.headers.get('location')).toBe('http://localhost:3000/produto-exemplo/p');
    const evil = await post({ sku: 'S1' }, { referer: 'https://evil.example/x' });
    expect(evil.headers.get('location')).toBe('http://localhost:3000/');
  });

  it('corpo invalido: 400', async () => {
    expect((await post({ quantity: '0' }, { accept: 'application/json' })).status).toBe(400);
    expect((await post({ quantity: 'abc' }, { accept: 'application/json' })).status).toBe(400);
  });
});
