import Link from 'next/link';
import { getProducts } from '../data/client';
import { cardAspect, toProductCard } from '../data/mappers';
import { loadAllManifests } from '../manifest';
import { expandTemplate } from './expand';
import { renderInstances } from './render';

/** 404 (templates.notfound): titulo + vitrine de recomendados. O status 404 vem do Next (notFound() ou rota fora do indice). */
export async function NotFoundPage() {
  const { config, sections } = loadAllManifests();
  const products = await getProducts();
  const aspect = cardAspect(config);
  const instances = expandTemplate(sections.templates.notfound?.sections ?? [], {});

  const propsFor = (inst: { id: string }): unknown | null => {
    switch (inst.id) {
      case 'section-title':
        return { text: 'Página não encontrada', level: 'h1' };
      case 'showcase':
        return { variant: 'recommended', products: products.slice(0, 4).map((p) => toProductCard(p, { aspect })), limit: 4 };
      default:
        return null;
    }
  };

  return (
    <main>
      {renderInstances(instances, propsFor)}
      <p className="mx-auto max-w-7xl px-4 py-6">
        O endereço que você abriu não existe.{' '}
        <Link href="/" className="inline-flex min-h-11 items-center underline">
          Voltar ao início
        </Link>
      </p>
    </main>
  );
}
