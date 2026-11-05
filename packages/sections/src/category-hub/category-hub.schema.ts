import { z } from 'zod';
import { imageProp } from '../shared/navigation.ts';

/** Espelha `sections.category-hub.props` de nears/sections.registry.yaml (+ teste de paridade). */
export const categoryHubSchema = z.strictObject({
  /** Categorias a exibir (o template as resolve do departamento). */
  items: z
    .array(
      z.strictObject({
        image: imageProp,
        label: z.string().min(1),
        /** Menor preco da categoria, em reais. Sem ele, o card nao mostra "a partir de". */
        fromPrice: z.number().nonnegative().optional(),
        href: z.string().min(1),
      }),
    )
    .min(1),
  /** Maximo de cards (padrao 6). */
  limit: z.number().int().positive().default(6),
  labels: z.strictObject({ region: z.string().optional(), fromPrice: z.string().optional() }).optional(),
});

export type CategoryHubProps = z.input<typeof categoryHubSchema>;
