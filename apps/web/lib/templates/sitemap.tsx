import { getCampaigns, getDepartments, getPages, getProductTypes } from '../data/client';
import { loadAllManifests } from '../manifest';
import { JsonLdScript, buildMetadata, getSeoContext, graph, organizationNode, webPageNode } from '../seo';
import { expandTemplate, repeatCountsFor } from './expand';
import { renderInstances } from './render';

export const SITEMAP_PATH = '/mapa-do-site';

export async function sitemapMetadata() {
  return buildMetadata({
    template: 'sitemap',
    title: 'Mapa do site',
    description: 'Mapa do site com todos os departamentos, categorias, campanhas e páginas institucionais da loja.',
    path: SITEMAP_PATH,
  });
}

/** Mapa do site (HTML): hub de linkagem interna, sem limite de departamentos (ADR 0006). */
export async function SitemapPage() {
  const { config, sections } = loadAllManifests();
  const [departments, types, campaigns, pages] = await Promise.all([getDepartments(), getProductTypes(), getCampaigns(), getPages()]);
  const entries = sections.templates.sitemap?.sections ?? [];
  const instances = expandTemplate(entries, repeatCountsFor(entries, { departments: departments.length }, config));

  const propsFor = (inst: { id: string; repeatIndex?: number }): unknown | null => {
    switch (inst.id) {
      case 'section-title':
        return { text: 'Mapa do site', level: 'h1' };
      case 'related-links': {
        if (inst.repeatIndex !== undefined) {
          const d = departments[inst.repeatIndex];
          if (!d) return null;
          return {
            title: d.name,
            links: [
              { label: `Todos os produtos de ${d.name}`, href: `/${d.slug}` },
              ...d.categories.flatMap((c) => [
                { label: `${c.name} em ${d.name}`, href: `/${d.slug}/${c.slug}` },
                ...c.subcategories.map((s) => ({ label: `${s.name} em ${c.name}`, href: `/${d.slug}/${c.slug}/${s.slug}` })),
              ]),
            ],
          };
        }
        return {
          title: 'Outras páginas',
          links: [
            ...(config.catalog.flatAxis.enabled ? types.map((t) => ({ label: `Produtos do tipo ${t.name}`, href: `/${t.slug}` })) : []),
            ...campaigns.flatMap((c) => [{ label: c.name, href: `/${c.slug}` }, ...c.segments.map((s) => ({ label: `${c.name}: ${s.name}`, href: `/${c.slug}/${s.slug}` }))]),
            ...pages.map((p) => ({ label: p.title, href: `/${p.slug}` })),
            { label: 'Buscar produtos na loja', href: '/s' },
          ],
        };
      }
      default:
        return null;
    }
  };

  const ctx = await getSeoContext();
  return (
    <main>
      <JsonLdScript data={graph(organizationNode(ctx), webPageNode(ctx, { name: 'Mapa do site', path: SITEMAP_PATH }))} />
      {renderInstances(instances, propsFor)}
    </main>
  );
}
