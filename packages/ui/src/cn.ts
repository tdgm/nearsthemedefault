/** Junta classes ignorando valores falsos. Sem dependencia (clsx/tailwind-merge). */
export const cn = (...parts: (string | false | null | undefined)[]): string => parts.filter(Boolean).join(' ');
