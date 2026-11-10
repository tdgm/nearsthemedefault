import { Button, formatBRL, formatCEP } from '@nears/ui';
import { fill } from '../shared/template.ts';
import type { PdpShippingProps } from './pdp-shipping.schema';

const defaults = {
  title: 'Calcular frete e prazo',
  label: 'CEP',
  hint: 'Só números, 8 dígitos.',
  submit: 'Calcular',
  help: 'Não sei meu CEP',
  free: 'Grátis',
  days: '{min} a {max} dias úteis',
  daysSingle: '{min} dias úteis',
  invalid: 'Informe um CEP válido com 8 dígitos.',
} as const;

/**
 * Calculadora de frete por CEP. E um formulario GET para a propria pagina
 * (`?cep=...#frete`): funciona sem JS, o resultado e HTML e o campo tem label,
 * dica e erro associados por `aria-describedby`. A cotacao vem do data layer
 * (`quote`); este componente so exibe. Altura minima reservada (96px) para o
 * resultado nao empurrar o conteudo abaixo.
 */
export function PdpShipping({ zipInput = true, helpHref, cep, quote, labels }: PdpShippingProps) {
  const l = { ...defaults, ...labels };
  const error = quote && 'error' in quote ? quote.error : undefined;
  return (
    <section id="frete" aria-labelledby="frete-titulo" className="py-4">
      <h2 id="frete-titulo" className="mb-3 text-lg font-heading">
        {l.title}
      </h2>
      {zipInput && (
        <form method="get" action="#frete" className="flex flex-wrap items-start gap-2">
          <div className="grid gap-1">
            <label htmlFor="cep" className="text-sm font-medium">
              {l.label}
            </label>
            <input
              id="cep"
              name="cep"
              type="text"
              inputMode="numeric"
              autoComplete="postal-code"
              pattern="[0-9]{5}-?[0-9]{3}"
              maxLength={9}
              required
              defaultValue={cep ? formatCEP(cep) : undefined}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? 'cep-erro' : 'cep-dica'}
              placeholder="00000-000"
              className="min-h-11 w-40 rounded-md border border-border-control bg-surface px-3"
            />
          </div>
          <Button type="submit" variant="secondary" className="mt-6">
            {l.submit}
          </Button>
          {helpHref && (
            <a href={helpHref} className="mt-6 inline-flex min-h-11 items-center text-sm underline underline-offset-4" rel="noopener noreferrer" target="_blank">
              {l.help}
            </a>
          )}
          <p id={error ? 'cep-erro' : 'cep-dica'} className={error ? 'basis-full text-sm text-danger' : 'basis-full text-sm text-on-surface-muted'}>
            {error ?? l.hint}
          </p>
        </form>
      )}
      <div role="status" className="min-h-24 pt-3">
        {quote && 'options' in quote && (
          <ul className="divide-y divide-border">
            {quote.options.map((o) => (
              <li key={o.id} className="flex flex-wrap items-baseline justify-between gap-2 py-2">
                <span>
                  <span className="font-medium">{o.name}</span>
                  <span className="text-on-surface-muted">
                    {' '}
                    · {fill(o.days[0] === o.days[1] ? l.daysSingle : l.days, { min: o.days[0], max: o.days[1] })}
                  </span>
                </span>
                <span className="font-bold">{o.price === 0 ? l.free : formatBRL(o.price)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
