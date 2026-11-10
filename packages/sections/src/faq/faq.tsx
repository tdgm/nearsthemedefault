import { Accordion } from '@nears/ui';
import { RichText } from '../shared/rich-text.tsx';
import type { FaqProps } from './faq.schema';

/**
 * Perguntas frequentes em accordion nativo (details/summary): respostas sempre
 * no HTML inicial, teclado e leitor de tela de graca. O JSON-LD FAQPage sai de
 * /lib/seo com os mesmos itens (Fase 7). Perguntas sao h3 sob o h2 da secao.
 */
export function Faq({ items, title = 'Perguntas frequentes' }: FaqProps) {
  return (
    <section className="mx-auto mb-20 max-w-4xl px-4 [contain-intrinsic-size:auto_480px] [content-visibility:auto]">
      <h2 className="mb-4 text-xl font-heading text-balance">{title}</h2>
      <Accordion
        headingLevel={3}
        items={items.map((item, i) => ({
          id: `faq-${i}`,
          title: item.question,
          content: <RichText text={item.answer} className="mb-2 last:mb-0" />,
        }))}
      />
    </section>
  );
}
