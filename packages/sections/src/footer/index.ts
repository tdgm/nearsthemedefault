import { defineSection } from '../define.ts';
import { Footer } from './footer.tsx';
import { footerSpec } from './footer.spec.ts';

export { Footer } from './footer.tsx';
export { footerSchema, type FooterProps } from './footer.schema.ts';
export { footerSpec };

export const footer = defineSection({ ...footerSpec, Component: Footer });
