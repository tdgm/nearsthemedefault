// Resolve os segmentos de uma URL para a entidade do data layer. O 1o segmento
// vem do indice de slugs (docs/adr/0003: uma consulta, sem tentar fonte por
// fonte); o 2o so e procurado na fonte do 1o. Slug fora do indice devolve null,
// que as paginas transformam em notFound() (status 404 real, nunca soft 404).
import { getCampaigns, getDepartments, getLongtails, getPages, getProductTypes, getProducts } from '../data/client';
import type { Campaign, Department, Longtail, Page, Product, ProductType } from '../data/schemas';
import { getSlugIndex } from './index';

export type Resolved =
  | { kind: 'collection'; route: 'department'; department: Department }
  | { kind: 'collection'; route: 'department-category'; department: Department; category: Department['categories'][number] }
  | {
      kind: 'collection';
      route: 'department-category-sub';
      department: Department;
      category: Department['categories'][number];
      subcategory: Department['categories'][number]['subcategories'][number];
    }
  | { kind: 'collection'; route: 'category-flat'; productType: ProductType }
  | { kind: 'landing'; route: 'campaign'; campaign: Campaign }
  | { kind: 'landing'; route: 'campaign-segment'; campaign: Campaign; segment: Campaign['segments'][number] }
  | { kind: 'page'; route: 'institutional'; page: Page }
  | { kind: 'longtail'; route: 'longtail'; longtail: Longtail }
  | { kind: 'pdp'; route: 'pdp'; product: Product };

export async function resolveSegments(segments: readonly string[]): Promise<Resolved | null> {
  const [first, second, third] = segments;
  if (!first) return null;
  const entry = (await getSlugIndex()).get(first);
  if (!entry) return null;

  switch (entry.route) {
    case 'department': {
      const department = (await getDepartments()).find((d) => d.slug === first);
      if (!department) return null;
      if (!second) return { kind: 'collection', route: 'department', department };
      const category = department.categories.find((c) => c.slug === second);
      if (!category) return null;
      if (!third) return { kind: 'collection', route: 'department-category', department, category };
      const subcategory = category.subcategories.find((s) => s.slug === third);
      return subcategory ? { kind: 'collection', route: 'department-category-sub', department, category, subcategory } : null;
    }
    case 'category-flat': {
      // Nivel 2 do eixo plano (/{tipo}/{valor}) so existe com catalog.flatAxis.secondLevelAttribute.
      if (second) return null;
      const productType = (await getProductTypes()).find((t) => t.slug === first);
      return productType ? { kind: 'collection', route: 'category-flat', productType } : null;
    }
    case 'campaign': {
      if (third) return null;
      const campaign = (await getCampaigns()).find((c) => c.slug === first);
      if (!campaign) return null;
      if (!second) return { kind: 'landing', route: 'campaign', campaign };
      const segment = campaign.segments.find((s) => s.slug === second);
      return segment ? { kind: 'landing', route: 'campaign-segment', campaign, segment } : null;
    }
    case 'institutional': {
      if (second) return null;
      const page = (await getPages()).find((p) => p.slug === first);
      return page ? { kind: 'page', route: 'institutional', page } : null;
    }
  }
}

export async function resolveLongtail(keyword: string): Promise<Resolved | null> {
  const longtail = (await getLongtails()).find((l) => l.keyword === keyword);
  return longtail ? { kind: 'longtail', route: 'longtail', longtail } : null;
}

export async function resolveProduct(slug: string): Promise<Resolved | null> {
  const product = (await getProducts()).find((p) => p.slug === slug);
  return product ? { kind: 'pdp', route: 'pdp', product } : null;
}

/** Janela da campanha (routes.manifest > campaign.schedule). Pura: o chamador passa `now`. */
export function isCampaignActive(c: Pick<Campaign, 'startsAt' | 'endsAt'>, now: Date): boolean {
  return now >= new Date(c.startsAt) && now <= new Date(c.endsAt);
}

/** Todos os caminhos de colecao/landing/pagina conhecidos, para generateStaticParams. */
export async function allSegmentPaths(): Promise<string[][]> {
  const [departments, types, campaigns, pages] = await Promise.all([getDepartments(), getProductTypes(), getCampaigns(), getPages()]);
  const paths: string[][] = [];
  for (const d of departments) {
    paths.push([d.slug]);
    for (const c of d.categories) {
      paths.push([d.slug, c.slug]);
      for (const s of c.subcategories) paths.push([d.slug, c.slug, s.slug]);
    }
  }
  for (const t of types) paths.push([t.slug]);
  for (const c of campaigns) {
    paths.push([c.slug]);
    for (const s of c.segments) paths.push([c.slug, s.slug]);
  }
  for (const p of pages) paths.push([p.slug]);
  return paths;
}
