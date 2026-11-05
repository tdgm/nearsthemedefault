import { z } from 'zod';
import { productCardSchema } from '../product-card/product-card.schema.ts';

const filterSchema = z.strictObject({
  /** Id da faceta (precisa estar em `facets`, que o nicho restringe por catalog.facets.available). */
  id: z.string().min(1),
  label: z.string().min(1),
  options: z.array(z.strictObject({ value: z.string().min(1), label: z.string().min(1), count: z.number().int().nonnegative().optional() })),
});

/** Espelha `sections.product-grid.props` de nears/sections.registry.yaml (+ teste de paridade). */
export const productGridSchema = z.strictObject({
  /** Colunas por breakpoint (mobile / md / lg). */
  columns: z
    .strictObject({
      xs: z.number().int().min(1).max(3).default(2),
      md: z.number().int().min(2).max(4).default(3),
      lg: z.number().int().min(3).max(6).default(4),
    })
    .default({ xs: 2, md: 3, lg: 4 }),
  pageSize: z.number().int().positive().default(24),
  /** Ordenacoes oferecidas, na ordem de exibicao. */
  sort: z.array(z.string().min(1)).default(['relevance', 'price_asc', 'price_desc', 'newest', 'discount']),
  /** Ids das facetas exibidas (catalog.facets.available do nicho). */
  facets: z.array(z.string().min(1)).default([]),
  /** Produtos da pagina atual (ja ordenados e filtrados pelo data layer). */
  products: z.array(productCardSchema).default([]),
  /** Total de resultados (todas as paginas). */
  total: z.number().int().nonnegative().default(0),
  page: z.number().int().min(1).default(1),
  /** Caminho da colecao; links de pagina, ordenacao e filtros partem dele. */
  basePath: z.string().default(''),
  /** Parametros de URL aplicados (faceta -> valor(es), `sort`...). */
  query: z.record(z.string(), z.union([z.string(), z.array(z.string())])).default({}),
  currentSort: z.string().optional(),
  /** Definicao das facetas com opcoes; so as listadas em `facets` sao exibidas. */
  filters: z.array(filterSchema).default([]),
  labels: z
    .strictObject({
      heading: z.string(),
      results: z.string(),
      resultsOne: z.string(),
      sortBy: z.string(),
      sortApply: z.string(),
      filter: z.string(),
      filtersTitle: z.string(),
      filtersApply: z.string(),
      filtersClear: z.string(),
      empty: z.string(),
      emptyHint: z.string(),
      sortOptions: z.record(z.string(), z.string()),
    })
    .partial()
    .optional(),
});

export type ProductGridProps = z.input<typeof productGridSchema>;
