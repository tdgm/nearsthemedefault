// Teste automatizado real (WCAG AA calculado nos pares de contracts.yaml >
// gates.accessibility.contrastPairs, nos temas light e dark de
// packages/tokens/tokens.json) chega na Fase 1 - docs/ROADMAP.md e
// docs/adr/0004-contraste-e-tema-escuro.md. Os valores atuais ja foram
// verificados manualmente antes deste commit (tabela na ADR 0004, par mais
// justo 4.54:1). Este script e' so o placeholder que faz `pnpm validate`
// nao quebrar por comando inexistente antes da Fase 1 implementar o teste
// de verdade - ele NAO substitui esse teste.
console.log(
  'tokens:contrast ainda nao implementado como teste automatizado (chega na ' +
    'Fase 1). Valores de contraste atuais ja revisados manualmente em ' +
    'docs/adr/0004-contraste-e-tema-escuro.md.',
);
