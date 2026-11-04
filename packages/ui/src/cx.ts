// Junta classes condicionalmente. Nao usamos clsx/classnames (CLAUDE.md:
// evitar dependencia nova sem necessidade real) - isto cobre o uso do pacote.
export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}
