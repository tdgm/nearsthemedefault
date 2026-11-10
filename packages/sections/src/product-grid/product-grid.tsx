import { buttonClasses, Button, Checkbox, Overlay, OverlayTrigger, Pagination, Select } from '@nears/ui';
import { ProductCard } from '../product-card/product-card.tsx';
import { fill } from '../shared/template.ts';
import { pageHref, toQueryString, type GridQuery } from './grid-url.ts';
import type { ProductGridProps } from './product-grid.schema';

/** Id do drawer de filtros (um por pagina). */
export const FILTERS_ID = 'filters';

const defaults = {
  heading: 'Produtos',
  results: '{count} produtos',
  resultsOne: '1 produto',
  sortBy: 'Ordenar por',
  sortApply: 'Ordenar',
  filter: 'Filtrar',
  filtersTitle: 'Filtros',
  filtersApply: 'Aplicar filtros',
  filtersClear: 'Limpar filtros',
  empty: 'Nenhum produto encontrado',
  emptyHint: 'Remova algum filtro ou busque por outro termo.',
} as const;

const sortDefaults: Record<string, string> = {
  relevance: 'Mais relevantes',
  price_asc: 'Menor preço',
  price_desc: 'Maior preço',
  newest: 'Lançamentos',
  discount: 'Maiores descontos',
};

// Classes estaticas (o Tailwind so gera o que enxerga no codigo).
const xsCols: Record<number, string> = { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3' };
const mdCols: Record<number, string> = { 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-4' };
const lgCols: Record<number, string> = { 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4', 5: 'lg:grid-cols-5', 6: 'lg:grid-cols-6' };

const asArray = (v: string | readonly string[] | undefined): string[] => (v === undefined ? [] : typeof v === 'string' ? [v] : [...v]);

/**
 * Grid de produtos (PLP). Tudo em HTML de servidor e funcional sem JS:
 *  - ordenacao: `<form method=get>` com `<select>` e botao;
 *  - filtros: formulario GET dentro de um drawer `<dialog>` (focus trap e Esc
 *    nativos); o unico JS e o `OverlayTrigger` que abre o drawer;
 *  - paginacao: links reais (`?page=N`, pagina 1 = URL limpa) com rel prev/next;
 *  - resultados: `role=status` com a contagem; vazio tem mensagem e saida.
 * A primeira linha (`columns.lg` cards) carrega eager; o resto fica lazy e com
 * `content-visibility: auto` + tamanho intrinseco declarado depois de 2 linhas.
 * O H1 e do template; aqui ha um h2 so para leitores de tela e cada card e h3.
 */
export function ProductGrid({
  columns = { xs: 2, md: 3, lg: 4 },
  pageSize = 24,
  sort = ['relevance', 'price_asc', 'price_desc', 'newest', 'discount'],
  facets = [],
  products = [],
  total = 0,
  page = 1,
  basePath = '',
  query = {},
  currentSort,
  filters = [],
  labels,
}: ProductGridProps) {
  const l = { ...defaults, ...labels };
  const sortLabels = { ...sortDefaults, ...labels?.sortOptions };
  const xs = columns.xs ?? 2;
  const md = columns.md ?? 3;
  const lg = columns.lg ?? 4;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const visibleFilters = filters.filter((f) => facets.includes(f.id));
  const q: GridQuery = query;
  // Hidden inputs para preservar o que o formulario nao edita.
  const carry = (omit: (key: string) => boolean) =>
    Object.keys(q)
      .filter((key) => key !== 'page' && !omit(key))
      .flatMap((key) => asArray(q[key]).map((value) => <input key={`${key}=${value}`} type="hidden" name={key} value={value} />));
  const sizes = `(min-width: 1024px) ${Math.round(100 / lg)}vw, (min-width: 768px) ${Math.round(100 / md)}vw, ${Math.round(100 / xs)}vw`;
  const active = currentSort ?? asArray(q.sort)[0] ?? sort[0];

  return (
    <section className="mx-auto mb-20 max-w-7xl px-4">
      <h2 className="sr-only">{l.heading}</h2>

      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <p role="status" className="min-h-6 text-sm text-on-surface-muted">
          {total === 1 ? l.resultsOne : fill(l.results, { count: total })}
        </p>
        <div className="flex flex-wrap items-end gap-3">
          {visibleFilters.length > 0 && (
            <OverlayTrigger targetId={FILTERS_ID} className={buttonClasses({ variant: 'secondary', size: 'sm' })}>
              {l.filter}
            </OverlayTrigger>
          )}
          {sort.length > 1 && (
            <form method="get" action={basePath || undefined} className="flex items-end gap-2">
              {carry((key) => key === 'sort')}
              <Select
                name="sort"
                label={l.sortBy}
                defaultValue={active}
                options={sort.map((id) => ({ value: id, label: sortLabels[id] ?? id }))}
              />
              <Button type="submit" variant="secondary" size="sm">
                {l.sortApply}
              </Button>
            </form>
          )}
        </div>
      </div>

      {visibleFilters.length > 0 && (
        <Overlay id={FILTERS_ID} title={l.filtersTitle} side="left">
          <form method="get" action={basePath || undefined} className="flex h-full flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {carry((key) => visibleFilters.some((f) => f.id === key))}
              {visibleFilters.map((filter) => {
                const selected = asArray(q[filter.id]);
                return (
                  <fieldset key={filter.id} className="grid gap-1">
                    <legend className="mb-1 font-bold">{filter.label}</legend>
                    {filter.options.map((option) => (
                      <Checkbox
                        key={option.value}
                        name={filter.id}
                        value={option.value}
                        defaultChecked={selected.includes(option.value)}
                        label={option.count === undefined ? option.label : `${option.label} (${option.count})`}
                      />
                    ))}
                  </fieldset>
                );
              })}
            </div>
            <div className="flex gap-2 border-t border-border p-4">
              <Button type="submit" className="flex-1">
                {l.filtersApply}
              </Button>
              <a href={`${basePath}${toQueryString(Object.fromEntries(Object.entries(q).filter(([k]) => k === 'sort')))}` || '?'} className="inline-flex min-h-11 items-center px-4 underline underline-offset-4">
                {l.filtersClear}
              </a>
            </div>
          </form>
        </Overlay>
      )}

      {products.length === 0 ? (
        <div className="grid justify-items-center gap-2 py-16 text-center">
          <p className="text-lg font-bold">{l.empty}</p>
          <p className="text-on-surface-muted">{l.emptyHint}</p>
          {Object.keys(q).some((key) => key !== 'sort' && key !== 'page') && (
            <a href={basePath || '?'} className="inline-flex min-h-11 items-center underline underline-offset-4">
              {l.filtersClear}
            </a>
          )}
        </div>
      ) : (
        <ul className={`grid gap-x-3 gap-y-6 ${xsCols[xs] ?? 'grid-cols-2'} ${mdCols[md] ?? 'md:grid-cols-3'} ${lgCols[lg] ?? 'lg:grid-cols-4'}`}>
          {products.map((product, i) => (
            <li key={product.href} className={i >= lg * 2 ? '[contain-intrinsic-size:auto_420px] [content-visibility:auto]' : undefined}>
              <ProductCard {...product} priority={i < lg} sizes={sizes} />
            </li>
          ))}
        </ul>
      )}

      <Pagination
        className="mt-8"
        currentPage={page}
        totalPages={totalPages}
        hrefFor={(p) => pageHref(basePath, q, p)}
      />
    </section>
  );
}
