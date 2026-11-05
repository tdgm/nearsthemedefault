// Specs (parte pura) das sections implementadas. E o que o gate de build carrega
// em Node: scripts/manifests-validate.mjs -> createRegistry. Cada fase de sections
// (4 e 5) adiciona as suas aqui E em modules.ts.
import type { AnySectionSpec } from './define.ts';
import { customerServiceSpec } from './customer-service/customer-service.spec.ts';
import { footerSpec } from './footer/footer.spec.ts';
import { headerSpec } from './header/header.spec.ts';
import { minicartSpec } from './minicart/minicart.spec.ts';
import { navDrawerSpec } from './nav-drawer/nav-drawer.spec.ts';
import { promoBarSpec } from './promo-bar/promo-bar.spec.ts';
import { benefitBarSpec } from './benefit-bar/benefit-bar.spec.ts';
import { sectionTitleSpec } from './section-title/section-title.spec.ts';
import { bannerGridSpec } from './banner-grid/banner-grid.spec.ts';
import { categoryHubSpec } from './category-hub/category-hub.spec.ts';
import { eventBannerSpec } from './event-banner/event-banner.spec.ts';
import { bannerFullSpec } from './banner-full/banner-full.spec.ts';
import { quickFilterSpec } from './quick-filter/quick-filter.spec.ts';
import { breadcrumbSpec } from './breadcrumb/breadcrumb.spec.ts';
import { textSeoSpec } from './text-seo/text-seo.spec.ts';
import { faqSpec } from './faq/faq.spec.ts';
import { relatedLinksSpec } from './related-links/related-links.spec.ts';
import { heroSpec } from './hero/hero.spec.ts';
import { productCardSpec } from './product-card/product-card.spec.ts';
import { productGridSpec } from './product-grid/product-grid.spec.ts';
import { showcaseSpec } from './showcase/showcase.spec.ts';
import { pdpGallerySpec } from './pdp-gallery/pdp-gallery.spec.ts';
import { pdpBuyboxSpec } from './pdp-buybox/pdp-buybox.spec.ts';
import { pdpShippingSpec } from './pdp-shipping/pdp-shipping.spec.ts';
import { pdpDetailsSpec } from './pdp-details/pdp-details.spec.ts';
import { pdpReviewsSpec } from './pdp-reviews/pdp-reviews.spec.ts';
import { pdpBundleSpec } from './pdp-bundle/pdp-bundle.spec.ts';
import { pdpRelatedSpec } from './pdp-related/pdp-related.spec.ts';

export const sectionSpecs: readonly AnySectionSpec[] = [
  promoBarSpec,
  headerSpec,
  navDrawerSpec,
  minicartSpec,
  footerSpec,
  customerServiceSpec,
  benefitBarSpec,
  sectionTitleSpec,
  bannerGridSpec,
  categoryHubSpec,
  eventBannerSpec,
  bannerFullSpec,
  quickFilterSpec,
  breadcrumbSpec,
  textSeoSpec,
  faqSpec,
  relatedLinksSpec,
  heroSpec,
  productCardSpec,
  productGridSpec,
  showcaseSpec,
  pdpGallerySpec,
  pdpBuyboxSpec,
  pdpShippingSpec,
  pdpDetailsSpec,
  pdpReviewsSpec,
  pdpBundleSpec,
  pdpRelatedSpec,
];
