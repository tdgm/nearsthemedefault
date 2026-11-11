import type { Metadata } from 'next';
import { Suspense, type ReactNode } from 'react';
import { Container } from '@nears/ui';
import { quotePickup } from '../data/pickup';
import { quoteShipping } from '../data/shipping';
import { loadAllManifests } from '../manifest';
import { JsonLdScript, buildMetadata, breadcrumbNode, enforceGeoCompleteness, faqNode, getSeoContext, graph, organizationNode, productNode } from '../seo';
import { buildPdpView, type PdpView } from './pdp-content';
import { expandTemplate, type SectionInstance } from './expand';
import { renderInstances } from './render';

type RawQuery = Record<string, string | string[] | undefined>;

const GALLERY_GROUP = ['pdp-gallery', 'pdp-buybox'];
// pdp-shipping/pdp-pickup saem daqui: sao renderizados dinamicamente (leem ?cep=
// dentro de Suspense) - ver DynamicFulfillment abaixo.
const DYNAMIC_GROUP = ['pdp-shipping', 'pdp-pickup'];
const BODY_GROUP = ['pdp-details', 'pdp-reviews', 'pdp-bundle', 'pdp-related'];

export const pdpPath = (slug: string) => `/${slug}/p`;

export async function pdpMetadata(slug: string): Promise<Metadata> {
  const view = await buildPdpView(slug);
  if (!view) return {};
  const image = view.product.images[0];
  return buildMetadata({
    template: 'pdp',
    title: view.product.name,
    description: view.description,
    path: pdpPath(slug),
    ...(image ? { image: { url: image.src, width: image.width, height: image.height, alt: image.alt ?? view.product.name } } : {}),
  });
}

/** JSON-LD da PDP: BreadcrumbList + Product/Offer/AggregateRating + FAQPage (contracts.yaml > seo.byTemplate.pdp). */
async function PdpJsonLd({ view }: { view: PdpView }) {
  enforceGeoCompleteness(view.product);
  const ctx = await getSeoContext();
  const path = pdpPath(view.product.slug);
  return (
    <JsonLdScript
      data={graph(
        organizationNode(ctx),
        breadcrumbNode(view.breadcrumb, path, ctx.site),
        productNode(ctx, { product: view.product, path, breadcrumb: view.breadcrumb }),
        faqNode(view.faq),
      )}
    />
  );
}

/**
 * Frete + retirada/entrega por loja: o CEP vem da URL (?cep=), entao so pode
 * ser lido dentro de Suspense. As duas cotacoes compartilham o MESMO CEP -
 * pdp-pickup nunca pede o CEP de novo. `quotePickup` e no-op (undefined)
 * quando fulfillment.mode = "centralized" (ADR 0028), e pdp-content.ts ja
 * descarta a instancia 'pdp-pickup' nesse caso (propsFor devolve null).
 */
async function DynamicFulfillment({ view, searchParams, instances }: { view: PdpView; searchParams: Promise<RawQuery>; instances: readonly SectionInstance[] }) {
  const raw = (await searchParams).cep;
  const cep = Array.isArray(raw) ? raw[0] : raw;
  const [quote, pickupQuote] = await Promise.all([quoteShipping(cep, view.product.price), quotePickup(cep, view.product.sku)]);
  const extra = { ...(cep ? { cep } : {}), ...(quote ? { quote } : {}), ...(pickupQuote ? { pickupQuote } : {}) };
  return <>{renderInstances(instances, (i) => view.propsFor(i, extra))}</>;
}

/**
 * Template PDP. A composicao vem de `templates.pdp` no manifest; o layout fixa
 * dois slots: galeria + buy box (2 colunas no desktop, buy box sticky) e o corpo
 * (frete, detalhes, avaliacoes, bundle, relacionados). A view e resolvida pela rota
 * ANTES do JSX (`notFound()` so devolve 404 de verdade antes do stream). O shell e estatico; so a
 * calculadora de frete le a URL, em Suspense, e o fallback e a propria section
 * sem resultado (nenhum shift quando o resultado chega).
 */
export function PdpPage({ view, searchParams }: { view: PdpView; searchParams: Promise<RawQuery> }): ReactNode {
  const { sections } = loadAllManifests();
  const instances = expandTemplate(sections.templates.pdp?.sections ?? [], {});
  const group = (ids: string[]) => instances.filter((i) => ids.includes(i.id));
  const render = (list: typeof instances) => renderInstances(list, (i) => view.propsFor(i));
  const dynamic = group(DYNAMIC_GROUP);
  const hasDynamic = dynamic.length > 0;

  const pick = (id: string) => instances.filter((i) => i.id === id);
  const body = group(BODY_GROUP);

  return (
    // pb-[72px]: reserva a barra fixa de CTA no mobile (stickyReservedHeight: 72).
    <main className="pb-[72px] md:pb-0">
      <PdpJsonLd view={view} />
      {render(pick('breadcrumb'))}
      <Container className="mb-20 lg:grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-10">
        {render(group(GALLERY_GROUP))}
      </Container>
      <Container>
        {hasDynamic && (
          <Suspense fallback={render(dynamic)}>
            <DynamicFulfillment view={view} searchParams={searchParams} instances={dynamic} />
          </Suspense>
        )}
        {render(body)}
      </Container>
      {render(pick('faq'))}
    </main>
  );
}
