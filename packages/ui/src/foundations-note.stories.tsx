import type { Meta, StoryObj } from '@storybook/react';
import { FoundationsNote } from './foundations-note';

const meta = {
  title: 'Fundação/FoundationsNote',
  component: FoundationsNote,
} satisfies Meta<typeof FoundationsNote>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {
  args: {
    title: 'Storybook funcionando',
    children: 'Esta story prova a cadeia Storybook, axe e Vitest da Fase 0.',
  },
};
