import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLongtails } from '../../../lib/data/client';
import { resolveLongtail } from '../../../lib/routing/resolve';
import { RoutePage, routeMetadata } from '../../../lib/templates/route-page';

// Landing de cauda longa com filtros pre-aplicados. Exige H1, intro e FAQ
// unicos por pagina (routes.manifest.yaml > longtail.requires): o schema da
// longtail os torna obrigatorios, entao sem conteudo unico ela nem existe.
export async function generateStaticParams() {
  return (await getLongtails()).map((l) => ({ keyword: l.keyword }));
}

type Props = {
  params: Promise<{ keyword: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { keyword } = await params;
  return routeMetadata(await resolveLongtail(keyword), searchParams);
}

export default async function Page({ params, searchParams }: Props) {
  const { keyword } = await params;
  // Resolve ANTES de montar o JSX: so assim o notFound() vira status 404 (e nao um soft 404 com HTTP 200).
  const resolved = await resolveLongtail(keyword);
  if (!resolved) notFound();
  return <RoutePage resolved={resolved} searchParams={searchParams} />;
}
