import { Breadcrumb } from '@nears/ui';
import type { BreadcrumbSectionProps } from './breadcrumb.schema';

/**
 * Section de trilha: usa o `Breadcrumb` do design system (nav + ol, aria-current
 * na pagina atual) e reserva altura. O JSON-LD BreadcrumbList sai de /lib/seo
 * com os mesmos itens (Fase 7).
 */
export function BreadcrumbSection({ items, label }: BreadcrumbSectionProps) {
  return (
    <div className="mx-auto mb-4 min-h-11 max-w-7xl px-4">
      <Breadcrumb items={items} label={label} />
    </div>
  );
}
