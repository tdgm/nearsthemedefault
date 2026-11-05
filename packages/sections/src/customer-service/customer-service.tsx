import { ChatIcon } from '@nears/ui';
import type { CustomerServiceProps } from './customer-service.schema';

const defaults = { open: 'Atendimento', title: 'Fale com a gente' } as const;

/**
 * Atendimento flutuante. `position: fixed`, entao nao ocupa espaco nem causa
 * layout shift (`cwv.noLayoutShift`); abre/fecha com `<details>` nativo, sem JS.
 * O botao tem 56px (>= 44px). Lista os canais como links reais.
 */
export function CustomerService({ channels, labels }: CustomerServiceProps) {
  const l = { ...defaults, ...labels };
  return (
    <details className="group fixed right-4 bottom-4 z-30">
      <summary
        aria-label={l.open}
        className="grid size-14 cursor-pointer list-none place-items-center rounded-full bg-action text-action-on shadow-lg [&::-webkit-details-marker]:hidden"
      >
        <ChatIcon size={28} />
      </summary>
      <div className="absolute right-0 bottom-16 w-72 rounded-lg border border-border bg-surface-raised p-3 shadow-lg">
        <p className="mb-1 font-bold">{l.title}</p>
        <ul>
          {channels.map((channel) => (
            <li key={channel.href}>
              <a href={channel.href} className="flex min-h-11 flex-col justify-center underline-offset-4 hover:underline">
                <span className="font-medium">{channel.label}</span>
                {channel.description && <span className="text-sm text-on-surface-muted">{channel.description}</span>}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}
