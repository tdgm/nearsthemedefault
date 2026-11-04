import { cn } from '../cn';
import { Badge } from '../badge/badge';
import { formatBRL, formatInstallments, percentOff } from '../format';

export type PriceProps = {
  /** Preco de venda (por). */
  price: number;
  /** Preco cheio (de). Mostrado riscado so se for maior que `price`. */
  listPrice?: number;
  /** Parcelamento sem juros: "Nx de R$ Y sem juros". */
  installments?: { count: number };
  size?: 'sm' | 'md' | 'lg';
  /** Mostra o selo de % off quando ha desconto. */
  showDiscount?: boolean;
  /** Textos para leitores de tela (microcopy). */
  labels?: { from: string; to: string };
  className?: string;
};

const sizes = { sm: 'text-md', md: 'text-xl', lg: 'text-3xl' } as const;

/**
 * Preco de/por com parcelamento e % off. "De" e "Por" ficam em texto para
 * leitores de tela (o risco visual sozinho nao diz o que e o valor riscado).
 */
export function Price({
  price,
  listPrice,
  installments,
  size = 'md',
  showDiscount = true,
  labels = { from: 'De', to: 'Por' },
  className,
}: PriceProps) {
  const off = listPrice ? percentOff(listPrice, price) : 0;
  const onSale = off > 0 && listPrice !== undefined;
  return (
    <div className={cn('grid gap-1', className)}>
      {onSale && (
        <p className="text-sm text-price-list">
          <span className="sr-only">{labels.from} </span>
          <s>{formatBRL(listPrice)}</s>
        </p>
      )}
      <p className="flex flex-wrap items-center gap-2">
        {onSale && <span className="sr-only">{labels.to} </span>}
        <span className={cn('leading-tight font-bold', sizes[size], onSale ? 'text-price-sale' : 'text-price')}>
          {formatBRL(price)}
        </span>
        {onSale && showDiscount && <Badge tone="promo">-{off}%</Badge>}
      </p>
      {installments && installments.count > 1 && (
        <p className="text-sm text-on-surface-muted">{formatInstallments(price, installments.count)}</p>
      )}
    </div>
  );
}
