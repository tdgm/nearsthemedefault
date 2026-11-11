import { Container, Image } from '@nears/ui';
import type { BannerGridProps } from './banner-grid.schema';

const columnsClass = {
  '2': 'md:grid-cols-2',
  '3': 'md:grid-cols-3',
  '4': 'grid-cols-2 lg:grid-cols-4',
} as const;

/** `sizes` coerente com a grade (1 coluna no mobile, N no desktop). */
const sizesFor = { '2': '(min-width: 768px) 50vw, 100vw', '3': '(min-width: 768px) 33vw, 100vw', '4': '(min-width: 1024px) 25vw, 50vw' } as const;

/**
 * Grade de banners promocionais (2/3/4 colunas). Lista real; cada banner e um
 * link com a imagem (alt obrigatorio, dimensoes sempre, lazy por padrao do `Image`).
 */
export function BannerGrid({ columns = '3', banners }: BannerGridProps) {
  return (
    <Container as="section" className="mb-20 [contain-intrinsic-size:auto_360px] [content-visibility:auto]">
      <ul className={`grid gap-4 ${columnsClass[columns]}`}>
        {banners.map((banner) => {
          const img = (
            <Image
              src={banner.image.src}
              alt={banner.alt}
              width={banner.image.width}
              height={banner.image.height}
              sizes={sizesFor[columns]}
              className="h-auto w-full rounded-xl"
            />
          );
          return (
            <li key={`${banner.image.src}-${banner.alt}`}>
              {banner.href ? (
                <a href={banner.href} className="block">
                  {img}
                </a>
              ) : (
                img
              )}
            </li>
          );
        })}
      </ul>
    </Container>
  );
}
