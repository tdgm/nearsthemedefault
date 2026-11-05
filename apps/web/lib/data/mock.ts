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

/** GTIN-13 valido (digito verificador modulo 10) para os produtos de exemplo. */
const gtin13 = (n: number) => {
  const base = `789${String(n).padStart(9, '0')}`;
  const sum = [...base].reduce((acc, d, i) => acc + Number(d) * (i % 2 === 0 ? 1 : 3), 0);
  return `${base}${(10 - (sum % 10)) % 10}`;
};

const slugOf = (n: number) => (n === 1 ? 'produto-exemplo' : `produto-${n}`);

/** 24 produtos distribuidos entre departamentos, categorias e tipos. */
const products: CatalogSnapshot['products'] = Array.from({ length: 24 }, (_, i) => {
  const n = i + 1;
  const department = departments[i % departments.length]!;
  const category = department.categories[i % department.categories.length]!;
  const subcategory = category.subcategories[0];
  const promo = n % 3 === 0;
  const price = 49.9 + n * 10;
  return {
    slug: slugOf(n),
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
    sku: `SKU-${String(n).padStart(4, '0')}`,
    gtin: gtin13(n),
    priceValidUntil: '2027-12-31',
    availability: n % 11 === 0 ? ('out_of_stock' as const) : ('in_stock' as const),
    description: `Produto ${n} é um item de exemplo do catálogo de desenvolvimento, com preço e parcelamento informados.\n\nEste texto vem do CMS e descreve materiais, usos e diferenciais do produto.`,
    specs: [
      { name: 'Marca', value: `Marca ${(i % 3) + 1}` },
      { name: 'Código', value: `SKU-${String(n).padStart(4, '0')}` },
      { name: 'Garantia', value: '12 meses' },
    ],
    instructions: 'Siga as orientações de uso e conservação que acompanham o produto.',
    rating: { value: 3.5 + (n % 3) * 0.5, count: 10 + n },
    reviews: [
      { author: 'Cliente 1', rating: 5, date: '2026-03-10T12:00:00-03:00', title: 'Recomendo', body: 'Chegou no prazo e é como descrito.' },
      { author: 'Cliente 2', rating: 4, date: '2026-04-02T09:30:00-03:00', body: 'Bom custo-benefício.' },
    ],
    variants: [
      {
        axis: 'color',
        options: [
          { value: 'cor-1', label: 'Cor 1', swatch: '#1b4d89' },
          { value: 'cor-2', label: 'Cor 2', swatch: '#8a2b2b' },
          { value: 'cor-3', label: 'Cor 3', swatch: '#2f6b3f', unavailable: true },
        ],
      },
      { axis: 'size', options: ['P', 'M', 'G'].map((v) => ({ value: v.toLowerCase(), label: v })) },
    ],
    bundle: [slugOf(((i + 1) % 24) + 1), slugOf(((i + 2) % 24) + 1)],
    related: [3, 4, 5, 6].map((d) => slugOf(((i + d) % 24) + 1)),
  };
});

export const mockSnapshot: CatalogSnapshot = {
  store: {
    name: 'Loja',
    logo: { src: '/logo-placeholder.svg', width: 120, height: 32, alt: 'Loja' },
    ogImage: { src: '/placeholders/og-default.jpg', width: 1200, height: 630, alt: 'Loja' },
    organization: {
      legalName: 'Loja Exemplo Comércio Ltda.',
      description: 'A Loja é um comércio online de exemplo, criado no template padrão da plataforma Nears, com entrega para todo o Brasil.',
      foundingDate: '2020-01-15',
      taxId: '00.000.000/0001-00',
      address: { street: 'Rua Exemplo, 100', locality: 'São Paulo', region: 'SP', postalCode: '01000-000', country: 'BR' },
      sameAs: ['https://www.instagram.com/loja-exemplo', 'https://www.facebook.com/loja-exemplo'],
      contactPoint: { contactType: 'customer service', email: 'atendimento@loja.example' },
    },
    policies: {
      returns: { days: 30, method: 'ByMail', fees: 'FreeReturn' },
      shipping: { handlingDays: { min: 0, max: 2 }, transitDays: { min: 2, max: 8 }, rate: 19.9, freeFrom: 299, country: 'BR' },
    },
  },
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
