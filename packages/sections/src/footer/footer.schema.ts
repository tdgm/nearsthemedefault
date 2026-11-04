import { z } from 'zod';
import { imageProp } from '../shared/navigation.ts';

const link = z.strictObject({ label: z.string().min(1), href: z.string().min(1) });

/** Espelha `globals.footer.props` de nears/sections.registry.yaml (+ teste de paridade). */
export const footerSchema = z.strictObject({
  /** Canais de atendimento: telefone, e-mail, horario. `href` torna o item um link (tel:, mailto:). */
  service: z.array(z.strictObject({ label: z.string().min(1), value: z.string().min(1), href: z.string().optional() })).optional(),
  newsletter: z
    .strictObject({
      title: z.string().optional(),
      description: z.string().optional(),
      /** Endpoint do formulario (POST). Sem ele, o bloco nao e renderizado. */
      action: z.string().optional(),
      /** Interesses para segmentar o envio. */
      segments: z.array(z.strictObject({ id: z.string().min(1), label: z.string().min(1) })).optional(),
    })
    .optional(),
  columns: z.array(z.strictObject({ title: z.string().min(1), links: z.array(link).min(1) })).optional(),
  apps: z.array(link).optional(),
  social: z.array(link).optional(),
  seals: z.array(z.strictObject({ label: z.string().min(1), image: imageProp, href: z.string().optional() })).optional(),
  legal: z
    .strictObject({
      companyName: z.string().min(1),
      cnpj: z.string().optional(),
      address: z.string().optional(),
      copyright: z.string().optional(),
      links: z.array(link).optional(),
    })
    .optional(),
  labels: z
    .strictObject({
      region: z.string(),
      service: z.string(),
      newsletterEmail: z.string(),
      newsletterSegments: z.string(),
      newsletterSubmit: z.string(),
      apps: z.string(),
      social: z.string(),
      seals: z.string(),
      cnpj: z.string(),
    })
    .partial()
    .optional(),
});

export type FooterProps = z.infer<typeof footerSchema>;
