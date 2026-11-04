// axe em 100% das stories: serve storybook-static e roda o test-runner
// (.storybook/test-runner.ts injeta axe em cada story). Pre-requisito:
// `pnpm build-storybook` (e o que o job `test` do CI faz antes).
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';

const PORT = 6006;
const URL = `http://127.0.0.1:${PORT}`;

if (!existsSync('storybook-static/index.json')) {
  console.error('storybook-static/ nao encontrado. Rode "pnpm build-storybook" antes.');
  process.exit(1);
}

const server = spawn('pnpm', ['exec', 'http-server', 'storybook-static', '-p', String(PORT), '-s'], {
  stdio: 'ignore',
});

async function waitReady(timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${URL}/index.json`);
      if (res.ok) return;
    } catch {
      /* servidor ainda subindo */
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error('http-server nao respondeu a tempo');
}

let code = 1;
try {
  await waitReady();
  code = await new Promise((resolve) => {
    const runner = spawn('pnpm', ['exec', 'test-storybook', '--url', URL, '--index-json'], {
      stdio: 'inherit',
    });
    runner.on('exit', (c) => resolve(c ?? 1));
  });
} finally {
  server.kill();
}
process.exit(code);
