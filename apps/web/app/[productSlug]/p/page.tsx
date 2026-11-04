import { RoutePlaceholder } from '../../../components/route-placeholder';

export default function Page({ params }: { params: Promise<{ productSlug: string }> }) {
  return <RoutePlaceholder id="pdp" template="pdp" params={params} />;
}
