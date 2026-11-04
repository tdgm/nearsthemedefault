// Conta hosts de terceiros DISTINTOS a partir do relatorio que
// `pnpm lh` (lhci autorun) grava em .lighthouseci/ antes do upload. As
// assercoes resource-summary:* de lighthouserc.json cobrem contagem de
// requisicoes, HTML e peso de terceiros - mas nao ha uma assercao nativa para "numero de dominios de terceiros distintos"
// (CLAUDE.md: "Hosts de terceiros <= 8"). A auditoria `third-party-summary`
// do proprio Lighthouse ja agrupa requisicoes por entidade/dominio; este
// script so le esse agrupamento e aplica o limite. Roda no job `lighthouse`
// do CI, depois de `pnpm lh` (ver docs/adr/0005).
import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import YAML from 'yaml';

const DIR = '.lighthouseci';
const cfg = YAML.parse(await readFile('nears/nears.config.yaml', 'utf8'));
const limit = cfg.budgets.third_party_hosts;

if (!existsSync(DIR)) {
  console.error(
    `\nNao encontrei ${DIR}/. Rode "npx @lhci/cli autorun" antes deste script ` +
      '(e isso que o job `lighthouse` do CI faz).\n'
  );
  process.exit(1);
}

const reportFiles = (await readdir(DIR)).filter(
  (f) => f.startsWith('lhr-') && f.endsWith('.json')
);
if (reportFiles.length === 0) {
  console.error(`\nNenhum lhr-*.json em ${DIR}/. O autorun nao gerou relatorio.\n`);
  process.exit(1);
}

let failed = false;
console.log(`\nHOSTS DE TERCEIROS POR PAGINA (limite ${limit})\n`);

for (const file of reportFiles) {
  const lhr = JSON.parse(await readFile(join(DIR, file), 'utf8'));
  const audit = lhr.audits?.['third-party-summary'];
  const items = audit?.details?.items ?? [];
  // Cada item e uma entidade (dominio/provedor) que o proprio Lighthouse ja
  // identificou como terceiro - o host da pagina sob teste nao entra aqui.
  const hosts = items.map((i) => i.entity?.text ?? i.entity).filter(Boolean);
  const over = hosts.length > limit;
  failed = failed || over;
  console.log(
    (over ? 'FALHOU  ' : 'ok      ') + lhr.requestedUrl.padEnd(48) +
      String(hosts.length).padStart(3) + ` hosts: ${hosts.join(', ') || '(nenhum)'}`
  );
}

if (failed) {
  console.error(
    '\nLimite de hosts de terceiros estourado em pelo menos uma pagina. Remova ' +
      'ou consolide um provedor, ou abra um ADR justificando o aumento do ' +
      'limite em nears/nears.config.yaml.\n'
  );
  process.exit(1);
}
console.log('\nTodas as paginas dentro do limite de hosts de terceiros.\n');
