import { defineSection } from '../define.ts';
import { NavDrawer } from './nav-drawer.tsx';
import { navDrawerSpec } from './nav-drawer.spec.ts';

export { NavDrawer } from './nav-drawer.tsx';
export { navDrawerSchema, type NavDrawerProps } from './nav-drawer.schema.ts';
export { navDrawerSpec };

export const navDrawer = defineSection({ ...navDrawerSpec, Component: NavDrawer });
