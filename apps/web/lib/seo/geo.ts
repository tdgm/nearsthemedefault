// Completude GEO do Product (contracts.yaml > data.product.requiredForGeo e
// onMissingGeoField). A lista sai do contrato e do `catalog.geoAttributes` do
// nicho; nada de atributo de nicho no codigo.
import type { Product } from '../data/schemas';
import { loadAllManifests } from '../manifest';
import type { Manifests } from '@nears/manifests';

/** Campos GEO que o produto NAO consegue emitir. Vazio = Product completo. */
export function missingGeoFields(product: Product, manifests: Pick<Manifests, 'config' | 'contracts'> = loadAllManifests()): string[] {
  const { config, contracts } = manifests;
  const missing: string[] = [];
  for (const field of contracts.data.product.requiredForGeo) {
    switch (field) {
      case 'aggregateRating':
        if (!product.rating || product.rating.count < 1) missing.push(field);
        break;
      case 'additionalProperty':
        // Sem tabela de specs no nicho (catalog.specTable.enabled=false), nao ha o que exigir.
        if (config.catalog.specTable.enabled && product.specs.length === 0) missing.push(field);
        break;
      // shippingDetails e hasMerchantReturnPolicy vem das politicas da loja (store.policies),
      // validadas pelo schema Zod: o produto nunca fica sem elas.
      default:
        break;
    }
  }
  const specNames = new Set(product.specs.map((s) => s.name.trim().toLowerCase()));
  for (const attr of config.catalog.geoAttributes) {
    const viaAxis = config.catalog.variantAxes.some((a) => a.schemaOrg === attr && product.variants.some((v) => v.axis === a.id));
    if (!viaAxis && !specNames.has(attr.toLowerCase())) missing.push(attr);
  }
  return missing;
}

/**
 * Aplica a politica do contrato: `fail-build` derruba o build (rota nao
 * prerenderiza), `warn-build` so avisa. Um produto incompleto nunca vira rich
 * result silenciosamente quebrado.
 */
export function enforceGeoCompleteness(product: Product, manifests: Pick<Manifests, 'config' | 'contracts'> = loadAllManifests()): void {
  const missing = missingGeoFields(product, manifests);
  if (missing.length === 0) return;
  const mode = manifests.contracts.data.product.onMissingGeoField;
  const message = `Product "${product.slug}" sem campos GEO exigidos: ${missing.join(', ')} (contracts.yaml > data.product.onMissingGeoField=${mode})`;
  if (mode === 'fail-build') throw new Error(message);
  console.warn(`[geo] ${message}`);
}
