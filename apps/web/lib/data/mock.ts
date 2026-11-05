// Catalogo de desenvolvimento: neutro, sem marca nem nicho. Passa pelos mesmos
// schemas que a resposta real (catalogSnapshotSchema.parse no client). Os slugs
// "-exemplo" sao os mesmos de exampleHref (lib/evolution.ts) e dos E2E.
import type { CatalogSnapshot } from './schemas';

const PRODUCT_IMAGE = { src: '/placeholders/product.svg', width: 800, height: 1000 } as const;

const departments: CatalogSnapshot['departments'] = [
  {
    slug: 'departamento-exemplo',
    name: 'Departamento exemplo',
    intro: 'Os produtos do departamento exemplo, organizados por categoria.',
    categories: [
      {
        slug: 'categoria-exemplo',
        name: 'Categoria exemplo',
        subcategories: [
          { slug: 'sub-exemplo', name: 'Subcategoria exemplo' },
          { slug: 'sub-2', name: 'Subcategoria 2' },
        ],
      },
      { slug: 'categoria-2', name: 'Categoria 2', subcategories: [] },
    ],
  },
  {
    slug: 'departamento-2',
    name: 'Departamento 2',
    categories: [
      { slug: 'categoria-exemplo', name: 'Categoria exemplo', subcategories: [] },
      { slug: 'categoria-2', name: 'Categoria 2', subcategories: [] },
    ],
  },
  {
    slug: 'departamento-3',
    name: 'Departamento 3',
    categories: [{ slug: 'categoria-exemplo', name: 'Categoria exemplo', subcategories: [] }],
  },
];

const productTypes: CatalogSnapshot['productTypes'] = [
  { slug: 'tipo-exemplo', name: 'Tipo exemplo' },
  { slug: 'tipo-2', name: 'Tipo 2' },
];

/** 24 produtos distribuidos entre departamentos, categorias e tipos. */
const products: CatalogSnapshot['products'] = Array.from({ length: 24 }, (_, i) => {
  const n = i + 1;
  const department = departments[i % departments.length]!;
  const category = department.categories[i % department.categories.length]!;
  const subcategory = category.subcategories[0];
  const promo = n % 3 === 0;
  const price = 49.9 + n * 10;
  return {
    slug: n === 1 ? 'produto-exemplo' : `produto-${n}`,
    name: `Produto ${n}`,
    images: [{ ...PRODUCT_IMAGE, alt: `Produto ${n}` }],
    price,
    ...(promo ? { listPrice: Math.round(price * 1.25 * 100) / 100 } : {}),
    installments: { count: 3 },
    badges: promo ? [{ label: 'Oferta', tone: 'promo' as const }] : [],
    department: department.slug,
    category: category.slug,
    ...(subcategory ? { subcategory: subcategory.slug } : {}),
    productType: productTypes[i % productTypes.length]!.slug,
    brand: `Marca ${(i % 3) + 1}`,
    createdAt: new Date(Date.UTC(2026, 0, 1 + i)).toISOString(),
  };
});

export const mockSnapshot: CatalogSnapshot = {
  store: { name: 'Loja', logo: { src: '/logo-placeholder.svg', width: 120, height: 32, alt: 'Loja' } },
  departments,
  productTypes,
  campaigns: [
    {
      slug: 'campanha-exemplo',
      name: 'Campanha exemplo',
      startsAt: '2026-01-01T00:00:00-03:00',
      endsAt: '2099-12-31T23:59:59-03:00',
      segments: [{ slug: 'segmento-exemplo', name: 'Segmento exemplo' }],
    },
  ],
  pages: [
    {
      slug: 'pagina-exemplo',
      title: 'Página exemplo',
      body: 'Esta página institucional é um exemplo de conteúdo vindo do CMS.\n\nCada parágrafo é um bloco de texto simples, sem HTML.',
    },
  ],
  longtails: [
    {
      keyword: 'palavra-chave-exemplo',
      title: 'Palavra-chave exemplo',
      intro: 'Reunimos os produtos que atendem à busca por palavra-chave exemplo, com os filtros já aplicados.',
      filters: { brand: 'marca-1' },
      faq: [
        { question: 'Como a seleção é feita?', answer: 'Os filtros da página já vêm aplicados e podem ser ajustados.' },
        { question: 'Há frete grátis?', answer: 'As condições de frete aparecem na página de cada produto.' },
        { question: 'Posso trocar?', answer: 'A política de troca está descrita na página de cada produto.' },
      ],
    },
  ],
  products,
};
