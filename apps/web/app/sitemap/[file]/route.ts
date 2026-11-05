import { connection } from 'next/server';
import { loadAllManifests } from '../../../lib/manifest';
import { SITEMAP_HEADERS, collectSitemapEntries, parseSitemapFileName, renderUrlset, sitemapFiles, siteUrl } from '../../../lib/seo';

// Um arquivo do sitemap: /sitemap/{segmento}-{n}.xml. Nome fora do padrao ou
// bloco inexistente = 404 real (nunca um urlset vazio).
export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  await connection();
  const { file } = await params;
  const { sitemapXml } = loadAllManifests().routes;
  const parsed = parseSitemapFileName(file);
  if (!sitemapXml.enabled || !sitemapXml.segmented || !parsed) return new Response(null, { status: 404 });
  const found = sitemapFiles(await collectSitemapEntries(new Date()), sitemapXml.maxUrlsPerFile).find(
    (f) => f.segment === parsed.segment && f.page === parsed.page,
  );
  if (!found) return new Response(null, { status: 404 });
  return new Response(renderUrlset(found.entries, siteUrl()), { headers: SITEMAP_HEADERS });
}
