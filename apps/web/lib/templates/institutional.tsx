import { getDepartments } from '../data/client';
import { loadAllManifests } from '../manifest';
import { JsonLdScript, buildMetadata, getSeoContext, graph, organizationNode, webPageNode } from '../seo';
import type { Resolved } from '../routing/resolve';
import { expandTemplate } from './expand';
import { renderInstances } from './render';

type Institutional = Extract<Resolved, { kind: 'page' }>;

const firstParagraph = (body: string) => body.split(/\n\s*\n/)[0]?.trim() ?? '';

export async function institutionalMetadata(resolved: Institutional) {
  return buildMetadata({ template: 'page', title: resolved.page.title, description: firstParagraph(resolved.page.body), path: `/${resolved.page.slug}` });
}

/** Pagina institucional: H1 = titulo do CMS; corpo em texto simples (sem HTML). */
export async function InstitutionalPage({ resolved }: { resolved: Institutional }) {
  const { sections } = loadAllManifests();
  const departments = await getDepartments();
  const { page } = resolved;
  const ctx = await getSeoContext();
  const instances = expandTemplate(sections.templates.page?.sections ?? [], {});

  const propsFor = (inst: { id: string }): unknown | null => {
    switch (inst.id) {
      case 'text-seo':
        return { richText: page.body, collapsible: false };
      case 'related-links':
        return { title: 'Continue navegando', links: departments.map((d) => ({ label: `Produtos de ${d.name}`, href: `/${d.slug}` })) };
      default:
        return null; // event-banner e banner-full: opcionais, entram com conteudo do CMS
    }
  };

  return (
    <main>
      <JsonLdScript data={graph(organizationNode(ctx), webPageNode(ctx, { name: page.title, description: firstParagraph(page.body), path: `/${page.slug}` }))} />
      <h1 className="mx-auto max-w-3xl px-4 pt-8 pb-2 text-2xl font-bold text-balance md:text-3xl">{page.title}</h1>
      {renderInstances(instances, propsFor)}
    </main>
  );
}
