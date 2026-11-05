import type { Metadata } from 'next';
import { EvolutionPanel } from '../components/evolution-panel';
import { getStore } from '../lib/data/client';
import { loadAllManifests } from '../lib/manifest';
import { JsonLdScript, buildMetadata, getSeoContext, graph, organizationNode, searchPath, websiteNode } from '../lib/seo';
import { expandTemplate, repeatCountsFor } from '../lib/templates/expand';
import { getHomeContent } from '../lib/templates/home-content';
import { renderInstances } from '../lib/templates/render';

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStore();
  return buildMetadata({ template: 'home', title: store.name, titleAbsolute: true, description: store.organization.description, path: '/' });
}

/**
 * Home: a composicao (sections, ordem, limite de departamentos em destaque) vem
 * de nears/sections.registry.yaml > templates.home e de
 * nears.config.yaml > composition.home.featuredDepartments (docs/adr/0006); o
 * conteudo vem do data layer. O unico H1 e o nome da loja (visivel so a leitores
 * de tela: o hero e a identidade visual da pagina). JSON-LD: Organization +
 * WebSite/SearchAction (contracts.yaml > seo.byTemplate.home).
 */
export default async function HomePage() {
  const { config, sections } = loadAllManifests();
  const home = await getHomeContent();
  const ctx = await getSeoContext();
  const entries = sections.templates.home?.sections ?? [];
  const instances = expandTemplate(entries, repeatCountsFor(entries, { departments: home.departmentCount }, config));

  return (
    <main>
      <JsonLdScript data={graph(organizationNode(ctx), websiteNode(ctx, searchPath()))} />
      <h1 className="sr-only">{home.storeName}</h1>
      {renderInstances(instances, home.propsFor)}
      {process.env.NODE_ENV !== 'production' && <EvolutionPanel />}
    </main>
  );
}
