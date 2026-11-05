import { partytownSnippet } from '@builder.io/partytown/integration';
import { loadConfig } from '../manifest';
import { loaderScript } from './loader';

type Script = ReturnType<typeof loadConfig>['thirdParties']['scripts'][number];

/** Pasta (publicada em apps/web/public) com os arquivos do Partytown; ver `pnpm --filter web partytown:copy`. */
export const PARTYTOWN_LIB = '/~partytown/';

/**
 * Server Component: injeta os terceiros declarados em `nears.config.yaml > thirdParties`.
 * Sem itens, devolve null (zero HTML, zero requisicao). Scripts `partytown` viram
 * `type="text/partytown"` (o navegador nao os executa; o worker os busca e roda) e
 * o snippet de 2-3 KB so existe se houver algum. Os demais entram por um loader
 * inline que espera ociosidade ou a primeira interacao. Fica no fim do <body>.
 */
export function ThirdPartyScripts({ scripts = loadConfig().thirdParties.scripts }: { scripts?: readonly Script[] }) {
  if (scripts.length === 0) return null;
  const inWorker = scripts.filter((s) => s.strategy === 'partytown');
  const onMainThread = scripts.filter((s) => s.strategy !== 'partytown');
  const forward = [...new Set(inWorker.flatMap((s) => s.forward))];
  return (
    <>
      {inWorker.length > 0 && (
        <script data-partytown="" dangerouslySetInnerHTML={{ __html: partytownSnippet({ lib: PARTYTOWN_LIB, forward, debug: false }) }} />
      )}
      {inWorker.map((s) => (
        // type="text/partytown" nao e executado pelo navegador (o worker busca e roda o script):
        // a regra de script sincrono do Next nao se aplica.
        // eslint-disable-next-line @next/next/no-sync-scripts
        <script key={s.id} type="text/partytown" src={s.src} data-third-party={s.id} />
      ))}
      {onMainThread.length > 0 && (
        <script
          dangerouslySetInnerHTML={{
            __html: loaderScript(onMainThread.map((s) => ({ id: s.id, src: s.src, strategy: s.strategy === 'idle' ? 'idle' : 'post-interaction' }))),
          }}
        />
      )}
    </>
  );
}
