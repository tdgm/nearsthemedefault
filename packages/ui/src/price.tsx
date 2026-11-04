import { formatInstallment, formatMoney } from './format';

export type PriceProps = {
  /** Preco atual (o que o cliente paga). */
  value: number;
  /** Preco "de", riscado - omitido se nao houver desconto. */
  listValue?: number;
  installments?: { count: number; valuePerInstallment: number; interestFree?: boolean };
  currency?: string;
};

function percentOff(value: number, listValue: number): number {
  return Math.round((1 - value / listValue) * 100);
}

/** De/por/parcelamento/%off - sempre via @nears/ui > formatMoney (CLAUDE.md > /lib/format). */
export function Price({ value, listValue, installments, currency }: PriceProps) {
  const hasDiscount = Boolean(listValue && listValue > value);

  return (
    <div className="flex flex-col gap-0.5">
      {hasDiscount && listValue && (
        <span className="text-sm text-price-list line-through">{formatMoney(listValue, currency)}</span>
      )}
      <div className="flex items-baseline gap-2">
        <span className={hasDiscount ? 'text-xl font-bold text-price-sale' : 'text-xl font-bold text-price'}>
          {formatMoney(value, currency)}
        </span>
        {hasDiscount && listValue && (
          <span className="text-sm font-medium text-price-sale">-{percentOff(value, listValue)}%</span>
        )}
      </div>
      {installments && (
        <span className="text-sm text-on-surface-muted">
          {formatInstallment(installments.count, installments.valuePerInstallment, installments.interestFree)}
        </span>
      )}
    </div>
  );
}
