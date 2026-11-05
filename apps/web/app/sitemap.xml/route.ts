import { connection } from 'next/server';
import { loadAllManifests } from '../../lib/manifest';
import { SITEMAP_HEADERS, collectSitemapEntries, renderSitemapIndex, renderUrlset, sitemapFiles, siteUrl } from '../../lib/seo';

// Indice do sitemap segmentado (routes.manifest.yaml > sitemapXml). "Agora" decide
// quais campanhas estao no ar, entao e dado de requisicao; a CDN guarda 1h.
export async function GET() {
  await connection();
  const { sitemapXml } = loadAllManifests().routes;
  if (!sitemapXml.enabled) return new Response(null, { status: 404 });
  const segments = await collectSitemapEntries(new Date());
  const site = siteUrl();
  const body = sitemapXml.segmented
    ? renderSitemapIndex(sitemapFiles(segments, sitemapXml.maxUrlsPerFile), site)
    : renderUrlset(Object.values(segments).flat(), site);
  return new Response(body, { headers: SITEMAP_HEADERS });
}
