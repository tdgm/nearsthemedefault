// Carregador de terceiros que NAO rodam em worker (strategy idle | post-interaction).
// Script inline ES5 e sem dependencias: injeta `<script async src>` so quando a
// condicao acontece, nunca bloqueia o render e nunca aparece na lista de recursos
// do carregamento inicial (integrations.* > loadStrategy; CLAUDE.md > Performance).

export type LoaderEntry = { id: string; src: string; strategy: 'idle' | 'post-interaction' };

/** Eventos que contam como "interacao" (nao ha polling: sem interacao, o script nunca carrega). */
export const INTERACTION_EVENTS = ['pointerdown', 'keydown', 'scroll', 'touchstart'] as const;

/** Corpo do script (sem `<script>`). Deterministico: uma CSP com hash libera exatamente este texto. */
export function loaderScript(entries: readonly LoaderEntry[]): string {
  const list = JSON.stringify(entries.map((e) => ({ i: e.id, s: e.src, t: e.strategy === 'idle' ? 0 : 1 })));
  return (
    '(function(){try{var L=' +
    list +
    ',D={};function A(e){if(D[e.i])return;D[e.i]=1;var s=document.createElement("script");s.src=e.s;s.async=true;s.setAttribute("data-third-party",e.i);document.head.appendChild(s)}' +
    'function R(t){for(var i=0;i<L.length;i++)if(L[i].t===t)A(L[i])}' +
    'function I(){R(0)}' +
    'window.addEventListener("load",function(){if(window.requestIdleCallback)window.requestIdleCallback(I,{timeout:4e3});else setTimeout(I,2e3)});' +
    `var V=${JSON.stringify(INTERACTION_EVENTS)};` +
    'function G(){for(var i=0;i<V.length;i++)window.removeEventListener(V[i],G,{capture:true});R(1)}' +
    'for(var i=0;i<V.length;i++)window.addEventListener(V[i],G,{capture:true,passive:true,once:true})' +
    '}catch(e){}})();'
  );
}
