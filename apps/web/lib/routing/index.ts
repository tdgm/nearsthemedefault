// Monta o indice de slugs a partir do data layer + routes.manifest.yaml. O
// indice e calculado uma vez por processo (revalida junto com o ISR das rotas).
import { getCampaigns, getDepartments, getPages, getProductTypes } from '../data/client';
import { loadAllManifests } from '../manifest';
import { buildSlugIndex, type SlugEntry } from './slug-index';

let cached: Promise<ReadonlyMap<string, SlugEntry>> | undefined;

export function getSlugIndex(): Promise<ReadonlyMap<string, SlugEntry>> {
  cached ??= (async () => {
    const { config, routes } = loadAllManifests();
    const [departments, types, campaigns, pages] = await Promise.all([
      getDepartments(),
      getProductTypes(),
      getCampaigns(),
      getPages(),
    ]);
    return buildSlugIndex(
      {
        department: departments.map((d) => d.slug),
        'category-flat': config.catalog.flatAxis.enabled ? types.map((t) => t.slug) : [],
        campaign: campaigns.map((c) => c.slug),
        institutional: pages.map((p) => p.slug),
      },
      routes.resolution.reserved.firstSegment,
    );
  })();
  return cached;
}
