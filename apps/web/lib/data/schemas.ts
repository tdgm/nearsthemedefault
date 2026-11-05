// Contratos do data layer. TODA resposta (mock ou GraphQL) passa por estes
// schemas antes de chegar a uma section (CLAUDE.md > Stack: Zod valida toda
// resposta de API). Nenhum conceito de nicho: eixos de variacao, facetas e
// textos vem de nears.config.yaml.
import { z } from 'zod';

/** Slug de URL: minusculas, numeros e hifens. Segmentos reservados sao checados no indice. */
export const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug invalido');

export const imageSchema = z.strictObject({
  src: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  alt: z.string().optional(),
});

const named = z.strictObject({ slug: slugSchema, name: z.string().min(1) });

/** Departamento do CMS (eixo 1). Categorias e subcategorias formam /{d}/{c}/{s}. */
export const departmentSchema = z.strictObject({
  slug: slugSchema,
  name: z.string().min(1),
  intro: z.string().optional(),
  categories: z.array(named.extend({ subcategories: z.array(named).default([]) })).default([]),
});

/** Tipo de produto do catalogo (eixo plano /{productType}). */
export const productTypeSchema = named;

export const campaignSchema = z.strictObject({
  slug: slugSchema,
  name: z.string().min(1),
  /** ISO 8601. Fora da janela a campanha redireciona (routes.manifest > campaign.schedule). */
  startsAt: z.iso.datetime({ offset: true }),
  endsAt: z.iso.datetime({ offset: true }),
  segments: z.array(named).default([]),
});

export const pageSchema = z.strictObject({
  slug: slugSchema,
  title: z.string().min(1),
  /** Paragrafos separados por linha em branco (sem HTML). */
  body: z.string().min(1),
});

export const longtailSchema = z.strictObject({
  keyword: slugSchema,
  title: z.string().min(1),
  /** Texto unico da landing. Sem ele a pagina nao e publicada (routes.manifest > longtail.requires). */
  intro: z.string().min(1),
  /** Filtros pre-aplicados (faceta -> valor). */
  filters: z.record(z.string(), z.string()).default({}),
  faq: z.array(z.strictObject({ question: z.string().min(1), answer: z.string().min(1) })).min(3),
});

export const productSchema = z.strictObject({
  slug: slugSchema,
  name: z.string().min(1),
  images: z.array(imageSchema).min(1),
  price: z.number().nonnegative(),
  listPrice: z.number().nonnegative().optional(),
  installments: z.strictObject({ count: z.number().int().min(1) }).optional(),
  badges: z.array(z.strictObject({ label: z.string().min(1), tone: z.enum(['neutral', 'promo', 'success', 'info']) })).default([]),
  department: slugSchema,
  category: slugSchema,
  subcategory: slugSchema.optional(),
  productType: slugSchema,
  brand: z.string().optional(),
  createdAt: z.iso.datetime({ offset: true }),
  // --- Campos da PDP (opcionais: a listagem so precisa dos acima) ---
  sku: z.string().min(1).optional(),
  availability: z.enum(['in_stock', 'out_of_stock', 'preorder']).default('in_stock'),
  /** Texto simples; paragrafos separados por linha em branco. O 1o responde "o que e este produto?". */
  description: z.string().optional(),
  /** Pares atributo/valor: viram <table> e additionalProperty (catalog.specTable). */
  specs: z.array(z.strictObject({ name: z.string().min(1), value: z.string().min(1) })).default([]),
  /** Cuidados, uso, instalacao, conservacao... conforme o nicho. */
  instructions: z.string().optional(),
  /** Guia auxiliar (medidas, compatibilidade, voltagem...): tabela HTML, nunca imagem. */
  guide: z.strictObject({ columns: z.array(z.string().min(1)).min(1), rows: z.array(z.array(z.string())).min(1) }).optional(),
  rating: z.strictObject({ value: z.number().min(0).max(5), count: z.number().int().nonnegative() }).optional(),
  reviews: z
    .array(
      z.strictObject({
        author: z.string().min(1),
        rating: z.number().int().min(1).max(5),
        date: z.iso.datetime({ offset: true }),
        title: z.string().optional(),
        body: z.string().min(1),
      }),
    )
    .default([]),
  /** Opcoes por eixo de variacao (id do eixo = catalog.variantAxes[].id). */
  variants: z
    .array(
      z.strictObject({
        axis: z.string().min(1),
        options: z.array(z.strictObject({ value: z.string().min(1), label: z.string().min(1), swatch: z.string().optional(), unavailable: z.boolean().optional() })).min(1),
      }),
    )
    .default([]),
  /** Slugs de produtos complementares (compre junto, kit...). */
  bundle: z.array(slugSchema).default([]),
  /** Slugs de produtos relacionados. */
  related: z.array(slugSchema).default([]),
  faq: z.array(z.strictObject({ question: z.string().min(1), answer: z.string().min(1) })).optional(),
});

export const storeSchema = z.strictObject({
  name: z.string().min(1),
  logo: imageSchema,
});

export type Department = z.infer<typeof departmentSchema>;
export type ProductType = z.infer<typeof productTypeSchema>;
export type Campaign = z.infer<typeof campaignSchema>;
export type Page = z.infer<typeof pageSchema>;
export type Longtail = z.infer<typeof longtailSchema>;
export type Product = z.infer<typeof productSchema>;
export type Store = z.infer<typeof storeSchema>;

/** Tudo o que o data layer entrega. O mock e o cliente GraphQL produzem esta forma. */
export const catalogSnapshotSchema = z.strictObject({
  store: storeSchema,
  departments: z.array(departmentSchema),
  productTypes: z.array(productTypeSchema),
  campaigns: z.array(campaignSchema),
  pages: z.array(pageSchema),
  longtails: z.array(longtailSchema),
  products: z.array(productSchema),
});

export type CatalogSnapshot = z.infer<typeof catalogSnapshotSchema>;
