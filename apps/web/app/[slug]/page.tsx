import { RoutePlaceholder } from '../../components/route-placeholder';

// Grupo ambiguo de 1o segmento: department, category-flat, campaign e
// institutional compartilham este arquivo e sao separados em runtime pelo
// indice de slugs (docs/adr/0003). Fase 6.
export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <RoutePlaceholder id="[slug]" template="collection | landing | page" params={params} />;
}
