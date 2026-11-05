/**
 * Serializa JSON-LD para dentro de <script>. Escapa `<` (nada fecha a tag ou abre
 * comentario HTML) e os separadores U+2028/U+2029. `type="application/ld+json"`
 * nao executa, entao a CSP (nonce + strict-dynamic) nao se aplica ao bloco.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replaceAll('<', '\\u003c').replaceAll('\u2028', '\\u2028').replaceAll('\u2029', '\\u2029');
}
