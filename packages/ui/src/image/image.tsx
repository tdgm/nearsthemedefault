import type { ImgHTMLAttributes } from 'react';

export type ImageFormat = 'avif' | 'webp' | 'original';
/** Monta a URL de uma largura/formato (CDN com transformacao on-the-fly). */
export type ImageLoader = (src: string, width: number, format: ImageFormat) => string;

export type ImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'width' | 'height' | 'loading' | 'srcSet'> & {
  src: string;
  /** Obrigatorio. Imagem so decorativa usa `alt=""` explicito. */
  alt: string;
  /** Dimensoes intrinsecas: obrigatorias para reservar espaco e evitar CLS. */
  width: number;
  height: number;
  /** Acima da dobra (candidata a LCP): AVIF/WebP + fetchpriority alto, sem lazy. */
  priority?: boolean;
  /** `sizes` correto do layout (ex.: tokens media.sizes.productCard). */
  sizes?: string;
  /** Sem loader renderiza um unico <img>; com loader gera AVIF + WebP + fallback. */
  loader?: ImageLoader;
  widths?: number[];
};

const DEFAULT_WIDTHS = [320, 480, 640, 960, 1280];

/**
 * `<picture>` com AVIF + WebP + fallback, `width`/`height` sempre definidos e
 * carga por posicao: acima da dobra eager + fetchpriority=high; abaixo, lazy +
 * decoding=async (CLAUDE.md > Performance).
 */
export function Image({
  src,
  alt,
  width,
  height,
  priority = false,
  sizes,
  loader,
  widths = DEFAULT_WIDTHS,
  className,
  style,
  ...rest
}: ImageProps) {
  const srcSet = (format: ImageFormat) =>
    loader ? widths.map((w) => `${loader(src, w, format)} ${w}w`).join(', ') : undefined;
  const img = (
    // eslint-disable-next-line @next/next/no-img-element -- este e o primitivo de imagem do design system (picture/srcset/CDN proprios, sem next/image).
    <img
      src={src}
      srcSet={srcSet('original')}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : undefined}
      className={className}
      style={{ aspectRatio: `${width} / ${height}`, ...style }}
      {...rest}
    />
  );
  if (!loader) return img;
  return (
    <picture>
      <source type="image/avif" srcSet={srcSet('avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet('webp')} sizes={sizes} />
      {img}
    </picture>
  );
}

/**
 * Alt gerado por regra a partir do produto (contracts.yaml > seo.global.altText):
 * "{nome} {valores de variacao} {marca}" sem repetir termos.
 */
export function buildAlt({ name, variantValues = [], brand }: { name: string; variantValues?: string[]; brand?: string }): string {
  const seen = new Set<string>();
  return [name, ...variantValues, brand]
    .filter((p): p is string => Boolean(p))
    .flatMap((p) => p.split(/\s+/))
    .filter((word) => {
      const key = word.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .join(' ');
}
