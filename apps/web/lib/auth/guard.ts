// Guard de sessao server-side para `/account/**` (Fase 9c, ADR 0027). Chamado
// de DENTRO do componente async envolvido em `<Suspense>` de cada pagina:
// `cookies()` e dado de requisicao, e com Cache Components (ADR 0007) ler
// dado de requisicao fora de um Suspense impede o build de prerenderizar a
// rota - mesmo padrao de `app/login/page.tsx`/`app/cadastro/page.tsx`
// (shell estatico fora, ilha dinamica dentro). Sem sessao valida, redireciona
// para `/login?returnUrl=<rota>`; nunca renderiza dado de um cliente para
// outro.
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { findCustomerById, type Customer } from '../data/customer';
import { decodeSessionCustomerId, SESSION_COOKIE } from './session';

export async function requireCustomer(returnUrl: string): Promise<Customer> {
  const jar = await cookies();
  const customerId = decodeSessionCustomerId(jar.get(SESSION_COOKIE)?.value);
  const customer = customerId ? await findCustomerById(customerId) : null;
  if (!customer) {
    redirect(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
  }
  return customer;
}
