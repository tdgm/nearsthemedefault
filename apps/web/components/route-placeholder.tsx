import Link from 'next/link';
import { Suspense } from 'react';

type Params = Promise<Record<string, string>>;

type Props = {
  /** id da rota em nears/routes.manifest.yaml */
  id: string;
  /** template previsto (home, collection, pdp...) */
  template: string;
  /** params do segmento dinamico; resolvidos dentro de Suspense (cacheComponents) */
  params?: Params;
};

async function ParamsList({ params }: { params: Params }) {
  const entries = Object.entries(await params);
  if (entries.length === 0) return null;
  return (
    <dl className="my-4 grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1">
      {entries.map(([name, value]) => (
        <div key={name} className="contents">
          <dt className="font-semibold">{name}</dt>
          <dd>
            <code>{value}</code>
          </dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Placeholder de rota ate a Fase 6. Server Component: nenhum JS proprio no
 * cliente (so o <Link> do Next).
 */
export function RoutePlaceholder({ id, template, params }: Props) {
  return (
    <main className="mx-auto max-w-3xl p-4">
      <h1 className="my-4 text-2xl font-heading">Rota «{id}»</h1>
      <p>
        Placeholder do template <code>{template}</code>. A implementação real chega na Fase 6 (veja
        docs/ROADMAP.md).
      </p>
      {params ? (
        <Suspense fallback={<p>Carregando parâmetros…</p>}>
          <ParamsList params={params} />
        </Suspense>
      ) : null}
      <p className="mt-4">
        <Link href="/" className="underline">
          Voltar ao painel de evolução
        </Link>
      </p>
    </main>
  );
}
