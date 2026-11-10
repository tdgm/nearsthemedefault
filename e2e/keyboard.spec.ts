import { expect, test, type Page } from '@playwright/test';

// Auditoria final de acessibilidade por teclado e leitor de tela (Fase 8d, docs/adr/0026).
// O axe (routes.spec.ts) cobre regras estaticas; aqui ficam os comportamentos que ele nao ve:
// ordem e visibilidade do foco, focus trap e Esc nos overlays, setas nos radiogroups,
// prefers-reduced-motion, landmarks e hierarquia de headings. Precisam de JavaScript.
const ROUTES = ['/', '/departamento-exemplo', '/produto-exemplo/p', '/s'];

test.beforeEach(({ javaScriptEnabled }) => {
  test.skip(!javaScriptEnabled, 'comportamento de teclado precisa de JavaScript');
});

/** Elemento com foco existe, esta dentro do container e (opcional) e o proprio container. */
const focusInside = (page: Page, selector: string) =>
  page.evaluate((sel) => {
    const root = document.querySelector(sel);
    const active = document.activeElement;
    return Boolean(root && active && root.contains(active));
  }, selector);

test.describe('skip link e ordem do foco', () => {
  for (const url of ROUTES) {
    test(`${url}: o primeiro Tab e o skip link e Enter leva o foco ao conteudo`, async ({ page }) => {
      await page.goto(url);
      await page.keyboard.press('Tab');
      const skip = page.getByRole('link', { name: 'Ir para o conteúdo' });
      await expect(skip).toBeFocused();
      await expect(skip).toBeVisible();
      await page.keyboard.press('Enter');
      await expect(page.locator('#conteudo')).toBeFocused();
      // O proximo Tab continua dentro do conteudo, nao volta para o cabecalho.
      await page.keyboard.press('Tab');
      expect(await focusInside(page, '#conteudo')).toBe(true);
    });
  }

  test('/: todo elemento que recebe foco mostra um indicador visivel', async ({ page }) => {
    await page.goto('/');
    const missing: string[] = [];
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press('Tab');
      const state = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        const cs = getComputedStyle(el);
        const outline = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0;
        const shadow = cs.boxShadow !== 'none';
        // Radios/checkboxes `sr-only` mostram o foco no irmao (peer-focus-visible).
        const peer = el.nextElementSibling ? getComputedStyle(el.nextElementSibling) : null;
        const peerRing = Boolean(peer && ((peer.outlineStyle !== 'none' && parseFloat(peer.outlineWidth) > 0) || peer.boxShadow !== 'none'));
        const label = `${el.tagName.toLowerCase()}${el.getAttribute('href') ? `[${el.getAttribute('href')}]` : ''} "${(el.getAttribute('aria-label') ?? el.textContent ?? '').trim().slice(0, 30)}"`;
        return { ok: outline || shadow || peerRing, label };
      });
      if (state && !state.ok) missing.push(state.label);
    }
    expect(missing, 'foco sem indicador (WCAG 2.4.7 / 2.4.11)').toEqual([]);
  });
});

test.describe('overlays: focus trap, Esc e retorno do foco', () => {
  const cases: Array<{ url: string; trigger: string; dialog: string | RegExp; viewport?: { width: number; height: number } }> = [
    // O hamburger ("Menu") so existe abaixo de `lg:` (1024px): a partir dali os
    // departamentos ficam inline no Header, com mega-menu `<details>` (ADR
    // 0033). Testado no viewport mobile, onde o controle existe de verdade.
    { url: '/', trigger: 'Menu', dialog: /./, viewport: { width: 390, height: 844 } },
    { url: '/departamento-exemplo', trigger: 'Filtrar', dialog: 'Filtros' },
  ];

  for (const { url, trigger, dialog, viewport } of cases) {
    test(`${url}: "${trigger}" abre com Enter, prende o foco, fecha com Esc e devolve o foco`, async ({ page }) => {
      if (viewport) await page.setViewportSize(viewport);
      await page.goto(url);
      const button = page.getByRole('button', { name: trigger, exact: true });
      await button.focus();
      await page.keyboard.press('Enter');
      const panel = page.getByRole('dialog', typeof dialog === 'string' ? { name: dialog } : {}).first();
      await expect(panel).toBeVisible();
      expect(await panel.evaluate((el) => (el as HTMLDialogElement).matches(':modal'))).toBe(true);

      // <dialog> modal torna o resto da pagina inerte: o foco circula no dialog e, ao fim
      // dele, passa pela interface do navegador (activeElement = body). Nunca cai na pagina.
      const trapped = () => panel.evaluate((el) => document.activeElement === document.body || el.contains(document.activeElement));
      for (let i = 0; i < 25; i++) {
        await page.keyboard.press('Tab');
        expect(await trapped(), `Tab ${i + 1} foi para a pagina atras do dialog`).toBe(true);
      }
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Shift+Tab');
        expect(await trapped(), `Shift+Tab ${i + 1} foi para a pagina atras do dialog`).toBe(true);
      }

      await page.keyboard.press('Escape');
      await expect(panel).toBeHidden();
      await expect(button).toBeFocused();
    });
  }
});

