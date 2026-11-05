// Atribuicao de trafego vindo de motores generativos (contracts.yaml >
// geo.attribution). O servidor nao ve o Referer das paginas estaticas (e ler
// headers as tornaria dinamicas), entao a classificacao roda no navegador, num
// script inline minusculo e sem dependencias, e publica no `dataLayer` do tag
// manager (integrations.tagManager). Sem provider, o push e inofensivo.

/** Hostname que casa com o padrao: igual ou subdominio (`www.perplexity.ai` casa `perplexity.ai`). */
export function matchesHost(hostname: string, pattern: string): boolean {
  const host = hostname.toLowerCase();
  const p = pattern.toLowerCase();
  return host === p || host.endsWith(`.${p}`);
}

function hostOf(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    return new URL(value.includes('://') ? value : `https://${value}`).hostname;
  } catch {
    return null;
  }
}

/**
 * Qual motor trouxe o visitante: pelo `Referer` ou, quando o referrer vem cortado,
 * por `utm_source` (ChatGPT e Perplexity anexam o proprio dominio). Devolve o
 * padrao que casou, ou null.
 */
export function classifyAiReferral(input: { referrer?: string | null; utmSource?: string | null }, patterns: readonly string[]): string | null {
  for (const candidate of [hostOf(input.referrer), hostOf(input.utmSource)]) {
    if (!candidate) continue;
    const hit = patterns.find((p) => matchesHost(candidate, p));
    if (hit) return hit;
  }
  return null;
}

/**
 * Corpo do script inline (sem `<script>`). Determinístico: a CSP com hash pode
 * liberar exatamente este texto. Mesma regra de `classifyAiReferral`, em ES5.
 */
export function aiReferralScript(patterns: readonly string[]): string {
  const list = JSON.stringify(patterns.map((p) => p.toLowerCase()));
  return (
    '(function(){try{var P=' +
    list +
    ',C=[];function H(v){try{return new URL(v.indexOf("://")>0?v:"https://"+v).hostname.toLowerCase()}catch(e){return""}}' +
    'if(document.referrer)C.push(H(document.referrer));' +
    'var u=new URLSearchParams(location.search).get("utm_source");if(u)C.push(H(u));' +
    'for(var i=0;i<C.length;i++)for(var j=0;j<P.length;j++)if(C[i]&&(C[i]===P[j]||C[i].slice(-P[j].length-1)==="."+P[j])){' +
    '(window.dataLayer=window.dataLayer||[]).push({event:"ai_referral",ai_source:P[j]});return}}catch(e){}})();'
  );
}
