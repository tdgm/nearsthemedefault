// Home placeholder da Fase 0 - so prova que o appRoute "/page" declarado em
// nears/routes.manifest.yaml esta servido e passa pelos budgets estaticos.
// Conteudo real (sections, dados de loja) chega nas Fases 5 e 6. Server
// Component por padrao, sem "use client".
export default function HomePage() {
  return (
    <main>
      <h1>Nears - template em construcao</h1>
      <p>
        Fase 0: fundacao do monorepo. O conteudo real desta pagina vem das
        sections de <code>nears/sections.registry.yaml</code> a partir da
        Fase 5, roteadas por <code>nears/routes.manifest.yaml</code> na Fase
        6.
      </p>
    </main>
  );
}
