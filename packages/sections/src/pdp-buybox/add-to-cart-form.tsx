"use client";
// Client Component (ilha): precisa de estado para enviar o formulario sem recarregar
// a pagina e anunciar o resultado em aria-live="polite" (CLAUDE.md > Acessibilidade).
// Sem JS o <form method="post"> envia direto ao endpoint e a validacao `required`
// dos radios e nativa. Os seletores chegam como `children` (renderizados no servidor).
import { useState, type FormEvent, type ReactNode } from 'react';

type Phase = 'idle' | 'pending' | 'done' | 'error';

export type AddToCartFormProps = {
  action?: string;
  sku?: string;
  children?: ReactNode;
  cta: string;
  /** CTA indisponivel (sem estoque / sem endpoint): botao desabilitado com este rotulo. */
  disabledLabel?: string;
  /** Classes do botao (calculadas no servidor: o cliente nao importa o Button do DS, ~0,7 KB a menos). */
  buttonClass: string;
  /** Preco curto exibido na barra fixa do mobile. */
  barPrice: string;
  stickyMobile: boolean;
  labels: { adding: string; added: string; addError: string };
};

const FORM_ID = 'pdp-form';

export function AddToCartForm({ action, sku, children, cta, disabledLabel, buttonClass, barPrice, stickyMobile, labels }: AddToCartFormProps) {
  const formId = FORM_ID;
  const [phase, setPhase] = useState<Phase>('idle');
  const disabled = Boolean(disabledLabel);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    if (!action || phase === 'pending') return;
    event.preventDefault();
    setPhase('pending');
    try {
      const res = await fetch(action, { method: 'POST', body: new FormData(event.currentTarget), headers: { Accept: 'application/json' } });
      setPhase(res.ok ? 'done' : 'error');
    } catch {
      setPhase('error');
    }
  }

  const label = disabled ? disabledLabel : phase === 'pending' ? labels.adding : phase === 'done' ? labels.added : cta;
  const message = phase === 'done' ? labels.added : phase === 'error' ? labels.addError : phase === 'pending' ? labels.adding : '';
  const blocked = disabled || !action;
  const button = (cls: string, form?: string) => (
    <button type="submit" form={form} disabled={blocked} aria-disabled={phase === 'pending' || undefined} className={`${buttonClass} ${cls}`}>
      {label}
    </button>
  );

  return (
    <>
      <form id={formId} method="post" action={action} onSubmit={onSubmit} className="grid gap-4">
        {children}
        {sku && <input type="hidden" name="sku" value={sku} />}
        <input type="hidden" name="quantity" value="1" />
        {/* Regiao viva sempre no DOM (altura reservada): so o texto muda, sem layout shift. */}
        <p role="status" aria-live="polite" className="min-h-6 text-sm">
          {message}
        </p>
        {button(stickyMobile ? 'max-md:hidden' : '')}
      </form>
      {stickyMobile && (
        // Barra fixa (72px) no mobile (`data-sticky-bar` sobe o botao de atendimento, ver globals.css); o botao se liga ao formulario pelo atributo `form`.
        <div data-sticky-bar className="fixed inset-x-0 bottom-0 z-40 flex h-[72px] items-center gap-3 border-t border-border bg-surface px-4 md:hidden">
          <p className="shrink-0 text-lg font-bold">{barPrice}</p>
          {/* `min-w-0` deixa o flex item encolher abaixo do min-content do rotulo (que entao quebra em
              duas linhas): sem isso, `flex-1` com `right:0` forca a barra a estourar a viewport. */}
          {button('min-w-0 flex-1', formId)}
        </div>
      )}
    </>
  );
}
