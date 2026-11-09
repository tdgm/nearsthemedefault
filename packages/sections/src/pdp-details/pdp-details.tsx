import { Accordion, type AccordionItem } from '@nears/ui';
import { RichText } from '../shared/rich-text.tsx';
import type { PdpDetailsProps } from './pdp-details.schema';

const defaults = {
  title: 'Detalhes do produto',
  description: 'Descrição',
  specs: 'Especificações',
  instructions: 'Cuidados e uso',
  guide: 'Guia',
  attribute: 'Atributo',
  value: 'Valor',
} as const;

/**
 * Descricao, especificacoes, cuidados e guia em accordion nativo (details):
 * tudo no HTML inicial. Especificacoes e guia sao `<table>` semanticas com
 * `scope` (nunca imagem; vira additionalProperty no JSON-LD, Fase 7). A
 * descricao abre por padrao; os itens tem `id` para ancoras (#guia).
 */
export function PdpDetails({ description, specs = [], instructions, guide, labels }: PdpDetailsProps) {
  const l = { ...defaults, ...labels };
  const items: AccordionItem[] = [];

  if (description) {
    items.push({ id: 'descricao', title: l.description, defaultOpen: true, content: <RichText text={description} className="mb-2 last:mb-0" /> });
  }
  if (specs.length > 0) {
    items.push({
      id: 'especificacoes',
      title: l.specs,
      content: (
        <table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">{l.specs}</caption>
          <thead className="sr-only">
            <tr>
              <th scope="col">{l.attribute}</th>
              <th scope="col">{l.value}</th>
            </tr>
          </thead>
          <tbody>
            {specs.map((s) => (
              <tr key={s.name} className="border-b border-border last:border-0">
                <th scope="row" className="w-1/3 py-2 pr-3 font-medium text-on-surface">
                  {s.name}
                </th>
                <td className="py-2">{s.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ),
    });
  }
  if (instructions) {
    items.push({ id: 'cuidados', title: l.instructions, content: <RichText text={instructions} className="mb-2 last:mb-0" /> });
  }
  if (guide) {
    items.push({
      id: 'guia',
      title: l.guide,
      content: (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">{l.guide}</caption>
            <thead>
              <tr className="border-b border-border">
                {guide.columns.map((c) => (
                  <th key={c} scope="col" className="py-2 pr-3 font-medium text-on-surface">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {guide.rows.map((row, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  {row.map((cell, j) =>
                    j === 0 ? (
                      <th key={j} scope="row" className="py-2 pr-3 font-medium text-on-surface">
                        {cell}
                      </th>
                    ) : (
                      <td key={j} className="py-2 pr-3">
                        {cell}
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ),
    });
  }

  if (items.length === 0) return null;
  return (
    <section id="detalhes" aria-labelledby="detalhes-titulo" className="py-6 [contain-intrinsic-size:auto_480px] [content-visibility:auto]">
      <h2 id="detalhes-titulo" className="mb-4 text-xl font-heading">
        {l.title}
      </h2>
      <Accordion headingLevel={3} items={items} />
    </section>
  );
}
