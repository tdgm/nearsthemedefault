// Orcamento do design system: o pacote @nears/ui inteiro (todos os componentes,
// com tree-shaking desligado de proposito = pior caso) precisa caber em
// `LIMIT_KB` gzip. Gate da Fase 3 (docs/ROADMAP.md, docs/adr/0013).
// Uso: node scripts/check-ui-bundle.mjs
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

export const LIMIT_KB = 25;
const root = fileURLToPath(new URL('..', import.meta.url));

const result = await build({
  root,
  logLevel: 'silent',
  configFile: false,
  esbuild: { jsx: 'automatic' },
  build: {
    write: false,
    minify: 'esbuild',
    target: 'es2022',
    lib: { entry: 'packages/ui/src/index.ts', formats: ['es'], fileName: 'ui' },
    rollupOptions: {
      external: ['react', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
      // Mede o pacote inteiro, nao so o que um consumidor importa.
      treeshake: false,
      onwarn() {},
    },
  },
});

const outputs = (Array.isArray(result) ? result : [result]).flatMap((r) => r.output);
const js = outputs.filter((o) => o.type === 'chunk');
const bytes = js.reduce((sum, c) => sum + gzipSync(c.code).length, 0);
const kb = bytes / 1024;

console.log(`@nears/ui: ${kb.toFixed(2)} KB gzip (limite ${LIMIT_KB} KB, ${js.length} chunk)`);
if (kb > LIMIT_KB) {
  console.error(`Pacote @nears/ui estourou o orcamento de ${LIMIT_KB} KB gzip.`);
  process.exit(1);
}
