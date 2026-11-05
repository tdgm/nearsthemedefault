// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { POST } from '../app/api/rum/route';
import { RUM_MAX_BYTES, rumPayloadSchema, rumScript } from '../lib/rum';

const script = rumScript({ endpoint: '/api/rum', sampleRate: 1 });

type Entry = Record<string, unknown>;
type Observer = { type: string; cb: (l: { getEntries: () => Entry[] }) => void; opts: Entry };

/** Executa o script com um navegador falso e devolve o que foi observado/enviado. */
function run({ dnt = false, gpc = false, random = 0, rate = 1, types = ['layout-shift'], width = 390 } = {}) {
  const observers: Observer[] = [];
  const beacons: { url: string; body: string }[] = [];
  const listeners: Record<string, () => void> = {};
  const doc = { visibilityState: 'visible' };
  class FakePO {
    static supportedEntryTypes = types;
    constructor(private cb: Observer['cb']) {}
    observe(opts: Entry) {
      observers.push({ type: String(opts.type), cb: this.cb, opts });
    }
  }
  const nav = {
    sendBeacon: (url: string, blob: { text?: () => Promise<string>; __body?: string }) => {
      beacons.push({ url, body: String(blob.__body) });
      return true;
    },
    doNotTrack: dnt ? '1' : null,
    globalPrivacyControl: gpc,
  };
  class FakeBlob {
    __body: string;
    constructor(parts: string[]) {
      this.__body = parts.join('');
    }
  }
  const win = { PerformanceObserver: FakePO, innerWidth: width, addEventListener: (n: string, f: () => void) => (listeners[n] = f) };
  const fakeMath = { ...Math, random: () => random };
  const body = rumScript({ endpoint: '/api/rum', sampleRate: rate });
  new Function('window', 'navigator', 'document', 'location', 'performance', 'PerformanceObserver', 'Blob', 'Math', body)(
    win,
    nav,
    doc,
    { pathname: '/departamento-exemplo' },
    { getEntriesByType: () => [{ responseStart: 123.4567 }] },
    FakePO,
    FakeBlob,
    fakeMath,
  );
  const feed = (type: string, entries: Entry[]) => observers.filter((o) => o.type === type).forEach((o) => o.cb({ getEntries: () => entries }));
  const hide = () => {
    doc.visibilityState = 'hidden';
    listeners['visibilitychange']?.();
  };
  return { observers, beacons, listeners, feed, hide };
}

