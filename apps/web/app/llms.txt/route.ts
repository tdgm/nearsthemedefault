import { getCampaigns, getDepartments, getPages, getProductTypes, getStore } from '../../lib/data/client';
import { loadConfig } from '../../lib/manifest';
import { buildLlmsTxt, siteUrl } from '../../lib/seo';

// llms.txt: resumo citavel da loja para motores generativos, gerado do data layer.
export async function GET() {
  const [store, departments, productTypes, campaigns, pages] = await Promise.all([getStore(), getDepartments(), getProductTypes(), getCampaigns(), getPages()]);
  const body = buildLlmsTxt({
    site: siteUrl(),
    store,
    departments,
    productTypes: loadConfig().catalog.flatAxis.enabled ? productTypes : [],
    campaigns,
    pages,
  });
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } });
}
