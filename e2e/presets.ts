// Expectativas do E2E por preset de nicho (nears/presets/*.yaml). Sem imports de
// Playwright: o vitest tambem importa este arquivo (apps/web/tests/presets.test.ts)
// e confere cada linha contra o YAML, entao a tabela nao pode divergir do preset.
export type PresetExpectation = {
  /** vocabulary.cart / addToCart / addedToCart do preset (mesclado ao padrao). */
  cart: string;
  addToCart: string;
  addedToCart: string;
  /** catalog.variantAxes, na ordem em que a PDP mostra os radiogroups. */
  axes: { id: string; label: string }[];
  /** Eixos que tambem sao facetas do PLP (catalog.facets.available), com o rotulo do vocabulary. */
  axisFacets: { id: string; label: string }[];
  /** catalog.geoAttributes que nenhum eixo cobre: viram linha da tabela de specs e additionalProperty. */
  geoSpecs: string[];
  /** Faceta fora de catalog.facets.indexable: pagina filtrada e noindex,follow. */
  nonIndexableFacet: string;
  /** Faceta em catalog.facets.indexable: valor unico continua indexavel. */
  indexableFacet: { id: string; value: string };
};

export const presetExpectations: Record<string, PresetExpectation> = {
  fashion: {
    cart: 'Sacola',
    addToCart: 'Adicionar à sacola',
    addedToCart: 'Adicionado à sacola.',
    axes: [
      { id: 'color', label: 'Cor' },
      { id: 'size', label: 'Tamanho' },
    ],
    axisFacets: [
      { id: 'size', label: 'Tamanho' },
      { id: 'color', label: 'Cor' },
    ],
    geoSpecs: ['material', 'audience'],
    nonIndexableFacet: 'size',
    indexableFacet: { id: 'color', value: 'color-1' },
  },
  electronics: {
    cart: 'Carrinho',
    addToCart: 'Adicionar ao carrinho',
    addedToCart: 'Adicionado ao carrinho.',
    axes: [
      { id: 'color', label: 'Cor' },
      { id: 'voltage', label: 'Voltagem' },
      { id: 'storage', label: 'Armazenamento' },
    ],
    axisFacets: [
      { id: 'voltage', label: 'Voltagem' },
      { id: 'storage', label: 'Armazenamento' },
    ],
    geoSpecs: ['model', 'mpn', 'weight'],
    nonIndexableFacet: 'voltage',
    indexableFacet: { id: 'brand', value: 'marca-1' },
  },
};

export const E2E_PRESETS = Object.keys(presetExpectations);
