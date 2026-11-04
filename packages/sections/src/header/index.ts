import { defineSection } from '../define.ts';
import { Header } from './header.tsx';
import { headerSpec } from './header.spec.ts';

export { Header, MINICART_ID, NAV_DRAWER_ID } from './header.tsx';
export { headerSchema, type HeaderProps } from './header.schema.ts';
export { headerSpec };

export const header = defineSection({ ...headerSpec, Component: Header });
