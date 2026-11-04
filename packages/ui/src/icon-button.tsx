import type { ReactNode } from 'react';
import { Button, type ButtonProps } from './button';
import { cx } from './cx';

export type IconButtonProps = Omit<ButtonProps, 'startIcon' | 'endIcon' | 'fullWidth'> & {
  icon: ReactNode;
  /** Obrigatorio: sem texto visivel, o nome acessivel vem so daqui. */
  'aria-label': string;
};

const squareSizes = { sm: 'size-11 px-0', md: 'size-11 px-0', lg: 'size-12 px-0' };

/** Botao so com icone (ex.: fechar, favoritar). Alvo de toque 44x44 garantido. */
export function IconButton({ icon, size = 'md', className, ...props }: IconButtonProps) {
  return (
    <Button size={size} className={cx(squareSizes[size], className)} {...props}>
      {icon}
    </Button>
  );
}
