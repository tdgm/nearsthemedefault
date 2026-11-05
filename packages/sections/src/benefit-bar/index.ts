import { defineSection } from '../define.ts';
import { BenefitBar } from './benefit-bar.tsx';
import { benefitBarSpec } from './benefit-bar.spec.ts';

export { BenefitBar } from './benefit-bar.tsx';
export { benefitBarSchema, type BenefitBarProps } from './benefit-bar.schema.ts';
export { benefitBarSpec };

export const benefitBar = defineSection({ ...benefitBarSpec, Component: BenefitBar });
