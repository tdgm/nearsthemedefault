"use client";
// Ilhas client da PromoBar. So elas hidratam (a mensagem e o link ficam no HTML do
// servidor): `PromoBarShell` para dispensar e `Countdown` para o contador.
// Nenhuma das duas altera a altura da barra (reservada em h-12): CLS zero.

import { useEffect, useState, type ReactNode } from 'react';

export function PromoBarShell({
  children,
  dismissible,
  dismissLabel,
  regionLabel,
}: {
  children: ReactNode;
  dismissible: boolean;
  dismissLabel: string;
  regionLabel: string;
}) {
  // Sem persistencia de proposito: ler storage no mount mudaria o layout apos a
  // hidratacao (CLS). Persistir por cookie lido no servidor fica para a Fase 6.
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <section aria-label={regionLabel} className="h-12 overflow-hidden bg-surface-brand text-on-brand">
      {/* Mesmo gutter do Container, mas literal: esta ilha e "use client" e importar o barrel
          de @nears/ui aqui arrasta o index inteiro para o JS inicial (+~1 KB gzip, estourou o budget). */}
      <div className="mx-auto flex h-full max-w-7xl items-center justify-center gap-2 px-4">
        {children}
        {dismissible && (
          <button
            type="button"
            aria-label={dismissLabel}
            onClick={() => setDismissed(true)}
            className="-mr-3 ml-auto inline-flex size-11 shrink-0 items-center justify-center"
          >
            <span aria-hidden="true">✕</span>
          </button>
        )}
      </div>
    </section>
  );
}

const pad = (n: number) => String(n).padStart(2, '0');

/** "2d 03:04:05" ou "03:04:05". Devolve null quando ja acabou. */
export function formatRemaining(ms: number): string | null {
  if (ms <= 0) return null;
  const total = Math.floor(ms / 1000);
  const days = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${days > 0 ? `${days}d ` : ''}${pad(h)}:${pad(m)}:${pad(s)}`;
}

/**
 * Contador regressivo. O HTML do servidor traz a data de termino em texto
 * (`fallback`, acessivel e sem JS); depois de montar, mostra o tempo restante.
 * Os digitos sao aria-hidden: anunciar a cada segundo seria ruido.
 */
export function Countdown({ endsAt, fallback }: { endsAt: string; fallback: string }) {
  const end = new Date(endsAt).getTime();
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setText(formatRemaining(end - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [end]);

  return (
    <time dateTime={endsAt} className="shrink-0 text-sm font-bold tabular-nums">
      <span className="sr-only">{fallback}</span>
      <span aria-hidden="true" className="inline-block min-w-[11ch] text-center">
        {text ?? fallback}
      </span>
    </time>
  );
}
