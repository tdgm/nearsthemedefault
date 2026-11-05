import { defineSection } from '../define.ts';
import { Hero } from './hero.tsx';
import { heroSpec } from './hero.spec.ts';

export { Hero } from './hero.tsx';
export { heroSchema, type HeroProps } from './hero.schema.ts';
export { heroSpec };

export const hero = defineSection({ ...heroSpec, Component: Hero });
