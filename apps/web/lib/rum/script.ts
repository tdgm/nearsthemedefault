// Coletor de Core Web Vitals no navegador (RUM). Script inline, ES5, sem
// dependencias: o orcamento de JS inicial (140 KB gzip) ja esta no piso do
// framework, entao o coletor roda fora do bundle e pesa ~1,3 KB no HTML.
// Mede LCP, FCP, CLS (janela de sessao), INP (pior interacao) e TTFB com
// PerformanceObserver e envia UMA vez por mudanca, quando a aba fica oculta
// (`visibilitychange`/`pagehide`), via `sendBeacon`. Nao envia query string,
// cookie nem identificador: so o pathname, o tipo de viewport e as metricas.
// Respeita Do Not Track e Global Privacy Control (docs/adr/0022).

export type RumScriptOptions = { endpoint: string; sampleRate: number };

/** Corpo do script (sem `<script>`). Deterministico: uma CSP com hash libera exatamente este texto. */
export function rumScript({ endpoint, sampleRate }: RumScriptOptions): string {
  return (
    '(function(){try{' +
    `var S=${JSON.stringify(sampleRate)},E=${JSON.stringify(endpoint)};` +
    'if(!("PerformanceObserver" in window)||!navigator.sendBeacon||navigator.doNotTrack==="1"||navigator.globalPrivacyControl||Math.random()>=S)return;' +
    'var m={},w=0,ws=0,wl=-1e3,last="",T=PerformanceObserver.supportedEntryTypes||[];' +
    'if(T.indexOf("layout-shift")>=0)m.CLS=0;' +
    'function O(t,f,x){try{x=x||{};x.type=t;x.buffered=true;new PerformanceObserver(function(l){f(l.getEntries())}).observe(x)}catch(e){}}' +
    'O("largest-contentful-paint",function(a){var e=a[a.length-1];m.LCP=e.renderTime||e.loadTime||e.startTime});' +
    'O("paint",function(a){for(var i=0;i<a.length;i++)if(a[i].name==="first-contentful-paint")m.FCP=a[i].startTime});' +
    'O("layout-shift",function(a){for(var i=0;i<a.length;i++){var e=a[i];if(e.hadRecentInput)continue;' +
    'if(e.startTime-wl>1e3||e.startTime-ws>5e3){w=0;ws=e.startTime}w+=e.value;wl=e.startTime;if(w>m.CLS)m.CLS=w}});' +
    'O("event",function(a){for(var i=0;i<a.length;i++)if(a[i].interactionId&&a[i].duration>(m.INP||0))m.INP=a[i].duration},{durationThreshold:40});' +
    'var n=performance.getEntriesByType("navigation")[0];if(n)m.TTFB=n.responseStart;' +
    'function X(){var r={},k;for(k in m)r[k]=Math.round(m[k]*1e3)/1e3;' +
    'var p=JSON.stringify({p:location.pathname,v:window.innerWidth<768?"m":"d",m:r});if(p===last)return;last=p;' +
    'navigator.sendBeacon(E,new Blob([p],{type:"application/json"}))}' +
    'window.addEventListener("visibilitychange",function(){if(document.visibilityState==="hidden")X()});' +
    'window.addEventListener("pagehide",X)' +
    '}catch(e){}})();'
  );
}
