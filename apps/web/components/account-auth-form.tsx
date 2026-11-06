'use client';
// Client Component (ilha): precisa de estado para enviar sem recarregar a
// pagina e anunciar o resultado em aria-live="polite" (CLAUDE.md > Acessibilidade,
// mesmo padrao de packages/sections/src/pdp-buybox/add-to-cart-form.tsx). Sem
// JS o <form method="post"> ainda funciona: o endpoint (Fase 9, ADR 0027)
// redireciona de volta com `?erro=1` em caso de falha.
import { useState, type FormEvent } from 'react';
import { Button, cn, Input } from '@nears/ui';

type CommonLabels = { email: string; password: string; submit: string; submitting: string; error: string; success: string };

/**
 * Uniao discriminada por `variant`: cadastro exige `name`/`confirmPassword`
 * no tipo, nao um fallback de texto hardcoded no componente (nenhum texto de
 * interface fica no codigo - CLAUDE.md). Nunca existe um estado em que o
 * campo exista na tela sem rotulo vindo do vocabulary.
 */
export type AccountAuthFormProps =
  | { variant: 'login'; action: string; returnUrl?: string; initialError?: boolean; labels: CommonLabels }
  | {
      variant: 'cadastro';
      action: string;
      returnUrl?: string;
      initialError?: boolean;
      labels: CommonLabels & { name: string; confirmPassword: string };
    };

type Phase = 'idle' | 'pending' | 'done' | 'error';

export function AccountAuthForm(props: AccountAuthFormProps) {
  // So os campos com o MESMO tipo nas duas pontas da uniao saem via
  // destructuring aqui; `variant`/`labels` ficam em `props.*` propositalmente
  // - e so assim que o TypeScript correlaciona o discriminante `variant` com
  // o formato de `labels` la na JSX (uma copia desestruturada perderia essa
  // narrowing e `props.labels.name`/`confirmPassword` virariam erro de tipo).
  const { action, returnUrl = '/', initialError = false } = props;
  const [phase, setPhase] = useState<Phase>(initialError ? 'error' : 'idle');

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (phase === 'pending') return;
    setPhase('pending');
    try {
      const response = await fetch(action, { method: 'POST', body: new FormData(event.currentTarget), headers: { Accept: 'application/json' } });
      const data = (await response.json().catch(() => null)) as { ok?: boolean } | null;
      if (!response.ok || !data?.ok) {
        setPhase('error');
        return;
      }
      setPhase('done');
    } catch {
      setPhase('error');
      return;
    }
    // Navegacao fora do try acima: uma falha aqui (ambiente sem navegacao real,
    // ex.: teste) nao pode reverter a mensagem de sucesso ja anunciada.
    try {
      window.location.assign(returnUrl);
    } catch {
      // Sessao ja comecou (cookie setado pela resposta); a pessoa so nao foi
      // redirecionada automaticamente.
    }
  }

  const { labels } = props;
  const message = phase === 'done' ? labels.success : phase === 'error' ? labels.error : phase === 'pending' ? labels.submitting : '';

  return (
    <form method="post" action={action} onSubmit={onSubmit} className="grid gap-4">
      <input type="hidden" name="returnUrl" value={returnUrl} />
      {props.variant === 'cadastro' && <Input label={props.labels.name} name="nome" type="text" autoComplete="name" required />}
      <Input label={labels.email} name="email" type="email" autoComplete="email" required />
      <Input
        label={labels.password}
        name="senha"
        type="password"
        autoComplete={props.variant === 'cadastro' ? 'new-password' : 'current-password'}
        minLength={props.variant === 'cadastro' ? 8 : undefined}
        required
      />
      {props.variant === 'cadastro' && (
        <Input label={props.labels.confirmPassword} name="confirmarSenha" type="password" autoComplete="new-password" minLength={8} required />
      )}
      {/* Regiao viva sempre no DOM (altura reservada): zero layout shift quando o texto aparece. */}
      <p role="status" aria-live="polite" className={cn('min-h-6 text-sm', phase === 'error' && 'text-danger')}>
        {message}
      </p>
      <Button type="submit" loading={phase === 'pending'} loadingLabel={labels.submitting} fullWidth>
        {labels.submit}
      </Button>
    </form>
  );
}
