// robots.txt gerado do manifest (CLAUDE.md > SEO e GEO). Duas fontes:
//  - routes.manifest.yaml > excluded: o que nenhum crawler deve ver;
//  - contracts.yaml > geo.agents: a politica por agente de IA (docs/adr/0016).
// O Disallow do robots.txt casa por PREFIXO (docs/adr/0003): "Disallow: /s"
// bloquearia /saias e /smartphones. Por isso cada segmento vira tres linhas
// exatas (`/seg$`, `/seg/`, `/seg?`) e os prefixos tem de terminar em "/".
import type { MetadataRoute } from 'next';
import type { Manifests } from '@nears/manifests';

type Rules = Pick<Manifests, 'routes' | 'contracts'>;

export function disallowLines({ routes }: Pick<Rules, 'routes'>): string[] {
  const { disallowSegments, disallowPrefixes } = routes.excluded;
  return [...disallowSegments.flatMap((seg) => [`/${seg}$`, `/${seg}/`, `/${seg}?`]), ...disallowPrefixes];
}

export function buildRobots(manifests: Rules, site: string): MetadataRoute.Robots {
  const disallow = disallowLines(manifests);
  type Rule = { userAgent: string; allow?: string; disallow?: string | string[] };
  const rules: Rule[] = [{ userAgent: '*', allow: '/', disallow }];

  // Um grupo especifico SUBSTITUI o grupo `*` para aquele agente (RFC 9309): por isso
  // o agente liberado repete os mesmos Disallow, em vez de herdar.
  for (const [agent, policy] of Object.entries(manifests.contracts.geo.agents)) {
    if (policy === 'allow') rules.push({ userAgent: agent, allow: '/', disallow });
    else if (policy === 'disallow') rules.push({ userAgent: agent, disallow: '/' });
    else throw new Error(`contracts.yaml > geo.agents.${agent} = "decide": defina allow ou disallow antes de publicar (docs/adr/0016)`);
  }

  return { rules, ...(manifests.routes.sitemapXml.enabled ? { sitemap: `${site}/sitemap.xml` } : {}) };
}
