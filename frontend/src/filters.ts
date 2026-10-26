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

//Una data valida nell'indirizzo ha la forma AAAA-MM-GG
function validDate(value: string | null) {
  return value !== null && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : '';
}

//Dall'indirizzo ai campi: un valore che non ha senso vale "nessun filtro", l'indirizzo lo scrive chiunque
export function filtersFromParams(params: URLSearchParams): FilterState {
  const type = params.get('type');
  const categoryId = params.get('categoryId') ?? '';

  return {
    type: type === 'Income' || type === 'Expense' ? type : 'all',
    categoryId: /^\d+$/.test(categoryId) ? categoryId : '',
    from: validDate(params.get('from')),
    to: validDate(params.get('to')),
    search: params.get('search') ?? '',
  };
}

//La pagina dall'indirizzo: un intero maggiore di zero, altrimenti la prima
export function pageFromParams(params: URLSearchParams) {
  const page = Number(params.get('page'));
  return Number.isInteger(page) && page > 0 ? page : 1;
}

//Dai campi all'indirizzo: si scrive solo ciò che è diverso dal predefinito, per avere indirizzi corti
export function toSearchParams(state: FilterState, page = 1) {
  const params = new URLSearchParams();

  if (state.type !== 'all') params.set('type', state.type);
  if (state.categoryId) params.set('categoryId', state.categoryId);
  if (state.from) params.set('from', state.from);
  if (state.to) params.set('to', state.to);
  if (state.search) params.set('search', state.search);
  if (page > 1) params.set('page', String(page));

  return params;
}