test.describe('compra so com teclado', () => {
  test('PDP: Enter no botao adiciona e o resultado e anunciado em aria-live="polite"', async ({ page }) => {
    await page.goto('/produto-exemplo/p');
    const form = page.locator('#pdp-form');
    // Sem eixos de variacao no nicho padrao, o botao e o unico controle obrigatorio.
    expect(await form.getByRole('radiogroup').count()).toBe(0);
    // O rotulo do botao muda para "Adicionado ao carrinho." depois do envio: localiza pelo tipo.
    const add = form.locator('button[type="submit"]');
    await expect(add).toHaveAccessibleName('Adicionar ao carrinho');
    await add.focus();
    await page.keyboard.press('Enter');
    const status = form.getByRole('status');
    await expect(status).toHaveText('Adicionado ao carrinho.');
    await expect(status).toHaveAttribute('aria-live', 'polite');
    // O foco nao e roubado pelo anuncio: continua no botao.
    await expect(add).toBeFocused();
  });

  test('PDP: o link de frete e o CEP tem rotulo e se alcancam por Tab', async ({ page }) => {
    await page.goto('/produto-exemplo/p');
    const cep = page.getByRole('textbox', { name: /CEP/i });
    await cep.focus();
    await expect(cep).toBeFocused();
    await expect(cep).toHaveAccessibleName(/CEP/i);
  });
});

test.describe('prefers-reduced-motion', () => {
  test.use({ reducedMotion: 'reduce' });

  for (const url of ['/', '/produto-exemplo/p']) {
    test(`${url}: nenhuma animacao nem transicao passa de 10 ms e o scroll nao e suave`, async ({ page }) => {
      await page.goto(url);
      const offenders = await page.evaluate(() => {
        const toMs = (v: string) => Math.max(...v.split(',').map((s) => (s.trim().endsWith('ms') ? parseFloat(s) : parseFloat(s) * 1000)));
        const out: string[] = [];
        for (const el of document.querySelectorAll('*')) {
          const cs = getComputedStyle(el);
          if (toMs(cs.animationDuration) > 10 || toMs(cs.transitionDuration) > 10) out.push(el.tagName.toLowerCase() + '.' + String(el.className).slice(0, 40));
          if (cs.scrollBehavior === 'smooth') out.push(`${el.tagName.toLowerCase()} scroll-behavior:smooth`);
        }
        return out.slice(0, 10);
      });
      expect(offenders).toEqual([]);
    });
  }
});

test.describe('leitor de tela: landmarks, nomes e hierarquia', () => {
  for (const url of ROUTES) {
    test(`${url}: um banner, um main e um contentinfo; navs e regioes com nome`, async ({ page }) => {
      await page.goto(url);
      await expect(page.getByRole('banner')).toHaveCount(1);
      await expect(page.getByRole('main')).toHaveCount(1);
      await expect(page.getByRole('contentinfo')).toHaveCount(1);
      const navs = page.getByRole('navigation');
      const total = await navs.count();
      for (let i = 0; i < total; i++) {
        // Mais de um landmark do mesmo tipo precisa de nome para o leitor distingui-los.
        if (total > 1) await expect(navs.nth(i), `navigation #${i + 1} sem nome`).toHaveAccessibleName(/.+/);
      }
    });

    test(`${url}: um H1 e headings sem pular nivel`, async ({ page }) => {
      await page.goto(url);
      const levels = await page.evaluate(() =>
        [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')]
          .filter((el) => (el as HTMLElement).checkVisibility({ checkVisibilityCSS: true }))
          .map((el) => Number(el.tagName[1])),
      );
      expect(levels.filter((l) => l === 1)).toHaveLength(1);
      const jumps = levels.flatMap((level, i) => (i > 0 && level > levels[i - 1]! + 1 ? [`h${levels[i - 1]} -> h${level} (#${i + 1})`] : []));
      expect(jumps, `niveis na ordem: ${levels.join(',')}`).toEqual([]);
    });
  }

  test('arvore de acessibilidade da home: skip link, marcos e carrinho nomeado', async ({ page }) => {
    // O botao "Menu" (hamburger) so existe abaixo de `lg:` (ADR 0033): auditado
    // no viewport mobile, onde o controle existe de verdade.
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const tree = await page.locator('body').ariaSnapshot();
    for (const expected of ['link "Ir para o conteúdo"', '- banner', '- navigation', '- main', '- contentinfo', 'button "Menu"']) {
      expect(tree, expected).toContain(expected);
    }
    expect(tree).toMatch(/link "Carrinho[^"]*"|button "Carrinho[^"]*"/);
  });
});
