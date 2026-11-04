import type { Meta, StoryObj } from '@storybook/react';
import { CustomerService } from './customer-service';

const channels = [
  { label: 'WhatsApp', href: 'https://wa.me/5511900000000', description: 'Seg. a sex., das 9h às 18h' },
  { label: 'E-mail', href: 'mailto:atendimento@loja.exemplo' },
  { label: 'Central de ajuda', href: '/ajuda', description: 'Trocas, entregas e pagamentos' },
];

const meta = {
  title: 'Sections/Globais/CustomerService',
  component: CustomerService,
  parameters: { layout: 'fullscreen' },
  args: { channels },
  decorators: [(Story) => <div className="h-96"><Story /></div>],
} satisfies Meta<typeof CustomerService>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Fechado: Story = {};
export const UmCanal: Story = { args: { channels: [channels[0]!] } };
export const MicrocopyDoNicho: Story = { args: { labels: { open: 'Ajuda', title: 'Precisa de ajuda?' } } };
