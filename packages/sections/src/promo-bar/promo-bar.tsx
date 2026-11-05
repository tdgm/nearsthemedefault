import { formatDate } from '@nears/ui';
import { Countdown, PromoBarShell } from './promo-bar-client';
import type { PromoBarProps } from './promo-bar.schema';

const defaults = { region: 'Promoção', dismiss: 'Dispensar aviso', endsAt: 'Termina em', rules: 'Ver regras' } as const;

/**
 * Barra promocional acima do header. A mensagem e o link vem no HTML do servidor;
 * so o contador e o "dispensar" hidratam (ilhas em promo-bar-client). Altura
 * reservada de 48px (`cwv.reservedHeight`): nada nela muda o layout.
 */
export function PromoBar({ message, href, countdown, dismissible = true, rulesHref, labels }: PromoBarProps) {
  const l = { ...defaults, ...labels };
  const text = href ? (
    <a href={href} className="underline underline-offset-4">
      {message}
    </a>
  ) : (
    <span>{message}</span>
  );
  return (
    <PromoBarShell dismissible={dismissible} dismissLabel={l.dismiss} regionLabel={l.region}>
      <p className="line-clamp-2 text-center text-sm leading-tight">{text}</p>
      {countdown && <Countdown endsAt={countdown.endsAt} fallback={`${l.endsAt} ${formatDate(countdown.endsAt)}`} />}
      {rulesHref && (
        <a href={rulesHref} className="inline-flex min-h-11 shrink-0 items-center text-xs underline underline-offset-4">
          {l.rules}
        </a>
      )}
    </PromoBarShell>
  );
}
