type SearchFormProps = {
  /** URL da rota de busca, vinda de routes.manifest.yaml (id: search) */
  action: string;
  label: string;
  placeholder: string;
  submit: string;
  /** termo atual; vazio na primeira visita */
  defaultValue?: string;
};

/**
 * Formulario GET nativo: funciona sem JavaScript (a busca e noindex, mas o
 * fluxo precisa funcionar com JS desligado). Server Component, sem JS proprio.
 */
export function SearchForm({ action, label, placeholder, submit, defaultValue = '' }: SearchFormProps) {
  return (
    <form role="search" action={action} method="get" className="my-4 flex gap-2">
      <label htmlFor="q" className="sr-only">
        {label}
      </label>
      <input
        id="q"
        name="q"
        type="search"
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoComplete="off"
        className="min-h-11 min-w-0 flex-1 border px-3"
      />
      <button type="submit" className="min-h-11 min-w-11 border px-4">
        {submit}
      </button>
    </form>
  );
}
