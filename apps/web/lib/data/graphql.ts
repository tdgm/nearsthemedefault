// Transporte GraphQL do data layer. So servidor: o endpoint e a credencial vem
// de variaveis de ambiente server-only (CLAUDE.md > Seguranca), nunca NEXT_PUBLIC_*.
// Toda resposta e validada por um schema Zod antes de ser devolvida; resposta
// invalida falha alto em vez de renderizar dado quebrado.
import type { z } from 'zod';

export class GraphQLError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'GraphQLError';
  }
}

type Options<T extends z.ZodType> = {
  endpoint: string;
  query: string;
  variables?: Record<string, unknown>;
  schema: T;
  /** Segundos de cache (ISR). Padrao: routes.manifest > defaults.revalidate. */
  revalidate?: number;
  token?: string;
  fetcher?: typeof fetch;
};

export async function graphqlRequest<T extends z.ZodType>({
  endpoint,
  query,
  variables,
  schema,
  revalidate = 300,
  token,
  fetcher = fetch,
}: Options<T>): Promise<z.output<T>> {
  const res = await fetcher(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ query, variables }),
    next: { revalidate },
  });
  if (!res.ok) throw new GraphQLError(`GraphQL respondeu ${res.status}`, res.status);

  const payload = (await res.json()) as { data?: unknown; errors?: { message: string }[] };
  if (payload.errors?.length) throw new GraphQLError(payload.errors.map((e) => e.message).join('; '));

  const parsed = schema.safeParse(payload.data);
  if (!parsed.success) throw new GraphQLError(`Resposta fora do contrato: ${parsed.error.message}`);
  return parsed.data;
}
