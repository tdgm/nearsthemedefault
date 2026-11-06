# ADR 0025 - CSP de base, header da PDP e limite do proxy

Status: aceita (Fase 8)

## Contexto

Três pontos ficaram descritos nos manifests ou nos ADRs como se existissem, sem existir no app:

1. `nears.config.yaml > security.headers.contentSecurityPolicy` dizia `mode: strict-dynamic`
   ("nonce por requisição"), mas o app só emitia `frame-ancestors` (ADR 0009 adiou o resto).
2. O manifest declarava `headerVariant: minimal` para a PDP (`*/p`), e o ADR 0019 deixou a
   variante como dívida da Fase 8. O app sempre renderizou o header `full`.
3. O `proxy.ts` (ADR 0021) garante 404 real na primeira requisição, mas o matcher exclui
   caminhos com ponto (para não interceptar `robots.txt`, `llms.txt`, imagens, sitemaps...).

Um manifest que promete o que o app não faz é pior que um manifest que diz a verdade.

## Decisão

### 1. CSP de base declarativa; `strict-dynamic` removido

`security.headers.contentSecurityPolicy` passa a ter `mode: baseline | off`, `reportOnly` e
`formActionOrigins` (origens https extras). `baseline` emite:

```
object-src 'none'; base-uri 'self'; form-action 'self' [origens extras]; frame-ancestors 'none'
```

Cada diretiva fecha uma classe de ataque real que **não depende do conteúdo dos scripts**:
plugins (`object-src`), injeção de `<base>` que redireciona URLs relativas (`base-uri`),
sequestro de formulário para outro domínio (`form-action`) e clickjacking (`frame-ancestors`).

Não há `script-src`. Cobrir os scripts exigiria um destes caminhos, ambos piores hoje:

- **Hash:** os scripts do template (coletor de RUM, loader, snippet do Partytown) são texto
  determinístico e poderiam ser hasheados, mas o bootstrap inline do Next (`self.__next_f.push`,
  dados de RSC) muda a cada build e a cada rota. Hash de tudo não fecha.
- **Nonce:** exige `proxy.ts` gerando o nonce por requisição e lendo o header, o que torna
  **toda rota dinâmica**. Desfaz SSG/PPR, estoura TTFB/LCP e os budgets (ADR 0005, 0010, 0020).

`strict-dynamic` deixa de ser valor aceito pelo schema Zod (o build do manifest falha com
mensagem clara) até existir um caminho que não custe o render estático. O builder é puro
(`apps/web/lib/security/csp.ts`), testado, e os headers continuam vindo só do manifest.

`form-action 'self'` vale para o template (busca, filtros, ordenação, frete e o POST mock do
carrinho são do mesmo domínio). Quando o carrinho ou a newsletter apontarem para outro
domínio, a loja lista a origem em `formActionOrigins` (https, sem caminho): nenhum código muda.

### 2. Header da PDP fica `full`; `minimal` sai dos manifests

`minimal` por rota exige decidir o header na árvore de rotas (grupos de rota, `appRoute`,
mapa de budgets), sem ganho de performance ou de conversão medido. Conservador: o app e os
manifests passam a dizer a mesma coisa (`headerVariant: full`, `variantRules: []`).
`resolveHeaderVariant` e a variante `minimal` do componente continuam disponíveis e testadas
para a loja que quiser montar o layout por rota. Fecha a dívida do ADR 0019 (item 7).

### 3. Proxy: caminhos com ponto seguem fora do matcher

Cobrir esses caminhos faria o proxy rodar antes dos arquivos de `public/` e dos handlers
gerados (`robots.txt`, `sitemap/*.xml`...), com `isKnownPath` precisando conhecer todos eles.
Um erro ali responderia 404 a um arquivo legítimo, um risco maior que o benefício.

**Limite conhecido:** a primeira requisição a um arquivo inexistente com ponto (por exemplo
`/x/y.js`) ainda pode responder 200 com o shell do PPR; as seguintes respondem 404. Não afeta
páginas de conteúdo, que são cobertas pelo proxy (ADR 0021). O E2E do Partytown aquece a rota
antes de afirmar 404 para não depender de ordem.

## Consequências

- Resposta de todas as rotas ganha `object-src`, `base-uri` e `form-action` (~70 bytes de
  header); nenhum byte de HTML/JS/CSS, nenhum efeito no render estático.
- O E2E confere o valor exato do header e que nenhuma violação de CSP aparece no console nas
  rotas principais e nos envios de formulário.
- O gate de segurança "CSP completa com nonce" do ADR 0008 fica substituído por esta CSP de
  base; reabrir se o Next oferecer nonce sem render dinâmico (ou se a loja aceitar rota dinâmica).
- `Content-Security-Policy-Report-Only` está disponível (`reportOnly: true`) para testar uma
  política mais estrita por loja sem bloquear nada.
