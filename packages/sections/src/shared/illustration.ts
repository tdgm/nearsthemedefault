/**
 * Variacao deterministica de matiz para a arte placeholder de categoria/produto
 * (docs/adr/0032): sem isso a MESMA ilustracao se repetia identica em todo card
 * da home e do PLP. Hash simples e estavel por string: o mesmo slug sempre gera
 * o mesmo filtro, em toda renderizacao e entre servidor e cliente, sem JS no
 * cliente (o filtro vai inline no `style` do HTML gerado no servidor).
 *
 * So variacao de CSS (`filter`), nenhuma imagem nova: zero bytes de rede extra
 * (CLAUDE.md > Performance) e zero risco de CLS (filter nao afeta layout).
 *
 * As receitas ficam dentro de uma faixa deliberadamente estreita (matiz +-30deg
 * em torno do laranja/azul-marinho da marca, ou dessaturada) para nao resultar
 * em cor fora da paleta (um card verde-limao ou roxo ao lado dos outros pareceria
 * quebrado, nao "variado").
 */
const RECIPES = [
  '',
  'hue-rotate(28deg)',
  'hue-rotate(-24deg) saturate(1.1)',
  'hue-rotate(150deg) saturate(0.85)',
  'hue-rotate(205deg) saturate(0.9)',
  'grayscale(0.4) brightness(1.05)',
] as const;

function hash(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = (Math.imul(h, 31) + seed.charCodeAt(i)) >>> 0;
  return h;
}

/** Filtro CSS deterministico para `seed` (ex.: o `href` ou `alt` do item), ou `undefined` para a arte original. */
export function illustrationFilter(seed: string): string | undefined {
  const recipe = RECIPES[hash(seed) % RECIPES.length];
  return recipe || undefined;
}
