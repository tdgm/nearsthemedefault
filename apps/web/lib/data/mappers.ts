// Converte entidades do data layer em props de sections. Unico lugar que sabe
// como um Product vira ProductCardProps (reusado por home, colecao e PDP).
import type { ProductCardProps } from '@nears/sections';
import type { NearsConfig } from '../manifest';
import type { Product } from './schemas';

export type CardOptions = { aspect: ProductCardProps['aspect']; priority?: boolean; sizes?: string };

export function cardAspect(config: NearsConfig): NonNullable<ProductCardProps['aspect']> {
  const aspect = config.catalog.productMedia.aspect;
  return aspect === 'product' || aspect === 'portrait' || aspect === 'landscape' || aspect === 'square' ? aspect : 'portrait';
}

export function productHref(slug: string): string {
  return `/${slug}/p`;
}

export function toProductCard(product: Product, options: CardOptions): ProductCardProps {
  const [image, hover] = product.images;
  if (!image) throw new Error(`Produto ${product.slug} sem imagem`);
  return {
    image: { ...image, alt: image.alt ?? product.name },
    ...(hover ? { hoverImage: hover } : {}),
    name: product.name,
    href: productHref(product.slug),
    price: product.price,
    ...(product.listPrice ? { listPrice: product.listPrice } : {}),
    ...(product.installments ? { installments: product.installments } : {}),
    ...(product.badges.length > 0 ? { badges: product.badges } : {}),
    aspect: options.aspect,
    ...(options.priority ? { priority: true } : {}),
    ...(options.sizes ? { sizes: options.sizes } : {}),
  };
}
