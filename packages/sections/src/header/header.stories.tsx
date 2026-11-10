import type { Meta, StoryObj } from '@storybook/react';
import { Header } from './header';

// Placeholder neutro (SVG inline): sem marca real nem rede.
const logo = {
  src: `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="120" height="32"><rect width="120" height="32" rx="6" fill="#52525b"/><text x="60" y="21" font-size="14" text-anchor="middle" fill="#fff" font-family="Arial">LOJA</text></svg>')}`,
  width: 120,
  height: 32,
  alt: 'Loja',
};
const nav = { departments: [{ label: 'Feminino', href: '/feminino' }, { label: 'Masculino', href: '/masculino' }] };

const navComMegaMenu = {
  departments: [
    {
      label: 'Feminino',
      href: '/feminino',
      highlight: { label: 'Novidades', href: '/feminino/novidades' },
      groups: [
        { label: 'Roupas', href: '/feminino/roupas', links: [{ label: 'Blusas', href: '/feminino/roupas/blusas' }, { label: 'Calças', href: '/feminino/roupas/calcas' }] },
        { label: 'Calçados', links: [{ label: 'Tênis', href: '/feminino/calcados/tenis' }] },
      ],
      promo: { title: 'Coleção de verão', href: '/colecao-verao' },
    },
    { label: 'Masculino', href: '/masculino' },
  ],
};

const meta = {
  title: 'Sections/Globais/Header',
  component: Header,
  parameters: { layout: 'fullscreen' },
  args: { logo, nav },
} satisfies Meta<typeof Header>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Completo: Story = {};
export const ComContadores: Story = { args: { cartCount: 3, wishlistCount: 120 } };
export const Minimo: Story = { args: { variant: 'minimal', cartCount: 2 } };
export const Nenhum: Story = { args: { variant: 'none' } };
export const SemBusca: Story = { args: { search: false } };
export const SemNavegacao: Story = { args: { nav: undefined } };

/**
 * Departamento com `groups`/`highlight`/`promo` vira mega-menu inline a partir
 * de `md:` (ADR 0033) - `<details>` nativo, clique no "Feminino" pra abrir.
 */
export const ComMegaMenu: Story = { args: { nav: navComMegaMenu } };

/**
 * `cartTrigger`: slot usado pelo app layer para injetar um botao de carrinho
 * ja resolvido numa ilha dinamica propria (Fase 10, ADR 0029) - o Header em
 * si continua estatico (o "Menu" nao muda de DOM a cada request). Fora do
 * Storybook o conteudo real e `<Suspense><CartButtonLive /></Suspense>`
 * (apps/web/app/layout.tsx); aqui um botao simples ja basta pra documentar o
 * contrato do slot.
 */
export const ComCartTriggerCustomizado: Story = {
  args: { cartTrigger: <button type="button">Carrinho sob medida</button> },
};
