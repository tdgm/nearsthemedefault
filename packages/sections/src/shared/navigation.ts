import { z } from 'zod';

// Navegacao vem do CMS (`navigation` em nears/*.yaml e so uma referencia). Estas
// formas sao compartilhadas por header, nav-drawer, footer e mapa do site.
const link = z.strictObject({ label: z.string().min(1), href: z.string().min(1) });

export const navGroupSchema = z.strictObject({
  label: z.string().min(1),
  href: z.string().optional(),
  links: z.array(link),
});

export const navDepartmentSchema = z.strictObject({
  label: z.string().min(1),
  href: z.string().min(1),
  groups: z.array(navGroupSchema).optional(),
  highlight: z.strictObject({ label: z.string(), href: z.string() }).optional(),
  promo: z.strictObject({ title: z.string(), href: z.string(), image: z.strictObject({ src: z.string(), width: z.number(), height: z.number(), alt: z.string() }).optional() }).optional(),
});

export const navigationSchema = z.strictObject({ departments: z.array(navDepartmentSchema) });

export type NavGroup = z.infer<typeof navGroupSchema>;
export type NavDepartment = z.infer<typeof navDepartmentSchema>;
export type Navigation = z.infer<typeof navigationSchema>;

export const imageProp = z.strictObject({
  src: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  alt: z.string().optional(),
});
