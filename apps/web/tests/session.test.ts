import { afterEach, describe, expect, it } from 'vitest';
import { clearSessionCookieHeader, readSessionCustomerId, sessionCookieHeader, SESSION_COOKIE } from '../lib/auth/session';

const ORIGINAL_ENV = process.env.NODE_ENV;

describe('sessionCookieHeader / clearSessionCookieHeader', () => {
  afterEach(() => {
    process.env.NODE_ENV = ORIGINAL_ENV;
  });

  it('cookie de sessao: httpOnly, SameSite=Lax, valor = id do cliente (nunca um JWT)', () => {
    const header = sessionCookieHeader('cliente-exemplo-1');
    expect(header).toContain(`${SESSION_COOKIE}=cliente-exemplo-1`);
    expect(header).toContain('HttpOnly');
    expect(header).toContain('SameSite=Lax');
    expect(header).toContain('Path=/');
  });

  it('codifica o valor do cookie (nunca grava caracteres crus de query/cookie)', () => {
    const header = sessionCookieHeader('conta-ana+souza@exemplo.com');
    expect(header).toContain(encodeURIComponent('conta-ana+souza@exemplo.com'));
  });

  it('Secure so em producao: dev (http://localhost) nao pode perder o cookie', () => {
    process.env.NODE_ENV = 'development';
    expect(sessionCookieHeader('x')).not.toContain('Secure');
    process.env.NODE_ENV = 'production';
    expect(sessionCookieHeader('x')).toContain('Secure');
  });

  it('logout: Max-Age=0 expira o cookie imediatamente', () => {
    expect(clearSessionCookieHeader()).toContain('Max-Age=0');
  });
});

describe('readSessionCustomerId', () => {
  it('sem cookie, sem sessao', () => {
    expect(readSessionCustomerId(null)).toBeNull();
    expect(readSessionCustomerId(undefined)).toBeNull();
    expect(readSessionCustomerId('')).toBeNull();
  });

  it('le o id entre outros cookies do header', () => {
    expect(readSessionCustomerId(`outro=1; ${SESSION_COOKIE}=cliente-exemplo-1; terceiro=2`)).toBe('cliente-exemplo-1');
  });

  it('decodifica o valor', () => {
    expect(readSessionCustomerId(`${SESSION_COOKIE}=${encodeURIComponent('conta-ana+souza@exemplo.com')}`)).toBe(
      'conta-ana+souza@exemplo.com',
    );
  });

  it('cookie de logout (valor vazio) conta como sem sessao', () => {
    expect(readSessionCustomerId(`${SESSION_COOKIE}=`)).toBeNull();
  });
});
