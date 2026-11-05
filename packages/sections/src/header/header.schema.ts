import { z } from 'zod';
import { imageProp, navigationSchema } from '../shared/navigation.ts';

/** Espelha `globals.header.props` de nears/sections.registry.yaml (+ teste de paridade). */
export const headerSchema = z.strictObject({
  logo: imageProp.extend({ alt: z.string().min(1) }),
  homeHref: z.string().optional(),
  nav: navigationSchema.optional(),
  search: z.boolean().optional(),
  searchHref: z.string().optional(),
  account: z.boolean().optional(),
  accountHref: z.string().optional(),
  wishlist: z.boolean().optional(),
  wishlistHref: z.string().optional(),
  cart: z.boolean().optional(),
  cartCount: z.number().int().nonnegative().optional(),
  wishlistCount: z.number().int().nonnegative().optional(),
  variant: z.enum(['full', 'minimal', 'none']).optional(),
  labels: z
    .strictObject({
      skip: z.string(),
      menu: z.string(),
      search: z.string(),
      searchLabel: z.string(),
      searchPlaceholder: z.string(),
      searchSubmit: z.string(),
      account: z.string(),
      wishlist: z.string(),
      cart: z.string(),
    })
    .partial()
    .optional(),
});

export type HeaderProps = z.infer<typeof headerSchema>;
