import { RoutePlaceholder } from '../../../components/route-placeholder';

// Landing de cauda longa com filtros pre-aplicados. Exige H1, intro e FAQ
// unicos por pagina (routes.manifest.yaml > longtail.requires). Fase 6.
export default function Page({ params }: { params: Promise<{ keyword: string }> }) {
  return <RoutePlaceholder id="longtail" template="collection" params={params} />;
}