describe('rumScript', () => {
  it('e ES5 puro, pequeno e deterministico (compativel com CSP por hash)', () => {
    expect(script).toBe(rumScript({ endpoint: '/api/rum', sampleRate: 1 }));
    expect(script.length).toBeLessThan(1700);
    expect(script).not.toMatch(/=>|\blet\b|\bconst\b|`|\bclass\b/);
    expect(() => new Function(script)).not.toThrow();
  });

  it('nao quebra a pagina em navegador sem PerformanceObserver', () => {
    expect(() => new Function('window', 'navigator', script)({}, {})).not.toThrow();
  });

  it('observa LCP, FCP, CLS e INP (com durationThreshold) e nao envia nada antes de a aba ocultar', () => {
    const { observers, beacons } = run();
    expect(observers.map((o) => o.type).sort()).toEqual(['event', 'largest-contentful-paint', 'layout-shift', 'paint']);
    expect(observers.find((o) => o.type === 'event')?.opts).toMatchObject({ durationThreshold: 40, buffered: true });
    expect(beacons).toHaveLength(0);
  });

  it('envia metricas ao ocultar: LCP final, FCP, TTFB, INP maximo e CLS 0 sem deslocamentos', () => {
    const { feed, hide, beacons } = run();
    feed('largest-contentful-paint', [{ renderTime: 900 }, { renderTime: 1200.4 }]);
    feed('paint', [{ name: 'first-paint', startTime: 300 }, { name: 'first-contentful-paint', startTime: 450.25 }]);
    feed('event', [{ interactionId: 1, duration: 56 }, { interactionId: 1, duration: 120 }, { interactionId: 0, duration: 900 }]);
    hide();
    expect(beacons).toHaveLength(1);
    expect(beacons[0]?.url).toBe('/api/rum');
    const payload = JSON.parse(beacons[0]!.body);
    expect(payload).toEqual({ p: '/departamento-exemplo', v: 'm', m: { CLS: 0, LCP: 1200.4, FCP: 450.25, INP: 120, TTFB: 123.457 } });
    expect(rumPayloadSchema.safeParse(payload).success).toBe(true);
  });

  it('CLS usa janela de sessao (gap de 1 s, maximo 5 s) e ignora deslocamento apos input', () => {
    const { feed, hide, beacons } = run();
    feed('layout-shift', [
      { startTime: 100, value: 0.02 },
      { startTime: 600, value: 0.03 }, // mesma janela: 0.05
      { startTime: 700, value: 0.5, hadRecentInput: true }, // ignorado
      { startTime: 3000, value: 0.04 }, // nova janela (gap > 1 s): 0.04
    ]);
    hide();
    expect(JSON.parse(beacons[0]!.body).m.CLS).toBe(0.05);
  });

  it('nao reenvia payload identico e reenvia quando a metrica muda', () => {
    const { feed, hide, beacons, listeners } = run();
    hide();
    hide();
    listeners['pagehide']?.();
    expect(beacons).toHaveLength(1);
    feed('event', [{ interactionId: 2, duration: 300 }]);
    hide();
    expect(beacons).toHaveLength(2);
  });

  it('sem layout-shift suportado nao inventa CLS', () => {
    const { hide, beacons } = run({ types: [] });
    hide();
    expect(JSON.parse(beacons[0]!.body).m).toEqual({ TTFB: 123.457 });
  });

  it('respeita Do Not Track, Global Privacy Control e a amostragem', () => {
    expect(run({ dnt: true }).observers).toHaveLength(0);
    expect(run({ gpc: true }).observers).toHaveLength(0);
    expect(run({ rate: 0.1, random: 0.5 }).observers).toHaveLength(0);
    expect(run({ rate: 0.1, random: 0.05 }).observers.length).toBeGreaterThan(0);
  });

  it('viewport: desktop a partir de 768 px', () => {
    const { hide, beacons } = run({ width: 1024 });
    hide();
    expect(JSON.parse(beacons[0]!.body).v).toBe('d');
  });
});

describe('rumPayloadSchema', () => {
  const ok = { p: '/produto-exemplo/p', v: 'd', m: { LCP: 1800 } };
  it('aceita o payload minimo', () => expect(rumPayloadSchema.safeParse(ok).success).toBe(true));
  it('recusa query string, campo desconhecido, metrica negativa e m vazio', () => {
    for (const bad of [
      { ...ok, p: '/s?q=camiseta' },
      { ...ok, p: 'sem-barra' },
      { ...ok, uid: 'abc' },
      { ...ok, m: { LCP: -1 } },
      { ...ok, m: { TBT: 10 } },
      { ...ok, m: {} },
      { ...ok, v: 'tablet' },
    ]) {
      expect(rumPayloadSchema.safeParse(bad).success, JSON.stringify(bad)).toBe(false);
    }
  });
});

describe('POST /api/rum (mock)', () => {
  const post = (body: string) => POST(new Request('http://localhost:3000/api/rum', { method: 'POST', body, headers: { 'content-type': 'application/json' } }));
  it('204 para payload valido', async () => {
    const res = await post(JSON.stringify({ p: '/', v: 'm', m: { CLS: 0.01 } }));
    expect(res.status).toBe(204);
    expect(await res.text()).toBe('');
  });
  it('400 para JSON invalido ou fora do contrato; 413 para corpo grande', async () => {
    expect((await post('{nao-json')).status).toBe(400);
    expect((await post(JSON.stringify({ p: '/', v: 'm', m: {}, extra: 1 }))).status).toBe(400);
    expect((await post('x'.repeat(RUM_MAX_BYTES + 1))).status).toBe(413);
  });
});
