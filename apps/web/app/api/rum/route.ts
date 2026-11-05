// Endpoint MOCK do RUM de Core Web Vitals. Este repo e frontend puro: o coletor de
// verdade e do painel/observabilidade da Nears e entra trocando
// `observability.rum.endpoint` no manifest por uma URL https absoluta. Aqui so
// validamos o contrato e descartamos o beacon: nada e guardado nem logado.
import { RUM_MAX_BYTES, rumPayloadSchema } from '../../../lib/rum';

export async function POST(request: Request) {
  const text = await request.text().catch(() => '');
  if (text.length > RUM_MAX_BYTES) return new Response(null, { status: 413 });
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return new Response(null, { status: 400 });
  }
  return new Response(null, { status: rumPayloadSchema.safeParse(json).success ? 204 : 400 });
}
