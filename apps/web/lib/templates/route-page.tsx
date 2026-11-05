import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import type { Resolved } from '../routing/resolve';
import { buildCollectionView, CollectionPage, collectionMetadata } from './collection';
import { InstitutionalPage, institutionalMetadata } from './institutional';
import { LandingPage, landingMetadata } from './landing';

type RawQuery = Record<string, string | string[] | undefined>;

/** Despacha a entidade resolvida para o template certo; null vira 404 real. */
export async function RoutePage({ resolved, searchParams }: { resolved: Resolved | null; searchParams: Promise<RawQuery> }): Promise<ReactNode> {
  if (!resolved) notFound();
  switch (resolved.kind) {
    case 'collection':
    case 'longtail':
      return <CollectionPage resolved={resolved} searchParams={searchParams} />;
    case 'landing':
      return <LandingPage resolved={resolved} />;
    case 'page':
      return <InstitutionalPage resolved={resolved} />;
    case 'pdp':
      return notFound(); // PDP tem rota propria ([slug]/p)
  }
}

export async function routeMetadata(resolved: Resolved | null): Promise<Metadata> {
  if (!resolved) return {};
  switch (resolved.kind) {
    case 'collection':
    case 'longtail':
      return collectionMetadata(await buildCollectionView(resolved));
    case 'landing':
      return landingMetadata(resolved);
    case 'page':
      return institutionalMetadata(resolved);
    case 'pdp':
      return { title: resolved.product.name };
  }
}
