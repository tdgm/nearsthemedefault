// @builder.io/partytown 0.10.3 nao publica tipos para `/integration` (o package.json
// aponta para um .d.ts que nao existe no tarball). Declaramos so o que usamos.
declare module '@builder.io/partytown/integration' {
  export interface PartytownConfig {
    /** Chamadas globais encaminhadas do worker (ex.: `dataLayer.push`). */
    forward?: string[];
    /** Pasta (mesma origem) onde ficam os arquivos de lib/. */
    lib?: string;
    debug?: boolean;
    nonce?: string;
    loadScriptsOnMainThread?: (string | RegExp)[];
  }
  /** Codigo JS do snippet inline que inicia o Partytown. */
  export function partytownSnippet(config?: PartytownConfig): string;
}
