import Link from 'next/link';
import { exampleHref, phases, statusLabel } from '../lib/evolution';
import { loadRoutes } from '../lib/manifest';

export default function HomePage() {
  const routes = loadRoutes();

  return (
    <main className="mx-auto max-w-5xl p-4">
      <h1 className="my-4 text-3xl font-bold">Nears — template padrão</h1>
      <p>
        Painel de evolução do front-end. Mostra em que fase do roadmap o template está e permite
        abrir cada rota do manifest. Esta página é provisória e some quando a Fase 6 entregar a
        home real.
      </p>

      <section aria-labelledby="fases" className="mt-8">
        <h2 id="fases" className="mb-2 text-xl font-semibold">
          Fases do roadmap
        </h2>
        <ol className="list-decimal pl-6">
          {phases.map((p) => (
            <li key={p.id} value={p.id}>
              Fase {p.id} — {p.name}: <strong>{statusLabel[p.status]}</strong>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="rotas" className="mt-8">
        <h2 id="rotas" className="mb-2 text-xl font-semibold">
          Rotas do manifest
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <caption className="mb-2 text-left">
              Rotas de nears/routes.manifest.yaml e o arquivo físico de cada uma
            </caption>
            <thead>
              <tr>
                <th scope="col" className="border p-2">
                  Rota
                </th>
                <th scope="col" className="border p-2">
                  Padrão
                </th>
                <th scope="col" className="border p-2">
                  Template
                </th>
                <th scope="col" className="border p-2">
                  Arquivo (appRoute)
                </th>
                <th scope="col" className="border p-2">
                  Abrir
                </th>
              </tr>
            </thead>
            <tbody>
              {routes.map((r) => {
                const href = exampleHref[r.id];
                return (
                  <tr key={r.id}>
                    <th scope="row" className="border p-2 font-medium">
                      {r.id}
                    </th>
                    <td className="border p-2">
                      <code>{r.pattern}</code>
                    </td>
                    <td className="border p-2">{r.template}</td>
                    <td className="border p-2">
                      <code>{r.appRoute ?? 'app/not-found.tsx'}</code>
                    </td>
                    <td className="border p-2">
                      {href ? (
                        <Link href={href} className="underline">
                          {href}
                        </Link>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
