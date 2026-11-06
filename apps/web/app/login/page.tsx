import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Link } from '@nears/ui';
import { AccountAuthForm } from '../../components/account-auth-form';
import { vocab } from '../../lib/manifest';
import { buildMetadata } from '../../lib/seo';

// Login mock (Fase 9, ADR 0027): noindex,nofollow vem de
// contracts.yaml > seo.byTemplate.login (dado pessoal, nunca conteudo de catalogo).
export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({ template: 'login', title: vocab('accountLoginTitle'), description: vocab('accountLoginTitle'), path: '/login' });
}

/** So caminho relativo (nunca um redirect aberto); sem valor, volta pra home. */
function safeReturnUrl(raw: string | string[] | undefined): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value && value.startsWith('/') ? value : '/';
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const labels = {
  email: vocab('accountLoginEmail'),
  password: vocab('accountLoginPassword'),
  submit: vocab('accountLoginSubmit'),
  submitting: vocab('accountLoginSubmitting'),
  error: vocab('accountLoginError'),
  success: vocab('accountLoginSuccess'),
};

/**
 * searchParams (returnUrl/erro) e dado de requisicao: com Cache Components
 * precisa ficar dentro de Suspense, senao o build falha ao tentar prerenderizar
 * a rota (mesmo padrao de app/s/page.tsx). O shell (H1 + formulario sem
 * personalizacao) sai no HTML estatico; so esta ilha e dinamica por requisicao.
 */
async function LoginForm({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const returnUrl = safeReturnUrl(params.returnUrl);

  return (
    <>
      <AccountAuthForm variant="login" action="/api/account/session" returnUrl={returnUrl} initialError={params.erro === '1'} labels={labels} />
      <p className="mt-6 text-sm text-on-surface-muted">
        {vocab('accountLoginSwitchPrompt')}{' '}
        <Link href={`/cadastro${returnUrl !== '/' ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ''}`}>{vocab('accountLoginSwitchLabel')}</Link>
      </p>
    </>
  );
}

export default function Page({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main className="mx-auto max-w-md p-4">
      <h1 className="my-4 text-2xl font-bold">{vocab('accountLoginTitle')}</h1>
      <Suspense
        fallback={
          <>
            <AccountAuthForm variant="login" action="/api/account/session" labels={labels} />
            <p className="mt-6 text-sm text-on-surface-muted">
              {vocab('accountLoginSwitchPrompt')} <Link href="/cadastro">{vocab('accountLoginSwitchLabel')}</Link>
            </p>
          </>
        }
      >
        <LoginForm searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
