import { fill } from '../shared/template.ts';
import type { PdpPickupProps } from './pdp-pickup.schema';

const defaults = {
  title: 'Retirada ou entrega pela loja mais próxima',
  hint: 'Informe seu CEP no campo de frete acima para ver a loja mais próxima.',
  pickupLine: 'Retire na {store} em até {eta} min',
  deliveryLine: 'Entrega pela {store} em até {eta} min',
  distance: '{km} km de distância',
} as const;

/**
 * Retirada/entrega pela loja mais proxima (Fase 9d, ADR 0028). ADITIVO sobre
 * PdpShipping, nunca substituicao - so e renderizado quando fulfillment.mode
 * != "centralized" (ver apps/web/lib/templates/pdp-content.ts). Reusa o
 * MESMO ?cep= do formulario de frete: nao tem campo proprio, nunca pede o
 * CEP de novo. Sem JS: e so um `role="status"` preenchido no servidor a
 * partir de `quote` (data layer); reserva altura minima (64px) para o
 * resultado nao empurrar o conteudo abaixo.
 */
export function PdpPickup({ cep, quote, labels }: PdpPickupProps) {
  const l = { ...defaults, ...labels };
  const error = quote && 'error' in quote ? quote.error : undefined;
  const result = quote && 'store' in quote ? quote : undefined;

  return (
    <section aria-labelledby="retirada-titulo" className="py-4">
      <h2 id="retirada-titulo" className="mb-3 text-lg font-bold">
        {l.title}
      </h2>
      <div role="status" className="min-h-16">
        {!cep && <p className="text-sm text-on-surface-muted">{l.hint}</p>}
        {error && <p className="text-sm text-danger">{error}</p>}
        {result && (
          <ul className="space-y-1 text-sm">
            {result.pickup && <li>{fill(l.pickupLine, { store: result.store.name, eta: result.pickup.etaMinutes })}</li>}
            {result.delivery && <li>{fill(l.deliveryLine, { store: result.store.name, eta: result.delivery.etaMinutes })}</li>}
            <li className="text-on-surface-muted">
              {result.store.address} · {fill(l.distance, { km: result.distanceKm })}
            </li>
          </ul>
        )}
      </div>
    </section>
  );
}
