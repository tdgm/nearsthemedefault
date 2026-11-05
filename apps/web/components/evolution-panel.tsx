import Link from 'next/link';
import { exampleHref, phases, stateLinks, statusLabel } from '../lib/evolution';
import { loadRoutes } from '../lib/manifest';

/**
 * Painel de acompanhamento do template (fases e rotas do manifest). Renderizado
 * pela home SO fora de producao (`process.env.NODE_ENV`, resolvido em build), entao
 * nao existe no HTML nem no JS da loja publicada.
 */
export function EvolutionPanel() {
  const routes = loadRoutes();

  return (
    <details className="mx-auto max-w-5xl p-4">
      <summary className="min-h-11 cursor-pointer font-semibold">Painel de evolução (desenvolvimento)</summary>

      <p>Mostra em que fase do roadmap o template está e permite abrir cada rota do manifest.</p>

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

      <section aria-labelledby="estados" className="mt-8">
        <h2 id="estados" className="mb-2 text-xl font-semibold">
          Estados de tela
        </h2>
        <ul className="list-disc pl-6">
          {stateLinks.map((s) => (
            <li key={s.href}>
              <Link href={s.href} className="underline">
                {s.label}
              </Link>{' '}
              (<code>{s.href}</code>)
            </li>
          ))}
        </ul>
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
    </details>
  );
}
