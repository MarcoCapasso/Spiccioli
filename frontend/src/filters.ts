import type { TransactionFilters } from './api/queries';
import type { TransactionType } from './types';

//I filtri come li vede l'utente
//  i testi dei campi, vuoto = nessun filtro
export type FilterState = {
  type: 'all' | TransactionType;
  categoryId: string;
  from: string;
  to: string;
  search: string;
};

export const NO_FILTERS: FilterState = { type: 'all', categoryId: '', from: '', to: '', search: '' };

export function hasActiveFilters(state: FilterState) {
  return (
    state.type !== 'all' || state.categoryId !== '' || state.from !== '' || state.to !== '' || state.search !== ''
  );
}

//Dai campi dell'utente ai parametri dell'API
export function toApiFilters(state: FilterState, search: string): TransactionFilters {
  return {
    type: state.type === 'all' ? undefined : state.type,
    categoryId: state.categoryId ? Number(state.categoryId) : undefined,
    from: state.from || undefined,
    to: state.to || undefined,
    search: search.trim() || undefined,
  };
}