import { RoutePlaceholder } from '../../../components/route-placeholder';

// O Next exige o MESMO nome de parametro dinamico no mesmo nivel: o 1o segmento
// e sempre [slug] (docs/adr/0009). O valor e o slug do produto; o sufixo
// literal "p" faz esta rota vencer /[slug]/[sub] (docs/adr/0003).
export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <RoutePlaceholder id="pdp" template="pdp" params={params} />;
}
