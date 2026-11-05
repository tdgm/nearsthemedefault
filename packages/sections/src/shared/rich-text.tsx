import { toParagraphs } from './paragraphs.ts';

/** Renderiza o richtext do CMS como paragrafos reais (indexaveis, sem HTML injetado). */
export function RichText({ text, className }: { text: string; className?: string }) {
  return (
    <>
      {toParagraphs(text).map((p, i) => (
        <p key={i} className={className}>
          {p}
        </p>
      ))}
    </>
  );
}
