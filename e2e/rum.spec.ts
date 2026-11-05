import { expect, test } from '@playwright/test';

test.describe('RUM de Core Web Vitals', () => {
  test('o coletor envia um beacon valido quando a aba fica oculta', async ({ page, javaScriptEnabled }) => {
    test.skip(!javaScriptEnabled, 'o coletor e JavaScript inline');
    await page.goto('/departamento-exemplo?brand=marca-1');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    const beacon = page.waitForRequest((r) => r.url().endsWith('/api/rum') && r.method() === 'POST');
    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
      document.dispatchEvent(new Event('visibilitychange', { bubbles: true }));
    });
    const body = JSON.parse((await beacon).postData() ?? '{}');
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
