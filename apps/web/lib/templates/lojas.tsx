import { formatCEP } from '@nears/ui';
import { listStores } from '../data/stores';
import { loadAllManifests } from '../manifest';
import { JsonLdScript, buildMetadata, getSeoContext, graph, localBusinessNode, organizationNode, webPageNode } from '../seo';
import { expandTemplate } from './expand';
import { renderInstances } from './render';

export const LOJAS_PATH = '/lojas';

export async function lojasMetadata() {
  return buildMetadata({
    template: 'lojas',
    title: 'Nossas lojas',
    description: 'Endereço, horário de funcionamento e opções de retirada ou entrega das lojas físicas.',
    path: LOJAS_PATH,
  });
}

/**
 * Lojas fisicas (Fase 9d, ADR 0028). Pagina institucional PUBLICA e
 * indexavel (nunca dado pessoal) - reforca geo.entity.napConsistency com um
 * LocalBusiness por loja. Fixture estatico (data/stores.ts): sem leitura de
 * cookie/sessao nem de nenhuma API dinamica do Next, entao render: ssg sem
 * Suspense (mesmo padrao de institutional/sitemap). Linkada pelo footer
 * institucional (storefront.ts) - zero paginas orfas.
 *
 * `openingHours` so aparece como texto simples aqui: e string livre no
 * fixture, e o formato estruturado de dias/horas do schema.org seria dado
 * inventado - por isso nao entra no JSON-LD (ver localBusinessNode).
 */
export async function LojasPage() {
  const { sections } = loadAllManifests();
  const stores = await listStores();
  const instances = expandTemplate(sections.templates.lojas?.sections ?? [], {});
  const propsFor = (inst: { id: string }): unknown | null => (inst.id === 'section-title' ? { text: 'Nossas lojas', level: 'h1' } : null);

  const ctx = await getSeoContext();

  return (
    <main>
      <JsonLdScript
        data={graph(
          organizationNode(ctx),
          webPageNode(ctx, { name: 'Nossas lojas', description: 'Endereço, horário e opções de retirada ou entrega de cada loja física.', path: LOJAS_PATH }),
          ...stores.map((store) => localBusinessNode(store, ctx.site)),
        )}
      />
      {renderInstances(instances, propsFor)}
      <p className="mx-auto max-w-3xl px-4 pb-4 text-on-surface-muted">
        {stores.length} lojas físicas, com retirada ou entrega local conforme a proximidade do seu CEP.
      </p>
      <ul className="mx-auto max-w-3xl space-y-8 px-4 pb-12">
        {stores.map((store) => (
          <li key={store.id} className="border-t border-border pt-6 first:border-t-0 first:pt-0">
            <address className="not-italic">
              <h2 className="text-lg font-heading">{store.name}</h2>
              <p>
                {store.address.street}, {store.address.number}
                {store.address.complement ? ` - ${store.address.complement}` : ''} · {store.address.neighborhood}
              </p>
              <p>
                {store.address.city} - {store.address.state} · CEP {formatCEP(store.address.postalCode)}
              </p>
              {store.openingHours && <p>{store.openingHours}</p>}
              <p className="text-on-surface-muted">
                {store.pickupEnabled ? 'Retirada na loja disponível' : 'Sem retirada nesta loja'} · Entrega local em um raio de até {store.deliveryRadiusKm} km
              </p>
              <a
                href={`https://www.google.com/maps?q=${store.geoCoordinates.lat},${store.geoCoordinates.lng}`}
                rel="noopener noreferrer"
                target="_blank"
                className="inline-flex min-h-11 items-center text-sm underline underline-offset-4"
              >
                Ver no mapa
              </a>
            </address>
          </li>
        ))}
      </ul>
    </main>
  );
}
