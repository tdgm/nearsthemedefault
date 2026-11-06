// Cliente mock (Fase 9, ADR 0027). Espelha `contracts.yaml > data.customer`
// (Zod aqui e a mesma forma que o contrato exige). So existe para exercitar
// login/cadastro e a futura area da conta (Fase 9c) - este repo e frontend
// puro, sem backend de auth real: nenhuma senha e guardada ou comparada aqui.
import { z } from 'zod';

export const addressSchema = z.strictObject({
  id: z.string().min(1),
  label: z.string().min(1),
  recipient: z.string().min(1),
  street: z.string().min(1),
  number: z.string().min(1),
  complement: z.string().optional(),
  neighborhood: z.string().min(1),
  city: z.string().min(1),
  state: z.string().length(2),
  postalCode: z.string().regex(/^\d{8}$/, 'CEP com 8 digitos, sem mascara'),
  isDefault: z.boolean().optional(),
});
export type Address = z.infer<typeof addressSchema>;

export const customerSchema = z.strictObject({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.email(),
  cpf: z.string().optional(),
  phone: z.string().optional(),
  birthDate: z.iso.date().optional(),
  addresses: z.array(addressSchema).default([]),
});
export type Customer = z.infer<typeof customerSchema>;

/**
 * Fixture mock: 2 clientes conhecidos. So estes e-mails autenticam no login
 * mock (qualquer senha - a validacao e so de forma, como `/api/cart/items`);
 * demais e-mails respondem "credenciais invalidas", para o fluxo de erro
 * tambem ser exercitavel.
 */
const CUSTOMERS: readonly Customer[] = [
  customerSchema.parse({
    id: 'cliente-exemplo-1',
    name: 'Ana Souza',
    email: 'ana.souza@exemplo.com.br',
    phone: '11999990001',
    addresses: [
      {
        id: 'endereco-1',
        label: 'Casa',
        recipient: 'Ana Souza',
        street: 'Rua das Flores',
        number: '123',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        postalCode: '01310100',
        isDefault: true,
      },
    ],
  }),
  customerSchema.parse({
    id: 'cliente-exemplo-2',
    name: 'Bruno Lima',
    email: 'bruno.lima@exemplo.com.br',
    phone: '21999990002',
    addresses: [],
  }),
];

export async function findCustomerByEmail(email: string): Promise<Customer | null> {
  const normalized = email.trim().toLowerCase();
  return CUSTOMERS.find((c) => c.email.toLowerCase() === normalized) ?? null;
}

export async function findCustomerById(id: string): Promise<Customer | null> {
  return CUSTOMERS.find((c) => c.id === id) ?? null;
}
