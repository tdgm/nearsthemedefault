import type { JsonLd } from './jsonld';

/**
 * Serializa JSON-LD para dentro de <script>. Escapa `<` (nada fecha a tag ou abre
 * comentario HTML) e os separadores U+2028/U+2029. Server Component: o bloco
 * existe no HTML inicial, sem JS. `type="application/ld+json"` nao executa, entao
 * a CSP (nonce + strict-dynamic) nao se aplica a ele.
 */
export function serializeJsonLd(data: JsonLd): string {
  return JSON.stringify(data).replace(/</g, '\\u003c').replace(/ /g, '\\u2028').replace(/ /g, '\\u2029');
}

export function JsonLdScript({ data }: { data: JsonLd }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
