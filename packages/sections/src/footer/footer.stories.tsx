import type { Meta, StoryObj } from '@storybook/react';
import { Footer } from './footer';

const seal = `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="96" height="40"><rect width="96" height="40" rx="6" fill="#d4d4d8"/></svg>')}`;

const full = {
  service: [
    { label: 'Telefone', value: '(11) 4000-0000', href: 'tel:+551140000000' },
    { label: 'E-mail', value: 'atendimento@loja.exemplo', href: 'mailto:atendimento@loja.exemplo' },
    { label: 'Horário', value: 'Seg. a sex., das 9h às 18h' },
  ],
  newsletter: {
    title: 'Receba novidades',
    description: 'Ofertas e lançamentos no seu e-mail.',
    action: '/api/newsletter',
    segments: [
      { id: 'feminino', label: 'Feminino' },
      { id: 'masculino', label: 'Masculino' },
      { id: 'infantil', label: 'Infantil' },
    ],
  },
  columns: [
    { title: 'Institucional', links: [{ label: 'Quem somos', href: '/quem-somos' }, { label: 'Trabalhe conosco', href: '/trabalhe-conosco' }] },
    { title: 'Ajuda', links: [{ label: 'Trocas e devoluções', href: '/trocas-e-devolucoes' }, { label: 'Prazos de entrega', href: '/prazos-de-entrega' }] },
    { title: 'Compre', links: [{ label: 'Mapa do site', href: '/mapa-do-site' }, { label: 'Guia de medidas', href: '/guia-de-medidas' }] },
    { title: 'Políticas', links: [{ label: 'Privacidade', href: '/privacidade' }, { label: 'Termos de uso', href: '/termos' }] },
  ],
  apps: [{ label: 'Baixar na App Store', href: '/app/ios' }, { label: 'Baixar no Google Play', href: '/app/android' }],
  social: [{ label: 'Instagram', href: 'https://instagram.com/loja' }, { label: 'YouTube', href: 'https://youtube.com/@loja' }],
  seals: [{ label: 'Site seguro', image: { src: seal, width: 96, height: 40 } }, { label: 'Pagamento protegido', image: { src: seal, width: 96, height: 40 } }],
  legal: {
    companyName: 'Loja Exemplo Comércio Ltda.',
    cnpj: '12345678000195',
    address: 'Rua Exemplo, 100 - São Paulo/SP',
    copyright: '© 2026 Loja Exemplo. Todos os direitos reservados.',
    links: [{ label: 'Política de privacidade', href: '/privacidade' }],
  },
};

const meta = { title: 'Sections/Globais/Footer', component: Footer, parameters: { layout: 'fullscreen' }, args: full } satisfies Meta<typeof Footer>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Completo: Story = {};
export const SemNewsletter: Story = { args: { newsletter: undefined } };
export const NewsletterSemSegmentos: Story = { args: { newsletter: { ...full.newsletter, segments: [] } } };
export const SoDadosLegais: Story = { args: { service: undefined, newsletter: undefined, columns: undefined, apps: undefined, social: undefined, seals: undefined } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } };
