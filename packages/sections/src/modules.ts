// Modulos completos (spec + componente) das sections implementadas. Usado pelo app
// e por modules.test.ts, que garante spec e modulo em sincronia.
import type { AnySectionModule } from './define.ts';
import { customerService } from './customer-service/index.ts';
import { footer } from './footer/index.ts';
import { header } from './header/index.ts';
import { minicart } from './minicart/index.ts';
import { navDrawer } from './nav-drawer/index.ts';
import { promoBar } from './promo-bar/index.ts';
import { benefitBar } from './benefit-bar/index.ts';
import { sectionTitle } from './section-title/index.ts';
import { bannerGrid } from './banner-grid/index.ts';
import { categoryHub } from './category-hub/index.ts';
import { eventBanner } from './event-banner/index.ts';
import { bannerFull } from './banner-full/index.ts';
import { quickFilter } from './quick-filter/index.ts';
import { breadcrumbSection } from './breadcrumb/index.ts';
import { textSeo } from './text-seo/index.ts';
import { faq } from './faq/index.ts';
import { relatedLinks } from './related-links/index.ts';

export const sectionModules: readonly AnySectionModule[] = [promoBar, header, navDrawer, minicart, footer, customerService,
  benefitBar,
  sectionTitle,
  bannerGrid,
  categoryHub,
  eventBanner,
  bannerFull,
  quickFilter,
  breadcrumbSection,
  textSeo,
  faq,
  relatedLinks,
];
