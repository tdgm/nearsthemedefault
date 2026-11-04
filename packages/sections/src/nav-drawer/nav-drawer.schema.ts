import { z } from 'zod';
import { navDepartmentSchema } from '../shared/navigation.ts';

/** Espelha `globals.nav-drawer.props` de nears/sections.registry.yaml (+ teste de paridade). */
export const navDrawerSchema = z.strictObject({
  departments: z.array(navDepartmentSchema),
  labels: z.strictObject({ title: z.string(), nav: z.string(), viewAll: z.string(), close: z.string() }).partial().optional(),
});

export type NavDrawerProps = z.infer<typeof navDrawerSchema>;
