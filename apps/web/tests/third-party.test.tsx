import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { INTERACTION_EVENTS, PARTYTOWN_LIB, ThirdPartyScripts, loaderScript } from '../lib/third-party';

type Props = Parameters<typeof ThirdPartyScripts>[0];
type Script = NonNullable<Props['scripts']>[number];

const base: Pick<Script, 'integration' | 'adr' | 'forward'> = { integration: 'analytics', adr: 'docs/adr/0023-terceiros-com-partytown.md', forward: [] };
const gtm: Script = { ...base, id: 'gtm', integration: 'tagManager', src: 'https://www.googletagmanager.com/gtm.js?id=GTM-X', strategy: 'partytown', forward: ['dataLayer.push'] };
const idle: Script = { ...base, id: 'chat', src: 'https://chat.example/w.js', strategy: 'idle', mainThreadReason: 'Widget de chat manipula o DOM.' };
const inter: Script = { ...base, id: 'ga', src: 'https://stats.example/a.js', strategy: 'post-interaction', mainThreadReason: 'Medicao precisa do DOM real.' };

const html = (scripts: Script[]) => renderToStaticMarkup(<ThirdPartyScripts scripts={scripts} />);

describe('ThirdPartyScripts', () => {
  it('sem terceiros: nada no HTML', () => {
    expect(html([])).toBe('');
  });

  it('partytown: snippet unico + script type="text/partytown" (nunca executado pela thread principal)', () => {
    const out = html([gtm, { ...gtm, id: 'gtm2', src: 'https://www.googletagmanager.com/gtag/js?id=G-X' }]);
    expect(out.match(/<script data-partytown/g)).toHaveLength(1);
    expect(out.match(/<script type="text\/partytown"/g)).toHaveLength(2);
    expect(out).toContain('src="https://www.googletagmanager.com/gtm.js?id=GTM-X"');
    expect(out).toContain(PARTYTOWN_LIB);
    expect(out).toContain('dataLayer.push');
    // nenhuma tag <script src> comum apontando para o terceiro
    expect(out).not.toMatch(/<script src="https:\/\/www\.googletagmanager/);
  });

  it('forward do snippet junta os scripts em worker sem repetir', () => {
    const out = html([gtm, { ...gtm, id: 'b', src: 'https://b.example/x.js', forward: ['dataLayer.push', 'fbq'] }]);
    expect(out.match(/dataLayer\.push/g)?.length).toBe(1);
    expect(out).toContain('fbq');
  });

  it('thread principal: so o loader inline, sem <script src> e sem snippet do Partytown', () => {
    const out = html([idle, inter]);
    expect(out).not.toContain('data-partytown');
    expect(out).not.toMatch(/<script[^>]+src=/);
    expect(out).toContain('https://chat.example/w.js');
    expect(out).toContain('https://stats.example/a.js');
  });

  it('mistura: worker e loader coexistem', () => {
    const out = html([gtm, idle]);
    expect(out).toContain('data-partytown');
    expect(out).toContain('text/partytown');
    expect(out).toContain('requestIdleCallback');
  });
});

/** Executa o loader com um DOM falso. */
function runLoader(entries: Parameters<typeof loaderScript>[0]) {
  const added: { src: string; id: string | null }[] = [];
  const listeners: Record<string, ((...a: unknown[]) => void)[]> = {};
  const idleCbs: (() => void)[] = [];
  const timeouts: number[] = [];
  const doc = {
    createElement: () => {
      const attrs: Record<string, string> = {};
      return { src: '', async: false, setAttribute: (k: string, v: string) => (attrs[k] = v), attrs };
    },
    head: { appendChild: (el: { src: string; attrs: Record<string, string> }) => added.push({ src: el.src, id: el.attrs['data-third-party'] ?? null }) },
  };
  const win = {
    addEventListener: (n: string, f: () => void) => (listeners[n] ??= []).push(f),
    removeEventListener: (n: string, f: () => void) => (listeners[n] = (listeners[n] ?? []).filter((x) => x !== f)),
    requestIdleCallback: (f: () => void) => idleCbs.push(f),
  };
  new Function('window', 'document', 'setTimeout', loaderScript(entries))(win, doc, (_f: () => void, ms: number) => timeouts.push(ms));
  return { added, listeners, idleCbs, timeouts, win };
}

describe('loaderScript', () => {
  const entries = [
    { id: 'chat', src: 'https://chat.example/w.js', strategy: 'idle' as const },
    { id: 'ga', src: 'https://stats.example/a.js', strategy: 'post-interaction' as const },
  ];

  it('e ES5 puro e deterministico', () => {
    const script = loaderScript(entries);
    expect(script).toBe(loaderScript(entries));
    expect(script).not.toMatch(/=>|\blet\b|\bconst\b|`/);
    expect(() => new Function(script)).not.toThrow();
  });

  it('nada carrega antes do load nem da interacao', () => {
    const { added } = runLoader(entries);
    expect(added).toEqual([]);
  });

  it('idle: carrega so o script idle quando o navegador esta ocioso depois do load', () => {
    const { added, listeners, idleCbs } = runLoader(entries);
    listeners['load']?.[0]?.();
    expect(idleCbs).toHaveLength(1);
    idleCbs[0]?.();
    expect(added).toEqual([{ src: 'https://chat.example/w.js', id: 'chat' }]);
  });

  it('idle sem requestIdleCallback cai para setTimeout de 2 s', () => {
    const { listeners, win, timeouts } = runLoader(entries);
    delete (win as Partial<typeof win>).requestIdleCallback;
    listeners['load']?.[0]?.();
    expect(timeouts).toEqual([2e3]);
  });

  it('post-interaction: a 1a interacao carrega o script uma unica vez e remove os listeners', () => {
    const { added, listeners } = runLoader(entries);
    for (const e of INTERACTION_EVENTS) expect(listeners[e]).toHaveLength(1);
    listeners['pointerdown']?.[0]?.();
    expect(added).toEqual([{ src: 'https://stats.example/a.js', id: 'ga' }]);
    for (const e of INTERACTION_EVENTS) expect(listeners[e] ?? []).toHaveLength(0);
  });
});
