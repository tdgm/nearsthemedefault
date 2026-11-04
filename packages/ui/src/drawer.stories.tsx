import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Drawer } from './drawer';
import { Button } from './button';

const meta = {
  title: 'Overlay/Drawer',
  component: Drawer,
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {
  render: () => {
    function Demo() {
      const [open, setOpen] = useState(true);
      return (
        <>
          <Button onClick={() => setOpen(true)}>Abrir sacola</Button>
          <Drawer open={open} onOpenChange={setOpen} title="Sua sacola">
            <p className="text-md text-on-surface-muted">Sua sacola está vazia.</p>
          </Drawer>
        </>
      );
    }
    return <Demo />;
  },
};

export const PelaEsquerda: Story = {
  render: () => {
    function Demo() {
      const [open, setOpen] = useState(true);
      return (
        <>
          <Button onClick={() => setOpen(true)}>Abrir menu</Button>
          <Drawer open={open} onOpenChange={setOpen} title="Menu" side="left">
            <p className="text-md text-on-surface-muted">Departamentos.</p>
          </Drawer>
        </>
      );
    }
    return <Demo />;
  },
};
