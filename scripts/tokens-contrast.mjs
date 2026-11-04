// Gate de contraste AA (contracts.yaml > gates.accessibility.contrastPairs).
// O calculo real e a Fase 1 (docs/ROADMAP.md): depende do build de tokens para
// resolver as referencias dos pares semanticos nos temas light e dark.
// Na Fase 0 este script so garante que tokens.json existe e e JSON valido, e
// diz com todas as letras que NAO esta verificando contraste ainda.
import { readFile } from 'node:fs/promises';

try {
  JSON.parse(await readFile('packages/tokens/tokens.json', 'utf8'));
} catch (e) {
  console.error(`packages/tokens/tokens.json invalido: ${e.message}`);
  process.exit(1);
}

console.log(
  'tokens.json valido. PENDENTE (Fase 1): o calculo de contraste dos pares semanticos ainda nao existe,\n' +
    'entao este comando NAO esta validando AA. Nao conte com ele como gate ate a Fase 1.',
);
