type SearchStatusProps = {
  /** termo ja normalizado (trim); string vazia = busca sem termo */
  query: string;
  labels: {
    empty: string;
    noResults: string;
    noResultsHint: string;
  };
};

/**
 * Estados da busca. Ainda nao existe data layer (Fase 6), entao qualquer termo
 * cai em "sem resultados". Componente puro: o termo e renderizado como texto
 * pelo React (nunca como HTML).
 */
export function SearchStatus({ query, labels }: SearchStatusProps) {
  if (query === '') {
    return <p role="status">{labels.empty}</p>;
  }
  return (
    <div role="status">
      <p>
        {labels.noResults} <strong>«{query}»</strong>.
      </p>
      <p>{labels.noResultsHint}</p>
    </div>
  );
}
