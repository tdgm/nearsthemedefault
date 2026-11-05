import { expect, test } from '@playwright/test';

test.describe('RUM de Core Web Vitals', () => {
  test('o coletor envia um beacon valido quando a aba fica oculta', async ({ page, javaScriptEnabled }) => {
    test.skip(!javaScriptEnabled, 'o coletor e JavaScript inline');
    // O Chromium nao expoe o corpo Blob de um sendBeacon em request.postData(); registramos
    // o que o coletor entrega ao navegador e conferimos separadamente que a requisicao saiu.
    await page.addInitScript(() => {
      const w = window as unknown as { __beacons: { url: string; body: string }[] };
      w.__beacons = [];
      const original = navigator.sendBeacon.bind(navigator);
      navigator.sendBeacon = (url, data) => {
        void (data as Blob).text().then((body) => w.__beacons.push({ url: String(url), body }));
        return original(url, data);
      };
    });
    await page.goto('/departamento-exemplo?brand=marca-1');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    const request = page.waitForRequest((r) => r.url().endsWith('/api/rum') && r.method() === 'POST');
    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
      document.dispatchEvent(new Event('visibilitychange', { bubbles: true }));
    });
    await request;
    await page.waitForFunction(() => (window as unknown as { __beacons: unknown[] }).__beacons.length > 0);
    const [beacon] = await page.evaluate(() => (window as unknown as { __beacons: { url: string; body: string }[] }).__beacons);
    const body = JSON.parse(beacon?.body ?? '{}');
    // Pathname sem query string (dado de busca/filtro nunca sai do navegador).
    expect(body.p).toBe('/departamento-exemplo');
    expect(['m', 'd']).toContain(body.v);
    expect(Object.keys(body.m).length).toBeGreaterThan(0);
    expect(body.m.TTFB).toBeGreaterThan(0);
  });

  test('o endpoint valida o contrato', async ({ request }) => {
    const ok = await request.post('/api/rum', { data: { p: '/', v: 'm', m: { LCP: 1200 } } });
    expect(ok.status()).toBe(204);
    const bad = await request.post('/api/rum', { data: { p: '/', v: 'm', m: { LCP: 1200 }, uid: 'x' } });
    expect(bad.status()).toBe(400);
  });
});
