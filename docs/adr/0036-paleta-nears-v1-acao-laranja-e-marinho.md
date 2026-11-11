# 0036 - Paleta Nears na direcao V1: acao em laranja, marinho de marca

## Status

Aceita.

## Contexto

Proposta de design aprovada pelo dono (canvas "Nears Template Padrao", linha
"V1 paleta Nears"): layout e hierarquia da V1 (controles em pilula, grade
com blocos de cor) com as cores lidas do painel `painel.nears.com.br` em
2026-11-11. Ate aqui o botao primario era marinho-escuro e o laranja so
aparecia em link e selo (ADR 0031).

## Decisao

Tudo em `packages/tokens/tokens.json`; nenhum literal em componente.

1. **Acao**: `action` = `brand.500` (`#F26F35`), `action-hover` = `brand.400`,
   `action-on` = `neutral.900` (`#172033`). Branco sobre `#F26F35` da 2,96:1;
   texto escuro da 5,5:1 (hover 6,8:1). Vale nos dois temas.
2. **Marinho** (`color.navy`): 100 `#E5EAF1`, 200 `#D6E0F0`, 600 `#153E79`,
   700 `#172A55`, 800 `#12213F` (degrade do menu lateral do painel).
3. **Link** = `navy.600` (10,5:1 sobre branco). Sai do laranja para nao
   colidir com acao e oferta.
4. **Oferta** (`price-sale`, `badge-promo-bg`) = `brand.700` (`#B3410F`,
   5,7:1). Substitui `status.danger` nessas duas funcoes; continua distinto de
   `link` (ADR 0032). No tema escuro `price-sale` segue `danger-on-dark`
   porque `brand.300` ja e o link escuro.
5. **Novos semanticos** `surface-brand` (`navy.800`) e `on-brand` (branco,
   15,97:1), com par em `contracts.yaml > contrastPairs`. Usados na barra
   promocional.
6. **Neutros do painel**: 50 `#F8F9FA`, 100 `#F1F3F6`, 600 `#4B5565`,
   800 `#29364B`, 900 `#172033`. O 500 (`#667085`) fica: o `#788397` do painel
   da 3,8:1 e so serve como borda.

## Nao adotado (conservador em performance)

- **Bricolage Grotesque** da proposta: mais uma familia variavel a baixar.
  O padrao continua `system` (zero download); Inter ja esta pronto em
  `packages/tokens/fonts/` se a marca quiser (ADR 0001/0016).
- **Raios**: pilula nos controles e raios atuais mantidos (igual a V1).

## Consequencias

- Botoes primarios, filtro rapido ativo e atendimento ficam laranja com texto
  escuro; qualquer marca troca so `action`/`action-on`.
- Contrastes novos calculados a mao aqui; o gate oficial e `pnpm tokens:contrast`
  no CI.
- Hero e banners seguem dirigidos por CMS (imagem); `surface-brand` fica
  disponivel para blocos de marca.
