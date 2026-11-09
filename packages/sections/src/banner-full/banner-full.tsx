import { Image, buttonClasses, cn } from '@nears/ui';
import type { BannerFullProps } from './banner-full.schema';

/**
 * Banner lifestyle + CTA. O texto fica num painel de superficie solida AO LADO da
 * imagem, nunca sobre ela: o contraste vem dos tokens (verificado por
 * `tokens:contrast`) e nao depende da foto (`a11y.contrastOverImage`).
 * Imagem com dimensoes e lazy; o titulo e h2.
 */
export function BannerFull({ image, alt, headline, body, cta, href, imageSide = 'left' }: BannerFullProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-6 [contain-intrinsic-size:auto_420px] [content-visibility:auto]">
      <div className="grid overflow-hidden rounded-lg bg-surface-subtle md:grid-cols-2">
        <Image
          src={image.src}
          alt={alt}
          width={image.width}
          height={image.height}
          sizes="(min-width: 768px) 50vw, 100vw"
          className={cn('h-auto w-full object-cover', imageSide === 'right' && 'md:order-2')}
        />
        <div className="flex flex-col items-start justify-center gap-3 p-6 md:p-10">
          <h2 className="text-2xl font-heading text-balance">{headline}</h2>
          {body && <p className="text-on-surface-muted">{body}</p>}
          {cta && href && (
            <a href={href} className={buttonClasses({ variant: 'primary', size: 'md' })}>
              {cta}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
