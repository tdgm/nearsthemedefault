// Specs (parte pura) das sections implementadas. E o que o gate de build carrega
// em Node: scripts/manifests-validate.mjs -> createRegistry. Cada fase de sections
// (4 e 5) adiciona as suas aqui E em modules.ts.
import type { AnySectionSpec } from './define.ts';
import { headerSpec } from './header/header.spec.ts';
import { minicartSpec } from './minicart/minicart.spec.ts';
import { navDrawerSpec } from './nav-drawer/nav-drawer.spec.ts';
import { promoBarSpec } from './promo-bar/promo-bar.spec.ts';

export const sectionSpecs: readonly AnySectionSpec[] = [promoBarSpec, headerSpec, navDrawerSpec, minicartSpec];
