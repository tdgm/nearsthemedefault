import { describe, expect, it } from 'vitest';
import { isKnownPath } from '../lib/routing/known-path';

describe('isKnownPath (404 real na primeira requisicao)', () => {
  it('reconhece as URLs que existem', async () => {
    for (const path of [
      '/',
      '/departamento-exemplo',
      '/departamento-exemplo/categoria-exemplo',
      '/departamento-exemplo/categoria-exemplo/sub-exemplo',
      '/tipo-exemplo',
      '/campanha-exemplo',
      '/campanha-exemplo/segmento-exemplo',
      '/pagina-exemplo',
      '/b/palavra-chave-exemplo',
      '/produto-exemplo/p',
      '/s',
      '/mapa-do-site',
      '/sitemap/product-1.xml',
      '/api/cart/items',
      '/login', // Fase 9b (ADR 0027): rota real, ssg, noindex
      '/cadastro',
      '/account', // Fase 9c (ADR 0027): rota real, ssr, noindex
      '/account/dados',
      '/account/pedidos/pedido-1001',
      '/lojas', // Fase 9d (ADR 0028): rota real, ssg, indexavel
      '/carrinho', // Fase 10 (ADR 0029): rota real, ssr, noindex
      '/checkout', // Fase 10 (ADR 0029): rota real, ssg, noindex (stub)
      '/departamento-exemplo/', // barra final
    ]) {
      expect(await isKnownPath(path), path).toBe(true);
    }
  });

  it('recusa slug inexistente em todas as formas de rota', async () => {
    for (const path of [
      '/slug-que-nao-existe',
      '/departamento-exemplo/nao-existe',
      '/departamento-exemplo/categoria-exemplo/nao-existe',
      '/campanha-exemplo/nao-existe',
      '/b/nao-existe',
      '/b',
      '/b/palavra-chave-exemplo/extra',
      '/produto-que-nao-existe/p',
      '/a/b/c/d',
    ]) {
      expect(await isKnownPath(path), path).toBe(false);
    }
  });

  it('percent-encoding invalido e recusado sem lancar', async () => {
    expect(await isKnownPath('/%E0%A4%A')).toBe(false);
  });

  it('o segundo segmento "p" so vale para produto existente', async () => {
    expect(await isKnownPath('/departamento-exemplo/p')).toBe(false);
  });
});
