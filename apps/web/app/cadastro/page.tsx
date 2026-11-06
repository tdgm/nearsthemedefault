import type { Metadata } from 'next';
import { Link } from '@nears/ui';
import { AccountAuthForm } from '../../components/account-auth-form';
import { vocab } from '../../lib/manifest';
import { buildMetadata } from '../../lib/seo';

// Cadastro mock (Fase 9, ADR 0027): noindex,nofollow vem de
// contracts.yaml > seo.byTemplate.cadastro (dado pessoal, nunca conteudo de catalogo).
export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({ template: 'cadastro', title: vocab('accountCadastroTitle'), description: vocab('accountCadastroTitle'), path: '/cadastro' });
}

/** So caminho relativo (nunca um redirect aberto); sem valor, volta pra home. */
function safeReturnUrl(raw: string | string[] | undefined): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value && value.startsWith('/') ? value : '/';
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const returnUrl = safeReturnUrl(params.returnUrl);

  return (
    <main className="mx-auto max-w-md p-4">
      <h1 className="my-4 text-2xl font-bold">{vocab('accountCadastroTitle')}</h1>
      <AccountAuthForm
        variant="cadastro"
        action="/api/account/register"
        returnUrl={returnUrl}
        initialError={params.erro === '1'}
        labels={{
          name: vocab('accountCadastroName'),
          email: vocab('accountCadastroEmail'),
          password: vocab('accountCadastroPassword'),
          confirmPassword: vocab('accountCadastroConfirmPassword'),
          submit: vocab('accountCadastroSubmit'),
          submitting: vocab('accountCadastroSubmitting'),
          error: vocab('accountCadastroError'),
          success: vocab('accountCadastroSuccess'),
        }}
      />
      <p className="mt-6 text-sm text-on-surface-muted">
        {vocab('accountCadastroSwitchPrompt')}{' '}
        <Link href={`/login${returnUrl !== '/' ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ''}`}>{vocab('accountCadastroSwitchLabel')}</Link>
      </p>
    </main>
  );
}
