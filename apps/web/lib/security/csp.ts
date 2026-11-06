// Content-Security-Policy a partir de nears.config.yaml > security.headers
// (docs/adr/0025). Puro e sem imports: o next.config.ts o carrega e o vitest o testa.
//
// Modo `baseline`: so diretivas que NAO dependem do conteudo dos scripts da pagina
// (object-src, base-uri, form-action, frame-ancestors). Nao ha `script-src`: o bootstrap
// inline do Next muda a cada build e a unica forma de cobri-lo (nonce por requisicao)
// obriga render dinamico em toda rota, o que desfaz SSG/PPR e os budgets de CWV.

export type CspConfig = {
  mode: 'baseline' | 'off';
  reportOnly: boolean;
  /** Origens https extras que um formulario pode enviar (ex.: carrinho no dominio do checkout). */
  formActionOrigins: readonly string[];
};

export type CspHeader = { key: string; value: string };

export function buildCsp(csp: CspConfig, frameAncestors: 'none' | 'self'): CspHeader {
  const directives =
    csp.mode === 'baseline'
      ? [
          "object-src 'none'",
          "base-uri 'self'",
          `form-action ${["'self'", ...csp.formActionOrigins].join(' ')}`,
          `frame-ancestors '${frameAncestors}'`,
        ]
      : [`frame-ancestors '${frameAncestors}'`];
  return {
    key: csp.reportOnly ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy',
    value: directives.join('; '),
  };
}
