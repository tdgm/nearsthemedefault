import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { allSegmentPaths, resolveSegments } from '../../lib/routing/resolve';
import { RoutePage, routeMetadata } from '../../lib/templates/route-page';

// Grupo ambiguo de 1o segmento: department, category-flat, campaign e
// institutional compartilham este arquivo e sao separados pelo indice de slugs
// (docs/adr/0003). Slug fora do indice = notFound() = status 404 real. O
// indice e montado em generateStaticParams, entao slug duplicado/reservado
// derruba o build.
export async function generateStaticParams() {
  return (await allSegmentPaths()).filter((p) => p.length === 1).map(([slug]) => ({ slug: slug! }));
}

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  return routeMetadata(await resolveSegments([slug]), searchParams);
}

export default async function Page({ params, searchParams }: Props) {
  const { slug } = await params;
  // Resolve ANTES de montar o JSX: so assim o notFound() vira status 404 (e nao um soft 404 com HTTP 200).
  const resolved = await resolveSegments([slug]);
  if (!resolved) notFound();
  return <RoutePage resolved={resolved} searchParams={searchParams} />;
}
