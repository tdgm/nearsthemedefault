import { expect, test } from '@playwright/test';

// Configuracao padrao (thirdParties.scripts: []): a loja nao fala com nenhum host de
// terceiro. Protege o piso do orcamento (hosts <= 8, JS de terceiros <= 80 KB) contra
// um script que entre sem passar pelo manifest.
for (const url of ['/', '/departamento-exemplo', '/produto-exemplo/p']) {
  test(`${url}: zero requisicoes a outras origens e nenhum script de terceiro`, async ({ page, baseURL }) => {
    const origin = new URL(baseURL ?? 'http://localhost:3000').origin;
    const foreign: string[] = [];
    page.on('request', (r) => {
      if (/^https?:/.test(r.url()) && new URL(r.url()).origin !== origin) foreign.push(r.url());
    });
    await page.goto(url, { waitUntil: 'networkidle' });
    expect(foreign).toEqual([]);
    expect(await page.locator('script[type="text/partytown"], script[data-third-party]').count()).toBe(0);
  });
}

test('os arquivos do Partytown estao publicados na mesma origem (prebuild)', async ({ request }) => {
  const res = await request.get('/~partytown/partytown.js');
  expect(res.status()).toBe(200);
  expect(await res.text()).toContain('Partytown');
  // O debug/ e removido no prebuild. Limite conhecido (8d): o proxy.ts nao cobre caminhos com
  // ponto, entao a PRIMEIRA requisicao a um arquivo inexistente ainda responde 200 (shell do
  // PPR) e so as seguintes respondem 404. Aquece antes de afirmar, para o teste nao depender
  // da ordem nem do retry do CI.
  await request.get('/~partytown/debug/partytown.js');
  expect((await request.get('/~partytown/debug/partytown.js')).status()).toBe(404);
});
