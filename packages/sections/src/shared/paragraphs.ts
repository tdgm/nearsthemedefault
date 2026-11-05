// Texto "richtext" do CMS = paragrafos separados por linha em branco. HTML cru nao
// e aceito: sem sanitizador decidido, nada entra via dangerouslySetInnerHTML
// (docs/adr/0015). Puro e sem JSX.

/** Divide em paragrafos, descartando vazios e normalizando espacos internos. */
export const toParagraphs = (text: string): string[] =>
  text
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
