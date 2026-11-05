// Modulos completos (spec + componente) das sections implementadas. Usado pelo app
// e por modules.test.ts, que garante spec e modulo em sincronia.
import type { AnySectionModule } from './define.ts';
import { customerService } from './customer-service/index.ts';
import { footer } from './footer/index.ts';
import { header } from './header/index.ts';
import { minicart } from './minicart/index.ts';
import { navDrawer } from './nav-drawer/index.ts';
import { promoBar } from './promo-bar/index.ts';

export const sectionModules: readonly AnySectionModule[] = [promoBar, header, navDrawer, minicart, footer, customerService];
