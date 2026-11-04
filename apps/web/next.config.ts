import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { NextConfig } from 'next';
import YAML from 'yaml';

// Fonte unica: nears/nears.config.yaml. Nada de header ou flag de render
// hardcoded aqui (CLAUDE.md > Seguranca; docs/adr/0008). O `next` roda com
// cwd = apps/web, tanto em dev quanto em build.
const cfg = YAML.parse(
  readFileSync(resolve(process.cwd(), '../../nears/nears.config.yaml'), 'utf8'),
) as {
  rendering: { cacheComponents: boolean; partialPrefetching: boolean };
  security: {
    headers: {
      hsts: { enabled: boolean; maxAgeSeconds: number; includeSubDomains: boolean; preload: boolean };
      xContentTypeOptions: string;
      referrerPolicy: string;
      permissionsPolicy: string;
      frameAncestors: 'none' | 'self';
    };
  };
};

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
  // So frame-ancestors por enquanto. A CSP completa com nonce (strict-dynamic)
  // exige proxy.ts e forca render dinamico em toda rota: decisao em aberto,
  // ver docs/adr/0009-fase-0-fundacao.md.
  { key: 'Content-Security-Policy', value: `frame-ancestors '${h.frameAncestors}'` },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  cacheComponents: cfg.rendering.cacheComponents,
  partialPrefetching: cfg.rendering.partialPrefetching,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
