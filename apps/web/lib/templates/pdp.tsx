import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense, type ReactNode } from 'react';
import { quoteShipping } from '../data/shipping';
import { loadAllManifests } from '../manifest';
import { buildPdpView, type PdpView } from './pdp-content';
import { expandTemplate } from './expand';
import { renderInstances } from './render';

type RawQuery = Record<string, string | string[] | undefined>;

const GALLERY_GROUP = ['pdp-gallery', 'pdp-buybox'];
const BODY_GROUP = ['pdp-shipping', 'pdp-details', 'pdp-reviews', 'pdp-bundle', 'pdp-related'];

export async function pdpMetadata(slug: string): Promise<Metadata> {
  const view = await buildPdpView(slug);
  if (!view) return {};
  // Canonical, robots e JSON-LD Product sao da Fase 7.
  return { title: view.product.name, description: view.description };
}

/** Shipping dinamico: o CEP vem da URL (?cep=), entao so pode ser lido dentro de Suspense. */
async function DynamicShipping({ view, searchParams }: { view: PdpView; searchParams: Promise<RawQuery> }) {
  const raw = (await searchParams).cep;
  const cep = Array.isArray(raw) ? raw[0] : raw;
  const quote = await quoteShipping(cep, view.product.price);
  return <>{renderInstances([{ id: 'pdp-shipping', key: 'pdp-shipping', occurrence: 0 }], (i) => view.propsFor(i, { ...(cep ? { cep } : {}), ...(quote ? { quote } : {}) }))}</>;
}

/**
 * Template PDP. A composicao vem de `templates.pdp` no manifest; o layout fixa
 * dois slots: galeria + buy box (2 colunas no desktop, buy box sticky) e o corpo
 * (frete, detalhes, avaliacoes, bundle, relacionados). O shell e estatico; so a
 * calculadora de frete le a URL, em Suspense, e o fallback e a propria section
 * sem resultado (nenhum shift quando o resultado chega).
 */
export async function PdpPage({ slug, searchParams }: { slug: string; searchParams: Promise<RawQuery> }): Promise<ReactNode> {
  const view = await buildPdpView(slug);
  if (!view) notFound();
  const { sections } = loadAllManifests();
  const instances = expandTemplate(sections.templates.pdp?.sections ?? [], {});
  const group = (ids: string[]) => instances.filter((i) => ids.includes(i.id));
  const render = (list: typeof instances) => renderInstances(list, (i) => view.propsFor(i));
  const hasShipping = instances.some((i) => i.id === 'pdp-shipping');

  const pick = (id: string) => instances.filter((i) => i.id === id);
  const body = group(BODY_GROUP).filter((i) => i.id !== 'pdp-shipping');

  return (
    // pb-[72px]: reserva a barra fixa de CTA no mobile (stickyReservedHeight: 72).
    <main className="pb-[72px] md:pb-0">
      {render(pick('breadcrumb'))}
      <div className="mx-auto max-w-7xl px-4 lg:grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-10">
        {render(group(GALLERY_GROUP))}
      </div>
      <div className="mx-auto max-w-7xl px-4">
        {hasShipping && (
          <Suspense fallback={render(pick('pdp-shipping'))}>
            <DynamicShipping view={view} searchParams={searchParams} />
          </Suspense>
        )}
        {render(body)}
      </div>
      {render(pick('faq'))}
    </main>
  );
}
