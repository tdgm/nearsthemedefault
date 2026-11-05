import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { Suspense, type ReactNode } from 'react';
import { getDepartments, getProducts } from '../data/client';
import { cardAspect, toProductCard } from '../data/mappers';
import { loadAllManifests } from '../manifest';
import { isCampaignActive, type Resolved } from '../routing/resolve';
import { expandTemplate } from './expand';
import { renderInstances } from './render';

type Landing = Extract<Resolved, { kind: 'landing' }>;

const BANNER = {
  desktop: { src: '/placeholders/hero-desktop.jpg', webp: '/placeholders/hero-desktop.webp', avif: '/placeholders/hero-desktop.avif', width: 1440, height: 560 },
  mobile: { src: '/placeholders/hero-mobile.jpg', webp: '/placeholders/hero-mobile.webp', avif: '/placeholders/hero-mobile.avif', width: 750, height: 900 },
} as const;

export const landingTitle = (r: Landing) => (r.route === 'campaign-segment' ? `${r.campaign.name}: ${r.segment.name}` : r.campaign.name);

async function LandingBody({ resolved }: { resolved: Landing }) {
  const { config, sections } = loadAllManifests();
  const [departments, products] = await Promise.all([getDepartments(), getProducts()]);
  const aspect = cardAspect(config);
  const { campaign } = resolved;
  const title = landingTitle(resolved);
  const instances = expandTemplate(sections.templates.landing?.sections ?? [], {});
  const base = `/${campaign.slug}`;

  const propsFor = (inst: { id: string }): unknown | null => {
    switch (inst.id) {
      case 'hero':
        return { slides: [{ imageDesktop: BANNER.desktop, imageMobile: BANNER.mobile, alt: title }] };
      case 'banner-grid':
        return campaign.segments.length && resolved.route === 'campaign'
          ? { columns: campaign.segments.length >= 3 ? '3' : '2', banners: campaign.segments.map((s) => ({ image: BANNER.mobile, alt: `${campaign.name}: ${s.name}`, href: `${base}/${s.slug}` })) }
          : null;
      case 'showcase':
        return { variant: 'static', title: `Destaques de ${title}`, source: 'collection', products: products.slice(0, 8).map((p) => toProductCard(p, { aspect })) };
      case 'banner-full':
        return { image: BANNER.desktop, alt: '', headline: campaign.name, body: 'Condições especiais por tempo limitado.', cta: 'Ver todos os departamentos', href: `/${departments[0]?.slug ?? ''}` };
      case 'text-seo':
        return { title: `O que é ${title}?`, richText: `${title} reúne produtos selecionados com condições especiais durante o período da campanha.\n\nAs condições valem até a data informada na página e podem mudar sem aviso depois dela.` };
      case 'related-links':
        return { title: 'Continue explorando', links: departments.map((d) => ({ label: `Produtos de ${d.name}`, href: `/${d.slug}` })) };
      default:
        return null;
    }
  };

  return (
    <>
      <h1 className="sr-only">{title}</h1>
      {renderInstances(instances, propsFor)}
    </>
  );
}

/** Fora da janela (startsAt/endsAt) a campanha redireciona (routes.manifest > campaign.schedule.onExpire). */
async function ActiveGuard({ resolved, children }: { resolved: Landing; children: ReactNode }) {
  await connection(); // "agora" e dado de requisicao
  if (!isCampaignActive(resolved.campaign, new Date())) redirect('/');
  return children;
}

export function LandingPage({ resolved }: { resolved: Landing }) {
  return (
    <main>
      <Suspense fallback={<LandingBody resolved={resolved} />}>
        <ActiveGuard resolved={resolved}>
          <LandingBody resolved={resolved} />
        </ActiveGuard>
      </Suspense>
    </main>
  );
}
