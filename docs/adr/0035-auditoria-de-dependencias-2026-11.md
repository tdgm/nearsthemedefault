# 0035 - Auditoria de dependencias (nov/2026): patches aplicados, majors em espera

## Status

Aceita.

## Contexto

`pnpm outdated -r` levantou o estado de todas as dependencias do monorepo.
Por CLAUDE.md, decisao com mais de uma saida razoavel escolhe o caminho mais
conservador e registra ADR em vez de travar esperando - aqui a saida
conservadora e aplicar so patch/minor dentro da mesma major (risco minimo,
sem mudanca de API) e **nao** aplicar bump de major sem decisao explicita,
mesmo em devDependency sem custo de bundle, porque toolchain quebrado
bloqueia todo o resto do trabalho.

## Decisao

### Aplicado (patch/minor, mesma major)

| Pacote | De | Para |
| --- | --- | --- |
| `next` | 16.4.5 | 16.4.6 |
| `eslint-config-next` | 16.4.5 | 16.4.6 |
| `tailwindcss` | 4.3.4 | 4.3.5 |
| `@tailwindcss/postcss` | 4.3.4 | 4.3.5 |
| `typescript-eslint` | 8.72.1 | 8.72.2 |
| `@playwright/test` | 1.64.1 | 1.65.0 |

Stack obrigatoria do CLAUDE.md (Next 16, Tailwind 4, Radix, Zod, Storybook 8,
Vitest, Testing Library, Playwright, axe-core) continua exatamente a mesma
major em todos os casos.

### Nao aplicado - requer decisao explicita antes de agir

| Pacote | Atual | Mais recente | Por que nao aplicar agora |
| --- | --- | --- | --- |
| `@builder.io/partytown` | 0.10.3 | **Deprecated** no upstream | CLAUDE.md cita Partytown como uma das 3 formas aceitas de carregar script de terceiro (`afterInteractive`, `lazyOnload` ou Partytown). Pacote deprecado upstream e decisao de arquitetura (qual das 3 formas usar daqui pra frente), nao update de rotina. |
| `eslint` | 9.39.5 | 10.14.0 | Major; ESLint 10 muda regras/flat config. |
| `@eslint/js` | 9.39.5 | 10.0.1 | Acompanha o major do eslint acima. |
| `storybook` + `@storybook/addon-a11y` + `@storybook/react` + `@storybook/react-vite` | 8.6.19 | 10.6.7 | Pula a major 9 inteira; migracao de config/addons nao trivial, e `CLAUDE.md` fixa "Storybook 8" como stack obrigatoria - mudar a major e decisao de arquitetura, nao patch. |
| `typescript` | 5.9.3 | 7.0.2 | Pula a major 6; usado por `@nears/manifests`, `@nears/sections`, `@nears/ui`, `nearsthemedefault` e `web` - maior superficie de risco do lote. |
| `vite` | 6.4.5 | 8.3.8 | Major (pula a 7); usado pelo build do Storybook/Vitest. |
| `@vitejs/plugin-react` | 5.2.0 | 6.3.0 | Acompanha o major do vite acima. |
| `jsdom` | 28.1.0 | 31.0.0 | Major; ambiente dos testes unitarios (Vitest). |
| `@types/node` | 22.20.5 | 26.6.6 | Major dos tipos; o Node local (22.12.0) nem atende o `engines` atual (`>=22.18.0`) - trocar os tipos antes de resolver a versao real do Node so troca o sintoma. |

### Observacao separada (nao e dependencia do npm)

O Node local do Mac (22.12.0) esta abaixo do minimo que o proprio
`engines`/CI pedem (`>=22.18.0` - `pnpm install` avisa isso a cada rodada).
A CI do GitHub resolve Node "22" para uma patch mais nova via `setup-node` e
por isso nao sente o problema; localmente, isso e o que causa o
`ERR_UNKNOWN_FILE_EXTENSION` ao rodar scripts `.ts` fora do bundler (ver
execucoes anteriores de `pnpm validate` nesta mesma branch). Atualizar o
Node local (nvm/Volta) resolve sem tocar em nenhuma dependencia do repo.

## Consequencias

- `package.json`/`pnpm-lock.yaml` atualizados so nos 6 pacotes da tabela de
  patches; nenhuma API usada no repo muda de forma observavel.
- As 8 majors listadas ficam como trabalho futuro explicito, cada uma com o
  motivo registrado aqui - uma por uma, nao em lote, quando houver janela
  pra validar a migracao de cada uma isoladamente.
