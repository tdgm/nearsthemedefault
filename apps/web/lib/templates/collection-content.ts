// Conteudo PROVISORIO de colecoes (o que o CMS entregara): texto de apoio, FAQ
// e links por colecao. A composicao vem do manifest; aqui so ha props.
import { getDepartments } from '../data/client';
import type { ProductScope } from '../data/collections';
import { loadConfig } from '../manifest';
import type { Resolved } from '../routing/resolve';

export type Crumb = { label: string; href?: string };

export type CollectionView = {
  key: string;
  title: string;
  basePath: string;
  scope: ProductScope;
  /** Filtros pre-aplicados (landings de cauda longa). */
  presetFilters: Record<string, string[]>;
  breadcrumb: Crumb[];
  intro: string;
  faq: { question: string; answer: string }[];
  related: { label: string; href: string }[];
};

const HOME: Crumb = { label: 'Início', href: '/' };

const defaultFaq = (name: string) => [
  { question: `Como escolher em ${name}?`, answer: `Use os filtros e a ordenação da página para comparar preço, marca e categoria dentro de ${name}.` },
  { question: 'Qual o prazo de entrega?', answer: 'O prazo é calculado pelo CEP na página de cada produto e vale para todo o país.' },
  { question: 'Posso trocar ou devolver?', answer: 'Sim. As condições de troca e devolução aparecem na página de cada produto.' },
];

/** Prefixo `facet` + Id: facetBrand, facetPrice... */
export function facetLabelKey(id: string): string {
  return `facet${id.charAt(0).toUpperCase()}${id.slice(1)}`;
}

export function facetLabels(): Record<string, string> {
  const { catalog, vocabulary } = loadConfig();
  return Object.fromEntries(catalog.facets.available.map((id) => [id, vocabulary[facetLabelKey(id)] ?? id]));
}

export async function buildCollectionView(resolved: Extract<Resolved, { kind: 'collection' | 'longtail' }>): Promise<CollectionView> {
  const departments = await getDepartments();
  const deptLinks = departments.map((d) => ({ label: `Produtos de ${d.name}`, href: `/${d.slug}` }));

  switch (resolved.route) {
    case 'department': {
      const { department: d } = resolved;
      return {
        key: d.slug,
        title: d.name,
        basePath: `/${d.slug}`,
        scope: { department: d.slug },
        presetFilters: {},
        breadcrumb: [HOME, { label: d.name }],
        intro: d.intro ?? `Reunimos os produtos de ${d.name}, organizados por categoria, com preço e parcelamento em cada item.`,
        faq: defaultFaq(d.name),
        related: d.categories.map((c) => ({ label: `${c.name} em ${d.name}`, href: `/${d.slug}/${c.slug}` })),
      };
    }
    case 'department-category': {
      const { department: d, category: c } = resolved;
      return {
        key: `${d.slug}/${c.slug}`,
        title: `${c.name} em ${d.name}`,
        basePath: `/${d.slug}/${c.slug}`,
        scope: { department: d.slug, category: c.slug },
        presetFilters: {},
        breadcrumb: [HOME, { label: d.name, href: `/${d.slug}` }, { label: c.name }],
        intro: `Veja ${c.name} em ${d.name}: compare preços, marcas e condições de pagamento antes de escolher.`,
        faq: defaultFaq(c.name),
        related: c.subcategories.length
          ? c.subcategories.map((s) => ({ label: `${s.name} em ${c.name}`, href: `/${d.slug}/${c.slug}/${s.slug}` }))
          : [{ label: `Todos os produtos de ${d.name}`, href: `/${d.slug}` }],
      };
    }
    case 'department-category-sub': {
      const { department: d, category: c, subcategory: s } = resolved;
      return {
        key: `${d.slug}/${c.slug}/${s.slug}`,
        title: `${s.name} em ${c.name}`,
        basePath: `/${d.slug}/${c.slug}/${s.slug}`,
        scope: { department: d.slug, category: c.slug, subcategory: s.slug },
        presetFilters: {},
        breadcrumb: [HOME, { label: d.name, href: `/${d.slug}` }, { label: c.name, href: `/${d.slug}/${c.slug}` }, { label: s.name }],
        intro: `${s.name} dentro de ${c.name}, em ${d.name}, com os filtros e a ordenação que você precisar.`,
        faq: defaultFaq(s.name),
        related: [{ label: `Todos os produtos de ${c.name}`, href: `/${d.slug}/${c.slug}` }, ...deptLinks],
      };
    }
    case 'category-flat': {
      const { productType: t } = resolved;
      return {
        key: t.slug,
        title: t.name,
        basePath: `/${t.slug}`,
        scope: { productType: t.slug },
        presetFilters: {},
        breadcrumb: [HOME, { label: t.name }],
        intro: `Todos os produtos do tipo ${t.name}, de todos os departamentos, em um só lugar.`,
        faq: defaultFaq(t.name),
        related: deptLinks,
      };
    }
    case 'longtail': {
      const { longtail: l } = resolved;
      return {
        key: `b/${l.keyword}`,
        title: l.title,
        basePath: `/b/${l.keyword}`,
        scope: {},
        presetFilters: Object.fromEntries(Object.entries(l.filters).map(([k, v]) => [k, [v]])),
        breadcrumb: [HOME, { label: l.title }],
        intro: l.intro,
        faq: l.faq,
        related: deptLinks,
      };
    }
  }
}
