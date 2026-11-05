import type { MetadataRoute } from 'next';
import { loadAllManifests } from '../lib/manifest';
import { buildRobots, siteUrl } from '../lib/seo';

// robots.txt a partir do manifest (routes > excluded, contracts > geo.agents). Estatico.
export default function robots(): MetadataRoute.Robots {
  return buildRobots(loadAllManifests(), siteUrl());
}
