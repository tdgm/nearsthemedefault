// Registry de sections (blocos de pagina). Fase 2: contrato e validacao; Fase 4:
// sections globais; Fase 5: sections de conteudo.
export * from './define.ts';
export * from './registry.ts';
export { sectionSpecs } from './specs.ts';
export { sectionModules } from './modules.ts';

// Componentes e schemas das sections (consumidos pelo app e pelo Storybook).
export * from './promo-bar/index.ts';
export * from './header/index.ts';
export * from './nav-drawer/index.ts';
export * from './minicart/index.ts';
export * from './footer/index.ts';
export * from './customer-service/index.ts';
export * from './benefit-bar/index.ts';
export * from './section-title/index.ts';
export * from './banner-grid/index.ts';
export * from './category-hub/index.ts';
export * from './event-banner/index.ts';
export * from './banner-full/index.ts';
export * from './quick-filter/index.ts';
export * from './breadcrumb/index.ts';
export * from './text-seo/index.ts';
export * from './faq/index.ts';
export * from './related-links/index.ts';
export * from './hero/index.ts';
export * from './product-card/index.ts';
export * from './product-grid/index.ts';
export * from './showcase/index.ts';
export * from './pdp-gallery/index.ts';
export * from './pdp-buybox/index.ts';
export * from './pdp-shipping/index.ts';
export * from './pdp-details/index.ts';
export * from './pdp-reviews/index.ts';
export * from './pdp-bundle/index.ts';
export * from './pdp-related/index.ts';
export { navigationSchema, type Navigation } from './shared/navigation.ts';
