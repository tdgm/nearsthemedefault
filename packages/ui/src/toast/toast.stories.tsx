import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../button/button';
import { ToastProvider, useToast, type ToastTone } from './toast';

function Demo({ tone }: { tone: ToastTone }) {
  const { show } = useToast();
  return <Button onClick={() => show('Produto adicionado à sacola.', tone)}>Disparar aviso</Button>;
}

const meta = {
  title: 'Moléculas/Toast',
  component: ToastProvider,
  args: { children: null },
} satisfies Meta<typeof ToastProvider>;
export default meta;
type Story = StoryObj<typeof meta>;

const tone = (t: ToastTone): Story => ({ render: (args) => <ToastProvider {...args}><Demo tone={t} /></ToastProvider> });
export const Informativo: Story = tone('info');
export const Sucesso: Story = tone('success');
export const Erro: Story = tone('danger');
