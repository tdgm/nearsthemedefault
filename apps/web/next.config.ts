import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { NextConfig } from 'next';
import YAML from 'yaml';
import { buildCsp, type CspConfig } from './lib/security/csp.ts';

// Fonte unica: nears/nears.config.yaml. Nada de header ou flag de render
// hardcoded aqui (CLAUDE.md > Seguranca; docs/adr/0008). O `next` roda com
// cwd = apps/web, tanto em dev quanto em build.
const cfg = YAML.parse(
  readFileSync(resolve(process.cwd(), '../../nears/nears.config.yaml'), 'utf8'),
) as {
  rendering: { cacheComponents: boolean; partialPrefetching: boolean; blockingMetadataForAgents: boolean };
  security: {
    headers: {
      hsts: { enabled: boolean; maxAgeSeconds: number; includeSubDomains: boolean; preload: boolean };
      xContentTypeOptions: string;
      referrerPolicy: string;
      permissionsPolicy: string;
      frameAncestors: 'none' | 'self';
      contentSecurityPolicy?: Partial<CspConfig>;
    };
  };
};

const contracts = YAML.parse(
  readFileSync(resolve(process.cwd(), '../../nears/contracts.yaml'), 'utf8'),
) as { geo: { agents: Record<string, string> } };
const agentTokens = Object.keys(contracts.geo.agents).map((a) => a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

// Lista padrao do Next 16.4 (html-bots.js), mantida aqui porque definir htmlLimitedBots a substitui.
const NEXT_DEFAULT_LIMITED_BOTS =
  '[\\w-]+-Google|Google-[\\w-]+|Chrome-Lighthouse|Slurp|DuckDuckBot|baiduspider|yandex|sogou|bitlybot|tumblr|vkShare|quora link preview|redditbot|ia_archiver|Bingbot|BingPreview|applebot|facebookexternalhit|facebookcatalog|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|Yeti|googleweblight';

const h = cfg.security.headers;

const securityHeaders = [
  ...(h.hsts.enabled
    ? [
        {
          key: 'Strict-Transport-Security',
          value: [
            `max-age=${h.hsts.maxAgeSeconds}`,
            h.hsts.includeSubDomains ? 'includeSubDomains' : '',
            h.hsts.preload ? 'preload' : '',
          ]
            .filter(Boolean)
            .join('; '),
        },
      ]
    : []),
  { key: 'X-Content-Type-Options', value: h.xContentTypeOptions },
  { key: 'Referrer-Policy', value: h.referrerPolicy },
  { key: 'Permissions-Policy', value: h.permissionsPolicy },
  // CSP de base (sem script-src): nonce por requisicao forcaria render dinamico em toda
  // rota. Decisao em docs/adr/0025. O schema Zod dos manifests aplica os mesmos defaults.
  buildCsp({ mode: 'baseline', reportOnly: false, formActionOrigins: [], ...h.contentSecurityPolicy }, h.frameAncestors),
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Metadados que dependem de searchParams (canonical/robots de facetas e paginas) sao
  // transmitidos no fim do <body> para UA fora de `htmlLimitedBots`. Crawlers sem JS (IA)
  // precisam deles no <head>: a lista padrao do Next (copiada de next/dist/shared/lib/router/
  // utils/html-bots, que substitui o default ao ser definida) + os agentes declarados em
  // contracts.geo.agents. Usuarios seguem com streaming (docs/adr/0021 s6).
  ...(cfg.rendering.blockingMetadataForAgents
    ? { htmlLimitedBots: new RegExp(`${NEXT_DEFAULT_LIMITED_BOTS}|${agentTokens.join('|')}`, 'i') }
    : {}),
  poweredByHeader: false,
  // Pacotes do monorepo publicados como TypeScript (sem etapa de build propria).
  transpilePackages: ['@nears/manifests', '@nears/sections', '@nears/ui'],
  cacheComponents: cfg.rendering.cacheComponents,
  partialPrefetching: cfg.rendering.partialPrefetching,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
