import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { allSegmentPaths, resolveSegments } from '../../../lib/routing/resolve';
import { RoutePage, routeMetadata } from '../../../lib/templates/route-page';

// Grupo ambiguo de 2o segmento (docs/adr/0003): department-category,
// category-flat-attribute e campaign-segment. O 2o segmento so e procurado na
// fonte do 1o. "/{x}/p" e sempre PDP e vence esta rota (segmento literal).
export async function generateStaticParams() {
  return (await allSegmentPaths()).filter((p) => p.length === 2).map(([slug, sub]) => ({ slug: slug!, sub: sub! }));
}

type Props = {
  params: Promise<{ slug: string; sub: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug, sub } = await params;
  return routeMetadata(await resolveSegments([slug, sub]), searchParams);
}

export default async function Page({ params, searchParams }: Props) {
  const { slug, sub } = await params;
  // Resolve ANTES de montar o JSX: so assim o notFound() vira status 404 (e nao um soft 404 com HTTP 200).
  const resolved = await resolveSegments([slug, sub]);
  if (!resolved) notFound();
  return <RoutePage resolved={resolved} searchParams={searchParams} />;
}
