import { describe, expect, it } from 'vitest';
import { POST as login, DELETE as logout } from '../app/api/account/session/route';
import { POST as register } from '../app/api/account/register/route';
import { SESSION_COOKIE } from '../lib/auth/session';

function postForm(url: string, fields: Record<string, string>, accept = 'application/json') {
  const body = new FormData();
  for (const [key, value] of Object.entries(fields)) body.set(key, value);
  return new Request(url, { method: 'POST', body, headers: { Accept: accept } });
}

describe('POST /api/account/session (login mock)', () => {
  it('cliente mock conhecido: qualquer senha autentica (nunca compara senha real)', async () => {
    const res = await login(postForm('http://localhost/api/account/session', { email: 'ana.souza@exemplo.com.br', senha: 'qualquer-coisa' }));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true, customerId: 'cliente-exemplo-1' });
    const cookie = res.headers.get('set-cookie') ?? '';
    expect(cookie).toContain(`${SESSION_COOKIE}=cliente-exemplo-1`);
  });

  it('e-mail fora do mock: credenciais invalidas (401), sem cookie', async () => {
    const res = await login(postForm('http://localhost/api/account/session', { email: 'ninguem@exemplo.com', senha: 'x' }));
    expect(res.status).toBe(401);
    expect(await res.json()).toMatchObject({ ok: false, error: 'invalid_credentials' });
    expect(res.headers.get('set-cookie')).toBeNull();
  });

  it('forma invalida (sem e-mail valido): 400, nunca chega a procurar cliente', async () => {
    const res = await login(postForm('http://localhost/api/account/session', { email: 'nao-e-email', senha: 'x' }));
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ ok: false, error: 'invalid_body' });
  });

  it('sem JS (Accept html): sucesso redireciona (303) para returnUrl e seta o cookie', async () => {
    const res = await login(
      postForm('http://localhost/api/account/session', { email: 'ana.souza@exemplo.com.br', senha: 'x', returnUrl: '/account' }, 'text/html'),
    );
    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toBe('http://localhost/account');
    expect(res.headers.get('set-cookie') ?? '').toContain(SESSION_COOKIE);
  });

  it('sem JS, sem referer: falha redireciona para /login?erro=1', async () => {
    const res = await login(postForm('http://localhost/api/account/session', { email: 'ninguem@exemplo.com', senha: 'x' }, 'text/html'));
    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toBe('http://localhost/login?erro=1');
  });

  it('sem JS, com referer da mesma origem: volta para a pagina de origem (preserva returnUrl), com ?erro=1', async () => {
    const request = postForm('http://localhost/api/account/session', { email: 'ninguem@exemplo.com', senha: 'x' }, 'text/html');
    request.headers.set('referer', 'http://localhost/login?returnUrl=%2Faccount');
    const res = await login(request);
    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toBe('http://localhost/login?returnUrl=%2Faccount&erro=1');
  });

  it('sem JS, referer de outro host: nunca redireciona para fora da propria origem', async () => {
    const request = postForm('http://localhost/api/account/session', { email: 'ninguem@exemplo.com', senha: 'x' }, 'text/html');
    request.headers.set('referer', 'https://evil.example/login');
    const res = await login(request);
    expect(res.headers.get('location')).toBe('http://localhost/login?erro=1');
  });
});

describe('DELETE /api/account/session (logout)', () => {
  it('limpa o cookie de sessao', async () => {
    const res = await logout();
    expect(await res.json()).toEqual({ ok: true });
    expect(res.headers.get('set-cookie') ?? '').toContain('Max-Age=0');
  });
});

describe('POST /api/account/register (cadastro mock)', () => {
  it('forma valida: nunca persiste, so inicia a sessao com id sintetico', async () => {
    const res = await register(
      postForm('http://localhost/api/account/register', { nome: 'Carla Nunes', email: 'carla.nunes@exemplo.com', senha: '12345678', confirmarSenha: '12345678' }),
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean; customerId: string };
    expect(body.ok).toBe(true);
    expect(body.customerId).toMatch(/^conta-/);
    expect(res.headers.get('set-cookie') ?? '').toContain(SESSION_COOKIE);
  });

  it('confirmacao de senha diferente: 400, nunca inicia sessao', async () => {
    const res = await register(
      postForm('http://localhost/api/account/register', { nome: 'Carla Nunes', email: 'carla.nunes@exemplo.com', senha: '12345678', confirmarSenha: 'outra-coisa' }),
    );
    expect(res.status).toBe(400);
    expect(res.headers.get('set-cookie')).toBeNull();
  });

  it('senha curta: 400 (minimo 8, unica regra de "seguranca" que faz sentido num cadastro mock)', async () => {
    const res = await register(
      postForm('http://localhost/api/account/register', { nome: 'Carla Nunes', email: 'carla.nunes@exemplo.com', senha: '123', confirmarSenha: '123' }),
    );
    expect(res.status).toBe(400);
  });
});
