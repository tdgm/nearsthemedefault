import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../button/button';
import { Modal } from './modal';

const meta = { title: 'Organismos/Modal e Drawer', component: Modal } satisfies Meta<typeof Modal>;
export default meta;
type Story = StoryObj<typeof meta>;

function Demo({ variant, side }: { variant: 'modal' | 'drawer'; side?: 'left' | 'right' }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Abrir</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Sua sacola" variant={variant} {...(side ? { side } : {})}>
        <p>Sua sacola está vazia. Que tal explorar as novidades?</p>
        <Button className="mt-4" onClick={() => setOpen(false)}>Continuar comprando</Button>
      </Modal>
    </>
  );
}

const args = { open: false, onClose: () => {}, title: 'Sua sacola', children: null };
export const Dialogo: Story = { args, render: () => <Demo variant="modal" /> };
export const DrawerDireita: Story = { args, render: () => <Demo variant="drawer" /> };
export const DrawerEsquerda: Story = { args, render: () => <Demo variant="drawer" side="left" /> };
export const AbertoPorPadrao: Story = {
  args: { open: true, onClose: () => {}, title: 'Guia de medidas', children: <p>Tabela de medidas em HTML semântico.</p> },
};
