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
import { hero } from './hero/index.ts';
import { productCard } from './product-card/index.ts';
import { productGrid } from './product-grid/index.ts';
import { showcase } from './showcase/index.ts';
import { pdpGallery } from './pdp-gallery/index.ts';
import { pdpBuybox } from './pdp-buybox/index.ts';
import { pdpShipping } from './pdp-shipping/index.ts';
import { pdpPickup } from './pdp-pickup/index.ts';
import { pdpDetails } from './pdp-details/index.ts';
import { pdpReviews } from './pdp-reviews/index.ts';
import { pdpBundle } from './pdp-bundle/index.ts';
import { pdpRelated } from './pdp-related/index.ts';

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
  hero,
  productCard,
  productGrid,
  showcase,
  pdpGallery,
  pdpBuybox,
  pdpShipping,
  pdpPickup,
  pdpDetails,
  pdpReviews,
  pdpBundle,
  pdpRelated,
];
