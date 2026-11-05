import { loadConfig } from '../manifest';
import { rumScript } from './script';

/**
 * Server Component: injeta o coletor RUM so quando `observability.rum.enabled`.
 * Fica no fim do <body> (nao bloqueia render) e nao entra no bundle de JS.
 */
export function RumScript() {
  const { rum } = loadConfig().observability;
  if (!rum.enabled || rum.sampleRate <= 0) return null;
  return <script dangerouslySetInnerHTML={{ __html: rumScript({ endpoint: rum.endpoint, sampleRate: rum.sampleRate }) }} />;
}
