import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Next 16: substitui a PPR experimental do 15 (docs/adr/0007-nextjs-16.md;
  // nears/nears.config.yaml > rendering.cacheComponents). Builda com erro se
  // achar dado dinamico fora de um Suspense - disciplina de streaming
  // boundary exigida desde a primeira pagina com dado real (Fase 5/6).
  // Turbopack ja e o default do `next dev`/`next build` no 16, sem config
  // extra necessaria aqui.
  cacheComponents: true,
};

export default nextConfig;
