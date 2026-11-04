// Painel de evolucao da home (so durante a construcao do template). Some ou
// vira pagina interna quando a Fase 6 implementar a home real.

export type PhaseStatus = 'concluida' | 'em-andamento' | 'pendente';

export const phases: { id: number; name: string; status: PhaseStatus }[] = [
  { id: 0, name: 'Fundação (monorepo, Next 16, testes, CI)', status: 'concluida' },
  { id: 1, name: 'Tokens', status: 'concluida' },
  { id: 2, name: 'Manifests e registry', status: 'concluida' },
  { id: 3, name: 'Design system (packages/ui)', status: 'em-andamento' },
  { id: 4, name: 'Sections globais', status: 'pendente' },
  { id: 5, name: 'Sections de conteúdo', status: 'pendente' },
  { id: 6, name: 'Templates e rotas', status: 'pendente' },
  { id: 7, name: 'SEO e GEO', status: 'pendente' },
  { id: 8, name: 'Endurecimento', status: 'pendente' },
];

export const statusLabel: Record<PhaseStatus, string> = {
  concluida: 'concluída',
  'em-andamento': 'em andamento',
  pendente: 'pendente',
};

/** URL de exemplo por id de rota, para clicar e conferir o roteamento. */
export const exampleHref: Record<string, string> = {
  home: '/',
  department: '/departamento-exemplo',
  'department-category': '/departamento-exemplo/categoria-exemplo',
  'department-category-sub': '/departamento-exemplo/categoria-exemplo/sub-exemplo',
  'category-flat': '/tipo-exemplo',
  'category-flat-attribute': '/tipo-exemplo/atributo-exemplo',
  longtail: '/b/palavra-chave-exemplo',
  campaign: '/campanha-exemplo',
  'campaign-segment': '/campanha-exemplo/segmento-exemplo',
  pdp: '/produto-exemplo/p',
  search: '/s',
  institutional: '/pagina-exemplo',
  'sitemap-html': '/mapa-do-site',
  // /404 literal cairia no [slug] (200); este caminho nao casa com nenhuma
  // rota e mostra o app/not-found.tsx com status 404 de verdade.
  'not-found': '/a/b/c/d/e',
};

/** Estados de tela que nao sao rotas proprias (links de conferencia). */
export const stateLinks: { label: string; href: string }[] = [
  { label: 'Busca vazia (sem termo)', href: '/s' },
  { label: 'Busca sem resultados', href: '/s?q=camiseta' },
  { label: 'Página não encontrada (404)', href: '/a/b/c/d/e' },
];
