import { defineSection } from '../define.ts';
import { CustomerService } from './customer-service.tsx';
import { customerServiceSpec } from './customer-service.spec.ts';

export { CustomerService } from './customer-service.tsx';
export { customerServiceSchema, type CustomerServiceProps } from './customer-service.schema.ts';
export { customerServiceSpec };

export const customerService = defineSection({ ...customerServiceSpec, Component: CustomerService });
