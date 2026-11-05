import type { JsonLd } from './jsonld';
import { serializeJsonLd } from './serialize';

/** Server Component: o bloco existe no HTML inicial, sem JS (CLAUDE.md > SEO e GEO). */
export function JsonLdScript({ data }: { data: JsonLd }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
