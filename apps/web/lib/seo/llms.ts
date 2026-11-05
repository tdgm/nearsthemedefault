// llms.txt gerado do manifest e do data layer (CLAUDE.md > SEO e GEO). Formato
// llmstxt.org: H1 com o nome, citacao com o resumo, depois secoes com links.
// Texto factual, com numeros e datas (contracts.yaml > geo.requiredEverywhere).
import { formatBRL, formatDate } from '../format';
import type { Campaign, Department, Page, ProductType, Store } from '../data/schemas';
import { absoluteUrl } from './site';

export type LlmsInput = {
  site: string;
  store: Store;
  departments: Department[];
  productTypes: ProductType[];
  campaigns: Campaign[];
  pages: Page[];
};

const link = (label: string, path: string, site: string, note?: string) => `- [${label}](${absoluteUrl(path, site)})${note ? `: ${note}` : ''}`;
const range = (r: { min: number; max: number }, unit: string) => (r.min === r.max ? `${r.max} ${unit}` : `${r.min} a ${r.max} ${unit}`);

export function buildLlmsTxt({ site, store, departments, productTypes, campaigns, pages }: LlmsInput): string {
  const { organization: o, policies: p } = store;
  const addr = o.address;
  const facts = [
    `${o.legalName}${o.taxId ? `, CNPJ ${o.taxId}` : ''}${o.foundingDate ? `, fundada em ${formatDate(`${o.foundingDate}T12:00:00`)}` : ''}.`,
    `Endereço: ${addr.street}, ${addr.locality}/${addr.region}, CEP ${addr.postalCode}.`,
    ...(o.contactPoint ? [`Atendimento (${o.contactPoint.contactType}): ${[o.contactPoint.telephone, o.contactPoint.email].filter(Boolean).join(', ')}.`] : []),
  ];

  const policies = [
    `- Entrega: postagem em ${range(p.shipping.handlingDays, 'dias úteis')} e transporte em ${range(p.shipping.transitDays, 'dias úteis')}; o prazo exato sai da calculadora de frete por CEP em cada produto.`,
    `- Frete de referência: ${formatBRL(p.shipping.rate)}${p.shipping.freeFrom ? `; grátis em compras a partir de ${formatBRL(p.shipping.freeFrom)}` : ''}.`,
    `- Trocas e devoluções: até ${p.returns.days} dias após o recebimento${p.returns.fees === 'FreeReturn' ? ', sem custo de devolução' : ''}.`,
  ];

  const sections: string[] = [
    `# ${store.name}`,
    `> ${o.description}`,
    facts.join('\n'),
    `## Políticas comerciais\n${policies.join('\n')}`,
    `## Departamentos\n${departments.map((d) => link(d.name, `/${d.slug}`, site, d.intro)).join('\n')}`,
    ...(productTypes.length ? [`## Tipos de produto\n${productTypes.map((t) => link(t.name, `/${t.slug}`, site)).join('\n')}`] : []),
    ...(campaigns.length
      ? [`## Campanhas\n${campaigns.map((c) => link(c.name, `/${c.slug}`, site, `de ${formatDate(c.startsAt)} a ${formatDate(c.endsAt)}`)).join('\n')}`]
      : []),
    ...(pages.length ? [`## Institucional\n${pages.map((pg) => link(pg.title, `/${pg.slug}`, site)).join('\n')}`] : []),
    `## Mapas\n${[link('Mapa do site', '/mapa-do-site', site), link('Sitemap XML', '/sitemap.xml', site)].join('\n')}`,
    ...(o.sameAs.length ? [`## Perfis oficiais\n${o.sameAs.map((u) => `- ${u}`).join('\n')}`] : []),
  ];
  return `${sections.join('\n\n')}\n`;
}
