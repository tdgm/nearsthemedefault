// Microcopy com placeholders ("Favoritar {name}"). Puro: textos vem de `labels`
// (vocabulario da loja), nunca montados por concatenacao no componente.
export const fill = (template: string, values: Record<string, string | number>): string =>
  template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
