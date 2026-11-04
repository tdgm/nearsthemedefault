export type ImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  avifSrc?: string;
  webpSrc?: string;
  /** Acima da dobra: fetchpriority alto e sem lazy. Abaixo: lazy+async (CLAUDE.md > Performance). */
  priority?: boolean;
  sizes?: string;
  className?: string;
};

/**
 * <picture> com AVIF + WebP e fallback, width/height sempre definidos (zero
 * CLS - CLAUDE.md: "Toda imagem declara width/height ou aspect-ratio. Sem
 * excecao."). Server Component: nenhum destes atributos precisa de JS.
 */
export function Image({ src, alt, width, height, avifSrc, webpSrc, priority = false, sizes, className }: ImageProps) {
  return (
    <picture>
      {avifSrc && <source srcSet={avifSrc} sizes={sizes} type="image/avif" />}
      {webpSrc && <source srcSet={webpSrc} sizes={sizes} type="image/webp" />}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        className={className}
        style={{ aspectRatio: `${width} / ${height}` }}
      />
    </picture>
  );
}
