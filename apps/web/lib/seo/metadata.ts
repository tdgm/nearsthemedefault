// Metadata por template (contracts.yaml > seo). Um unico ponto monta canonical,
// hreflang, Open Graph, Twitter Card e robots, para que nenhuma rota escreva
// <meta> a mao. O titulo recebe o sufixo da marca pelo `title.template` do layout.
import type { Metadata } from 'next';
import { getStore } from '../data/client';
import { loadAllManifests } from '../manifest';
import { absoluteAsset, absoluteUrl, siteUrl } from './site';

/** Chaves de `contracts.yaml > seo.byTemplate`. */
export type SeoTemplate =
  | 'home'
  | 'collection'
  | 'longtail'
  | 'pdp'
  | 'landing'
  | 'page'
  | 'sitemap'
  | 'search'
  | 'notfound'
  // Fase 9 (ADR 0027): login/cadastro, sempre noindex,nofollow (dado pessoal).
  | 'login'
  | 'cadastro'
  // Area da conta (Fase 9c, ADR 0027): mesmo motivo, sempre noindex,nofollow.
  | 'account'
  | 'account-dados'
  | 'account-enderecos'
  | 'account-pedidos'
  | 'account-pedido-detalhe'
  | 'account-favoritos';

export type SeoImage = { url: string; width: number; height: number; alt: string };

export type SeoInput = {
  template: SeoTemplate;
  title: string;
  /** Home: o titulo e o proprio nome da loja, sem sufixo. */
  titleAbsolute?: boolean;
  description: string;
  /** Caminho canonico (`/x` ou `/x?page=2`). */
  path: string;
  /** Sobrescreve o robots do contrato (ex.: faceta combinada = "noindex,follow"). */
  robots?: string;
  image?: SeoImage;
  pagination?: { previous?: string; next?: string };
};

/** Corta no limite de caracteres do contrato, sem partir palavra. */
export function clampDescription(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s.,;:!?-]+$/, '')}…`;
}

type RobotsObject = NonNullable<Metadata['robots']> & object;

/** "noindex,follow,max-image-preview:large" -> objeto do Next. Diretiva desconhecida falha alto. */
export function parseRobots(directives: string): Exclude<RobotsObject, string> {
  const out: Record<string, boolean | string> = {};
  for (const raw of directives.split(',')) {
    const token = raw.trim().toLowerCase();
    if (!token) continue;
    if (token === 'index' || token === 'noindex') out.index = token === 'index';
    else if (token === 'follow' || token === 'nofollow') out.follow = token === 'follow';
    else if (token.startsWith('max-image-preview:')) out['max-image-preview'] = token.split(':')[1]!;
    else throw new Error(`Diretiva de robots desconhecida: "${token}"`);
  }
  return out as Exclude<RobotsObject, string>;
}

/** Robots do template: contrato por template, ou o padrao global. */
export function robotsFor(template: SeoTemplate, override?: string): string {
  const { seo } = loadAllManifests().contracts;
  return override ?? seo.byTemplate[template]?.robots ?? seo.global.robotsDefault;
}

export async function buildMetadata(input: SeoInput): Promise<Metadata> {
  const { config, contracts } = loadAllManifests();
  const store = await getStore();
  const site = siteUrl();
  const description = clampDescription(input.description, contracts.seo.global.descriptionMaxChars);
  const url = absoluteUrl(input.path, site);
  const image = input.image ?? (store.ogImage ? { url: store.ogImage.src, width: store.ogImage.width, height: store.ogImage.height, alt: store.ogImage.alt ?? store.name } : undefined);
  const ogImages = image ? [{ url: absoluteAsset(image.url, site), width: image.width, height: image.height, alt: image.alt }] : undefined;
  const locale = config.locale.default;

  return {
    title: input.titleAbsolute ? { absolute: input.title } : input.title,
    description,
    alternates: {
      canonical: url,
      languages: { [locale]: url, 'x-default': url },
    },
    robots: parseRobots(robotsFor(input.template, input.robots)),
    openGraph: {
      type: 'website',
      siteName: store.name,
      locale: locale.replace('-', '_'),
      title: input.title,
      description,
      url,
      ...(ogImages ? { images: ogImages } : {}),
    },
    twitter: {
      card: contracts.seo.global.twitter.card as 'summary_large_image',
      title: input.title,
      description,
      ...(ogImages ? { images: ogImages.map((i) => i.url) } : {}),
    },
    ...(input.pagination && (input.pagination.previous || input.pagination.next)
      ? {
          pagination: {
            ...(input.pagination.previous ? { previous: absoluteUrl(input.pagination.previous, site) } : {}),
            ...(input.pagination.next ? { next: absoluteUrl(input.pagination.next, site) } : {}),
          },
        }
      : {}),
  };
}
