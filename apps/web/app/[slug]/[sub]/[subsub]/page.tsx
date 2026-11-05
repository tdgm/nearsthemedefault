import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { allSegmentPaths, resolveSegments } from '../../../../lib/routing/resolve';
import { RoutePage, routeMetadata } from '../../../../lib/templates/route-page';

export async function generateStaticParams() {
  return (await allSegmentPaths())
    .filter((p) => p.length === 3)
    .map(([slug, sub, subsub]) => ({ slug: slug!, sub: sub!, subsub: subsub! }));
}

type Props = {
  params: Promise<{ slug: string; sub: string; subsub: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug, sub, subsub } = await params;
  return routeMetadata(await resolveSegments([slug, sub, subsub]), searchParams);
}

export default async function Page({ params, searchParams }: Props) {
  const { slug, sub, subsub } = await params;
  // Resolve ANTES de montar o JSX: so assim o notFound() vira status 404 (e nao um soft 404 com HTTP 200).
  const resolved = await resolveSegments([slug, sub, subsub]);
  if (!resolved) notFound();
  return <RoutePage resolved={resolved} searchParams={searchParams} />;
}
