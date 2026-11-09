import { defineSection } from '../define.ts';
import { Header } from './header.tsx';
import { headerSpec } from './header.spec.ts';

export { CartButton, Header, MINICART_ID, NAV_DRAWER_ID, SkipLink } from './header.tsx';
export { headerSchema, type HeaderProps } from './header.schema.ts';
export { headerSpec };

export const header = defineSection({ ...headerSpec, Component: Header });
export { matchesPattern, resolveHeaderVariant, type HeaderVariant, type VariantRule } from './variant.ts';
