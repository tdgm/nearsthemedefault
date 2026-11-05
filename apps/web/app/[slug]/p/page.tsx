import type { Metadata } from 'next';
import { getProducts } from '../../../lib/data/client';
import { PdpPage, pdpMetadata } from '../../../lib/templates/pdp';

// PDP: "/{productSlug}/p". O sufixo literal "/p" vence /[slug]/[sub] e o Next
// exige o mesmo nome de parametro ([slug]) no 1o segmento (docs/adr/0009). Slug
// fora do catalogo = notFound() = 404 real.
export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return pdpMetadata(slug);
}

export default async function Page({ params, searchParams }: Props) {
  const { slug } = await params;
  return <PdpPage slug={slug} searchParams={searchParams} />;
}
