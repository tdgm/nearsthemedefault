import { RoutePlaceholder } from '../../../components/route-placeholder';

// Grupo ambiguo de 2o segmento (docs/adr/0003). Fase 6.
export default function Page({ params }: { params: Promise<{ slug: string; sub: string }> }) {
  return <RoutePlaceholder id="[slug]/[sub]" template="collection | landing" params={params} />;
}
