import type { Metadata } from 'next';
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
  return <RoutePage resolved={await resolveSegments([slug, sub, subsub])} searchParams={searchParams} />;
}
