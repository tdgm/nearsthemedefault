import { RoutePlaceholder } from '../../../../components/route-placeholder';

export default function Page({
  params,
}: {
  params: Promise<{ slug: string; sub: string; subsub: string }>;
}) {
  return (
    <RoutePlaceholder id="[slug]/[sub]/[subsub]" template="collection" params={params} />
  );
}
