import type { Meta, StoryObj } from '@storybook/react';
import { Button, type ButtonSize, type ButtonVariant } from './button';

const meta = {
  title: 'Átomos/Button',
  component: Button,
  args: { children: 'Adicionar ao carrinho' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'tertiary', 'danger'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primario: Story = {};
export const Secundario: Story = { args: { variant: 'secondary' } };
export const Terciario: Story = { args: { variant: 'tertiary', children: 'Ver detalhes' } };
export const Perigo: Story = { args: { variant: 'danger', children: 'Remover item' } };
export const Desabilitado: Story = { args: { disabled: true } };
export const Carregando: Story = { args: { loading: true, loadingLabel: 'Adicionando ao carrinho' } };
export const LarguraTotal: Story = { args: { fullWidth: true } };

/** Foco visivel: a story foca o botao para o anel de foco aparecer (e ser checado pelo axe). */
export const Foco: Story = {
  play: async ({ canvasElement }) => {
    canvasElement.querySelector('button')?.focus();
  },
};

const variants: ButtonVariant[] = ['primary', 'secondary', 'tertiary', 'danger'];
const sizes: ButtonSize[] = ['sm', 'md', 'lg'];

/** Matriz 4 variantes x 3 tamanhos x estados (padrao, desabilitado, carregando). Todos >= 44px de altura. */
export const Matriz: Story = {
  render: () => (
    <div className="grid gap-6">
      {variants.map((variant) => (
        <div key={variant} className="grid gap-3">
          <p className="text-sm font-bold">{variant}</p>
          {sizes.map((size) => (
            <div key={size} className="flex flex-wrap items-center gap-3">
              <Button variant={variant} size={size}>
                Comprar {size}
              </Button>
              <Button variant={variant} size={size} disabled>
                Desabilitado
              </Button>
              <Button variant={variant} size={size} loading>
                Carregando
              </Button>
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
};
