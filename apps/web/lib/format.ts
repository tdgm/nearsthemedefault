// Formatacao BR (CLAUDE.md > Codigo: "Formatacao BR centralizada em /lib/format").
// Implementacao real em @nears/ui (packages/ui/src/format.ts) porque o
// componente Price tambem precisa dela; este arquivo so reexporta para o
// resto de apps/web continuar importando de "/lib/format".
export { formatMoney, formatInstallment, formatCep, formatCnpj, formatDateBR } from '@nears/ui';
