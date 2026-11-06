import { beforeEach, describe, expect, it, vi } from 'vitest';
import { decodeSessionCustomerId, SESSION_COOKIE } from '../lib/auth/session';

// cookies()/redirect() do Next sao mockados: requireCustomer roda fora de uma
// requisicao real nos testes, e redirect() de verdade lanca um erro interno
// do framework que so faz sentido dentro do runtime do Next. vi.mock e
// hoisted pelo Vitest para o topo do modulo, entao o import de requireCustomer
// abaixo ja enxerga estes mocks.
const { cookiesMock, redirectMock } = vi.hoisted(() => ({
  cookiesMock: vi.fn(),
  redirectMock: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));
vi.mock('next/headers', () => ({ cookies: cookiesMock }));
vi.mock('next/navigation', () => ({ redirect: redirectMock }));

const { requireCustomer } = await import('../lib/auth/guard');

describe('decodeSessionCustomerId', () => {
  it('sem valor, sem sessao', () => {
    expect(decodeSessionCustomerId(undefined)).toBeNull();
    expect(decodeSessionCustomerId(null)).toBeNull();
    expect(decodeSessionCustomerId('')).toBeNull();
  });

  it('decodifica o valor (mesmo encode de sessionCookieHeader)', () => {
    expect(decodeSessionCustomerId(encodeURIComponent('conta-ana+souza@exemplo.com'))).toBe('conta-ana+souza@exemplo.com');
  });

  it('valor cru sem encode: decodeURIComponent e identidade para ids mock (so a-z0-9-)', () => {
    expect(decodeSessionCustomerId('cliente-exemplo-1')).toBe('cliente-exemplo-1');
  });
});

function jarWith(value: string | undefined) {
  return { get: (name: string) => (name === SESSION_COOKIE && value !== undefined ? { value } : undefined) };
}

describe('requireCustomer', () => {
  beforeEach(() => {
    cookiesMock.mockReset();
    redirectMock.mockClear();
  });

  it('cliente mock valido: retorna o cliente, nunca redireciona', async () => {
    cookiesMock.mockResolvedValue(jarWith('cliente-exemplo-1'));
    const customer = await requireCustomer('/account');
    expect(customer.id).toBe('cliente-exemplo-1');
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('sem cookie: redireciona para /login?returnUrl=<rota>', async () => {
    cookiesMock.mockResolvedValue(jarWith(undefined));
    await expect(requireCustomer('/account/pedidos')).rejects.toThrow('REDIRECT:/login?returnUrl=%2Faccount%2Fpedidos');
    expect(redirectMock).toHaveBeenCalledWith('/login?returnUrl=%2Faccount%2Fpedidos');
  });

  it('cookie com id de cliente que nao existe: redireciona igual a sem cookie (nunca vaza se o id "quase existiu")', async () => {
    cookiesMock.mockResolvedValue(jarWith('ninguem'));
    await expect(requireCustomer('/account')).rejects.toThrow('REDIRECT:/login?returnUrl=%2Faccount');
  });
});
