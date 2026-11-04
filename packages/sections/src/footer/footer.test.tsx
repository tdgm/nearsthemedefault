import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Footer } from './footer';
import { footerSchema } from './footer.schema';

const props = {
  service: [
    { label: 'Telefone', value: '(11) 4000-0000', href: 'tel:+551140000000' },
    { label: 'Horário', value: 'Seg. a sex.' },
  ],
  newsletter: { title: 'Novidades', action: '/api/newsletter', segments: [{ id: 'f', label: 'Feminino' }, { id: 'm', label: 'Masculino' }] },
  columns: [
    { title: 'Ajuda', links: [{ label: 'Trocas', href: '/trocas' }] },
    { title: 'Institucional', links: [{ label: 'Quem somos', href: '/quem-somos' }] },
  ],
  apps: [{ label: 'App Store', href: '/ios' }],
  social: [{ label: 'Instagram', href: 'https://instagram.com/x' }],
  seals: [{ label: 'Site seguro', image: { src: '/s.svg', width: 96, height: 40 } }],
  legal: { companyName: 'Loja Ltda.', cnpj: '12345678000195', address: 'Rua A, 1', links: [{ label: 'Privacidade', href: '/privacidade' }] },
};

describe('Footer', () => {
  it('e o landmark contentinfo, com content-visibility auto e tamanho intrinseco declarado', () => {
    render(<Footer {...props} />);
    const footer = screen.getByRole('contentinfo');
    expect(footer.className).toContain('[content-visibility:auto]');
    expect(footer.className).toContain('contain-intrinsic-size');
  });

  it('atendimento: item com href vira link, sem href vira texto', () => {
    render(<Footer {...props} />);
    expect(screen.getByRole('link', { name: '(11) 4000-0000' })).toHaveAttribute('href', 'tel:+551140000000');
    expect(screen.getByText('Seg. a sex.')).toBeInTheDocument();
  });

  it('newsletter: form POST com e-mail obrigatorio e segmentos em fieldset/legend', () => {
    const { container } = render(<Footer {...props} />);
    const form = container.querySelector('form')!;
    expect(form).toHaveAttribute('action', '/api/newsletter');
    expect(form).toHaveAttribute('method', 'post');
    expect(within(form).getByLabelText(/Seu e-mail/)).toBeRequired();
    const group = within(form).getByRole('group', { name: 'Quero receber novidades de' });
    expect(within(group).getAllByRole('checkbox')).toHaveLength(2);
    expect(within(group).getByLabelText('Feminino')).toHaveAttribute('name', 'segments');
  });

  it('sem action nao renderiza a newsletter', () => {
    const { container } = render(<Footer {...props} newsletter={{ title: 'x' }} />);
    expect(container.querySelector('form')).toBeNull();
  });

  it('colunas sao <details> colapsaveis com todos os links no HTML e reabertas no desktop', () => {
    const { container } = render(<Footer {...props} />);
    const details = container.querySelectorAll('details');
    expect(details).toHaveLength(2);
    expect(details[0]).not.toHaveAttribute('open');
    expect(details[0]!.className).toContain('md:[&::details-content]:[content-visibility:visible]');
    expect(screen.getByRole('link', { name: 'Trocas' })).toBeInTheDocument();
    expect(within(details[0]!).getByRole('heading', { level: 2, name: 'Ajuda' })).toBeInTheDocument();
  });

  it('todo link do rodape tem alvo de 44px', () => {
    const { container } = render(<Footer {...props} />);
    container.querySelectorAll('footer a').forEach((a) => expect(a.className, a.textContent ?? '').toMatch(/min-h-11/));
  });

  it('redes sociais abrem com rel seguro; selos tem alt e dimensoes', () => {
    render(<Footer {...props} />);
    expect(screen.getByRole('link', { name: 'Instagram' })).toHaveAttribute('rel', 'noopener noreferrer');
    const seal = screen.getByAltText('Site seguro');
    expect(seal).toHaveAttribute('width', '96');
    expect(seal).toHaveAttribute('loading', 'lazy');
  });

  it('dados legais: CNPJ formatado', () => {
    render(<Footer {...props} />);
    expect(screen.getByText(/CNPJ 12\.345\.678\/0001-95/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Privacidade' })).toBeInTheDocument();
  });

  it('renderiza so o que recebe', () => {
    render(<Footer legal={{ companyName: 'Loja' }} />);
    expect(screen.getByText('Loja')).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).toBeNull();
  });
});

describe('footerSchema', () => {
  it('valida o conjunto completo e rejeita coluna sem links', () => {
    expect(footerSchema.safeParse(props).success).toBe(true);
    expect(footerSchema.safeParse({ columns: [{ title: 'x', links: [] }] }).success).toBe(false);
  });
});
