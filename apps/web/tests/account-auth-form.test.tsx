import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AccountAuthForm } from '../components/account-auth-form';

const labels = {
  name: 'Nome completo',
  email: 'E-mail',
  password: 'Senha',
  confirmPassword: 'Confirmar senha',
  submit: 'Entrar',
  submitting: 'Entrando…',
  error: 'E-mail ou senha incorretos.',
  success: 'Login realizado.',
};

afterEach(() => vi.restoreAllMocks());

describe('AccountAuthForm', () => {
  it('login: so e-mail e senha, sem nome nem confirmacao', () => {
    render(<AccountAuthForm variant="login" action="/api/account/session" labels={labels} />);
    expect(screen.getByLabelText('E-mail')).toHaveAttribute('type', 'email');
    expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'password');
    expect(screen.queryByLabelText('Nome completo')).toBeNull();
    expect(screen.queryByLabelText('Confirmar senha')).toBeNull();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
  });

  it('cadastro: nome, e-mail, senha e confirmacao, todos obrigatorios', () => {
    render(<AccountAuthForm variant="cadastro" action="/api/account/register" labels={labels} />);
    for (const label of ['Nome completo', 'E-mail', 'Senha', 'Confirmar senha']) {
      expect(screen.getByLabelText(label)).toBeRequired();
    }
  });

  it('regiao viva polite sempre no DOM, vazia no estado inicial', () => {
    render(<AccountAuthForm variant="login" action="/api/account/session" labels={labels} />);
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveTextContent('');
  });

  it('initialError (fallback sem JS com ?erro=1) mostra o erro desde o primeiro paint', () => {
    render(<AccountAuthForm variant="login" action="/api/account/session" initialError labels={labels} />);
    expect(screen.getByRole('status')).toHaveTextContent(labels.error);
  });

  it('sucesso: envia POST e anuncia o resultado em aria-live', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{"ok":true}', { status: 200 }));
    const { container } = render(<AccountAuthForm variant="login" action="/api/account/session" labels={labels} />);
    fireEvent.submit(container.querySelector('form')!);
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(labels.success));
    expect(fetchMock).toHaveBeenCalledWith('/api/account/session', expect.objectContaining({ method: 'POST' }));
  });

  it('credenciais invalidas (401): anuncia o erro, sem derrubar a pagina', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{"ok":false,"error":"invalid_credentials"}', { status: 401 }));
    const { container } = render(<AccountAuthForm variant="login" action="/api/account/session" labels={labels} />);
    fireEvent.submit(container.querySelector('form')!);
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(labels.error));
  });

  it('falha de rede: anuncia o erro', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network'));
    const { container } = render(<AccountAuthForm variant="login" action="/api/account/session" labels={labels} />);
    fireEvent.submit(container.querySelector('form')!);
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(labels.error));
  });

  it('inclui returnUrl como campo oculto para o endpoint redirecionar apos o POST sem JS', () => {
    const { container } = render(
      <AccountAuthForm variant="login" action="/api/account/session" returnUrl="/account" labels={labels} />,
    );
    expect(container.querySelector('input[type="hidden"][name="returnUrl"]')).toHaveValue('/account');
  });
});
