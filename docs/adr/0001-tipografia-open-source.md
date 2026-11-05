# ADR 0001 - Tipografia open source com fallback websafe

- Status: aceito
- Data: 2026-11-03

## Contexto

O template é white-label e atende qualquer nicho de varejo. A fonte precisa ser:

1. **Livre para qualquer loja usar** sem contratar licença: só fontes open source.
2. **Barata em performance**: no máximo um arquivo, sem CLS na troca de fonte.
3. **Segura sem download**: se o arquivo não chegar, o texto aparece numa fonte
   que existe em todo sistema operacional (websafe).

A versão anterior dos tokens fixava métricas manuais da Inter
(`size-adjust: 104.5%` etc.), que precisariam ser recalibradas a cada troca de
marca.

## Decisão

- **Escolha da fonte é token**, não código: `tokens.json > typography.font.brand`
  (`source`, `name`, `license`, `file`, `fallback`). Trocar de marca troca esse
  bloco e o arquivo `.woff2`.
- **Licenças aceitas:** `OFL-1.1` e `Apache-2.0`. O schema Zod da Fase 2 rejeita
  qualquer outro valor.
- **Self-hosted sempre**, via `next/font/local`. Nunca Google Fonts ou outra CDN:
  cada host conta no budget de terceiros e envia o IP do visitante a outro
  controlador (LGPD).
- **Uma família variável**, subset latin + latin-ext, eixo `wght` recortado em
  400-700. Preload só do arquivo usado no peso 400. `font-display: swap`.
- **Fallback websafe calibrado automaticamente**: `next/font/local` com
  `adjustFontFallback` calcula `size-adjust`, `ascent-override`,
  `descent-override` e `line-gap-override` no build, contra Arial (sem serifa) ou
  Times New Roman (serifada). Nenhuma métrica é escrita à mão.
- **Pilha websafe** em `typography.family.system`:
  `system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
  'Noto Sans', 'Liberation Sans', sans-serif`.
- **Modo `system`**: `source: system` desliga o download e usa só a pilha
  websafe. Custo de fonte: 0 KB e 0 requisições. É a opção para lojas que não têm
  fonte de marca.

Default do template: **`system`** (zero download; ADR 0020). Fonte de marca opcional e pre-aprovada: **Inter** (OFL-1.1), sem serifa e neutra, pronta em `packages/tokens/fonts/`.

## Famílias pré-aprovadas

Todas variáveis e open source. Antes de adotar, confirme o `OFL.txt` (ou
`LICENSE`) dentro do pacote baixado. A licença do arquivo prevalece sobre esta
lista.

| Família | Licença | Estilo | Fallback |
| --- | --- | --- | --- |
| Inter | OFL-1.1 | sem serifa, neutra (opcional por marca; arquivo ja no repo) | Arial |
| Roboto Flex | OFL-1.1 | sem serifa, neutra | Arial |
| Noto Sans | OFL-1.1 | sem serifa, cobertura ampla de idiomas | Arial |
| Source Sans 3 | OFL-1.1 | sem serifa, humanista | Arial |
| Public Sans | OFL-1.1 | sem serifa, institucional | Arial |
| Work Sans | OFL-1.1 | sem serifa, grotesca | Arial |
| DM Sans | OFL-1.1 | sem serifa, geométrica | Arial |
| Manrope | OFL-1.1 | sem serifa, geométrica | Arial |
| Figtree | OFL-1.1 | sem serifa, amigável | Arial |
| Atkinson Hyperlegible Next | OFL-1.1 | sem serifa, foco em legibilidade | Arial |
| Source Serif 4 | OFL-1.1 | serifada | Times New Roman |
| Lora | OFL-1.1 | serifada | Times New Roman |

Outra família open source pode entrar com novo ADR, desde que tenha versão
variável e licença OFL ou Apache.

## Consequências

- Troca de fonte não exige recalibrar nada nem tocar em código.
- `CLAUDE.md`, `ROADMAP.md` e `PROMPTS.md` deixam de pedir calibragem manual de
  `size-adjust`. A Fase 1 passa a validar a licença e a existência do arquivo.
- O teste visual de CLS da Fase 5 continua obrigatório: ele confirma que o
  fallback automático segura o layout.
- Fontes comerciais (Adobe, Monotype etc.) ficam fora do template. Uma loja que
  precise delas faz isso num fork, com ADR próprio.
