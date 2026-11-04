// Contrato de uma section (CLAUDE.md > Codigo): componente, `schema` (Zod),
// `meta` (priority, cwv, a11y) e story. Sem os quatro, o registry rejeita.
import type { Priority } from '@nears/manifests';
import type { ReactNode } from 'react';
import type { z } from 'zod';

export type SectionMeta = {
  /** Precisa bater com a priority declarada em sections.registry.yaml. */
  priority: Priority;
  cwv: Record<string, unknown>;
  a11y: Record<string, unknown>;
};

export type SectionModule<P = unknown> = {
  /** Id da section em sections.registry.yaml. */
  id: string;
  /** Function component; pode ser async (Server Component, padrao do projeto). */
  Component: (props: P) => ReactNode | Promise<ReactNode>;
  schema: z.ZodType<P>;
  meta: SectionMeta;
  /** Caminho (relativo a raiz do repo) do arquivo .stories.tsx desta section. */
  story: string;
};

/**
 * Parte pura de uma section (sem JSX): e o que o registry valida e o que
 * `scripts/manifests-validate.mjs` carrega em Node puro (type stripping nao
 * executa .tsx). O componente fica em `<id>/index.ts` (SectionModule).
 */
export type SectionSpec<P = unknown> = Omit<SectionModule<P>, 'Component'>;
export type AnySectionSpec = Omit<SectionSpec, 'schema'> & { schema: z.ZodType };

/** Identidade tipada da spec. */
export const defineSpec = <P>(spec: SectionSpec<P>): SectionSpec<P> => spec;

/**
 * Forma apagada (sem o tipo das props) para listas heterogeneas: o registry
 * guarda sections de props diferentes, entao `Component` aceita `never`.
 */
export type AnySectionModule = Omit<SectionModule, 'Component' | 'schema'> & {
  Component: (props: never) => unknown;
  schema: z.ZodType;
};

/** Identidade tipada: so existe para o compilador checar a forma na declaracao. */
export const defineSection = <P>(module: SectionModule<P>): SectionModule<P> => module;
