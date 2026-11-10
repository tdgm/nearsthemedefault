import type { SectionTitleProps } from './section-title.schema';

/**
 * Titulo de secao. O nivel (h1/h2/h3) e escolhido pelo template para nao pular
 * nivel de heading. Com `href`, o texto inteiro e o link (alvo >= 44px) e o
 * ancora continua descritiva. Sem espaco acima (`docs/adr/0033`): quem separa
 * da secao anterior e o `mb-20` dela; aqui so o `pb-4`, justo com o conteudo
 * que o titulo introduz logo abaixo.
 */
export function SectionTitle({ text, level = 'h2', href }: SectionTitleProps) {
  const H = level;
  return (
    <H className="mx-auto max-w-7xl px-4 pb-4 text-xl font-heading text-balance md:text-2xl">
      {href ? (
        <a href={href} className="inline-flex min-h-11 items-center underline-offset-4 hover:underline">
          {text}
          <span aria-hidden="true" className="ps-2 text-on-surface-muted">
            ›
          </span>
        </a>
      ) : (
        text
      )}
    </H>
  );
}
