import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Modal } from './modal';
import { Button } from './button';

const meta = {
  title: 'Overlay/Modal',
  component: Modal,
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {
  render: () => {
    function Demo() {
      const [open, setOpen] = useState(true);
      return (
        <>
          <Button onClick={() => setOpen(true)}>Abrir modal</Button>
          <Modal open={open} onOpenChange={setOpen} title="Guia de medidas">
            <p className="text-md text-on-surface-muted">Confira a tabela de medidas antes de escolher o tamanho.</p>
          </Modal>
        </>
      );
    }
    return <Demo />;
  },
};
