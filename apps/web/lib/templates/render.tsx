import { createElement, type ComponentType, type ReactNode } from 'react';
import { sectionModules } from '@nears/sections';
import type { SectionInstance } from './expand';

/**
 * Renderiza as instancias de um template. `propsFor` devolve as props cruas da
 * instancia (ou null para pular); toda prop passa pelo `schema` da section
 * antes do render (CLAUDE.md > Codigo: schema Zod valida o que o CMS entrega).
 * Server Component: nenhum JS de composicao vai ao cliente.
 */
export function renderInstances(
  instances: readonly SectionInstance[],
  propsFor: (instance: SectionInstance) => unknown | null,
): ReactNode[] {
  return instances.flatMap((instance) => {
    const mod = sectionModules.find((m) => m.id === instance.id);
    if (!mod) throw new Error(`Section "${instance.id}" nao esta no registry`);
    const raw = propsFor(instance);
    if (raw === null) return [];
    const props = mod.schema.parse(raw) as Record<string, unknown>;
    return [createElement(mod.Component as ComponentType<Record<string, unknown>>, { key: instance.key, ...props })];
  });
}
