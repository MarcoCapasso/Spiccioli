import { apiFetch } from "./client";
import type { DateRange } from "../period";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";

import type {
  CategoryResponse,
  DefaultCategory,
  IsoDate,
  PagedResponse,
  TransactionResponse,
  TransactionSummaryResponse,
  TransactionType,
  UserResponse,
  CategoryTotalResponse,
  RecurrenceFrequency,
  RecurringExpenseResponse,
} from "../types";



//I movimenti per pagina
export const PAGE_SIZE = 20;

//I filtri dell'elenco
export type TransactionFilters = {
  type?: TransactionType;
  categoryId?: number;
  from?: IsoDate;
  to?: IsoDate;
  search?: string;
};

//Le chiavi della cache
export const queryKeys = {
  profile: ["profile"] as const,
  defaultCategories: ["default-categories"] as const,
  categories: (includeArchived: boolean) =>
    ["categories", includeArchived] as const,
  transactions: (filters: TransactionFilters, page: number, pageSize: number) =>
    ["transactions", "list", filters, page, pageSize] as const,
  summary: (filters: TransactionFilters) =>
    ["transactions", "summary", filters] as const,
  categoryTotals: (range: DateRange) =>
    ["transactions", "by-category", range] as const,
  recurringExpenses: ['recurring-expenses'] as const,
};

//Il profilo dell'utente collegato: GET /api/me
export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: () => apiFetch<UserResponse>("/api/me"),
  });
}

//Categorie proposte nell'onboarding
export function useDefaultCategories() {
  return useQuery({
    queryKey: queryKeys.defaultCategories,
    queryFn: () => apiFetch<DefaultCategory[]>("/api/me/default-categories"),
    staleTime: Infinity,
  });
}

//Completa l'onboarding: POST /api/me/onboarding
export function useCompleteOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryNames: string[]) =>
      apiFetch<UserResponse>("/api/me/onboarding", {
        method: "POST",
        body: { categoryNames },
      }),
    //La risposta è il profilo aggiornato: lo si mette subito in cache, così l'app sa che il setup è completo
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.profile, user);
    },
  });
}

//Trasforma un oggetto nella parte "?a=1&b=2" dell'indirizzo, saltando i valori vuoti
function toQuery(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  }
  const text = query.toString();
  return text ? `?${text}` : "";
}

//Le categorie dell'utente: GET /api/categories
export function useCategories(includeArchived = false) {
  return useQuery({
    queryKey: queryKeys.categories(includeArchived),
    queryFn: () =>
      apiFetch<CategoryResponse[]>(
        `/api/categories${toQuery({ includeArchived: includeArchived ? "true" : undefined })}`,
      ),
  });
}

//Una pagina di movimenti: GET /api/transactions
export function useTransactions(
  filters: TransactionFilters,
  page: number,
  pageSize = PAGE_SIZE,
) {
  return useQuery({
    queryKey: queryKeys.transactions(filters, page, pageSize),
    queryFn: () =>
      apiFetch<PagedResponse<TransactionResponse>>(
        `/api/transactions${toQuery({ ...filters, page, pageSize })}`,
      ),
    //Cambiando filtro o pagina, l'elenco precedente resta visibile finché arriva il nuovo
    placeholderData: keepPreviousData,
  });
}

//Entrate, uscite e saldo dei movimenti filtrati: GET /api/transactions/summary
export function useTransactionSummary(filters: TransactionFilters) {
  return useQuery({
    queryKey: queryKeys.summary(filters),
    queryFn: () =>
      apiFetch<TransactionSummaryResponse>(
        `/api/transactions/summary${toQuery(filters)}`,
      ),
    placeholderData: keepPreviousData,
  });
}

//Ciò che il modulo invia: gli stessi campi di CreateTransactionRequest e UpdateTransactionRequest
export type TransactionInput = {
  amount: number;
  date: IsoDate;
  type: TransactionType;
  categoryId: number;
  description: string | null;
  note: string | null;
};

//Dopo ogni modifica ai movimenti si rileggono elenchi, riepiloghi e conteggi:
//tutte le chiavi che iniziano con 'transactions' diventano vecchie in un colpo solo
function refreshTransactions(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: ["transactions"] });
}

//Crea un movimento: POST /api/transactions
export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: TransactionInput) =>
      apiFetch<TransactionResponse>("/api/transactions", {
        method: "POST",
        body: input,
      }),
    onSuccess: () => refreshTransactions(queryClient),
  });
}

//Modifica un movimento: PUT /api/transactions/{id}
export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: TransactionInput }) =>
      apiFetch<TransactionResponse>(`/api/transactions/${id}`, {
        method: "PUT",
        body: input,
      }),
    onSuccess: () => refreshTransactions(queryClient),
  });
}

//Elimina un movimento: DELETE /api/transactions/{id}
export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      apiFetch<void>(`/api/transactions/${id}`, { method: "DELETE" }),
    onSuccess: () => refreshTransactions(queryClient),
  });
}

//Numero di movimenti e totale per ogni categoria nel periodo
export function useCategoryTotals(range: DateRange = {}) {
  return useQuery({
    queryKey: queryKeys.categoryTotals(range),
    queryFn: () =>
      apiFetch<CategoryTotalResponse[]>(
        `/api/transactions/summary/by-category${toQuery(range)}`,
      ),
    placeholderData: keepPreviousData,
  });
}

//Il nome di una categoria compare anche nei movimenti
function refreshCategories(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ["categories"] }),
    queryClient.invalidateQueries({ queryKey: ["transactions"] }),
  ]);
}

//Ciò che il modulo invia per una categoria
export type CategoryInput = {
  name: string;
  color?: string;
};

//Crea una categoria
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CategoryInput & { type: TransactionType }) =>
      apiFetch<CategoryResponse>("/api/categories", {
        method: "POST",
        body: input,
      }),
    onSuccess: () => refreshCategories(queryClient),
  });
}

//Rinomina o cambia colore
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: CategoryInput }) =>
      apiFetch<CategoryResponse>(`/api/categories/${id}`, {
        method: "PUT",
        body: input,
      }),
    onSuccess: () => refreshCategories(queryClient),
  });
}

//Elimina: se ha movimenti il backend la archivia, altrimenti la cancella: DELETE /api/categories/{id}
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      apiFetch<void>(`/api/categories/${id}`, { method: "DELETE" }),
    onSuccess: () => refreshCategories(queryClient),
  });
}

//Ripristina una categoria archiviata: POST /api/categories/{id}/restore
export function useRestoreCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      apiFetch<CategoryResponse>(`/api/categories/${id}/restore`, {
        method: "POST",
      }),
    onSuccess: () => refreshCategories(queryClient),
  });
}

//Le spese ricorrenti: GET /api/recurring-expenses
export function useRecurringExpenses() {
  return useQuery({
    queryKey: queryKeys.recurringExpenses,
    queryFn: () => apiFetch<RecurringExpenseResponse[]>('/api/recurring-expenses'),
  });
}

//Ciò che il modulo invia: gli stessi campi delle richieste di creazione e modifica
export type RecurringExpenseInput = {
  name: string;
  amount: number;
  frequency: RecurrenceFrequency;
  startDate: IsoDate;
  endDate: IsoDate | null;
  categoryId: number;
};

//Il backend sincronizza i piani dal mese corrente: si rileggono anche quelli (chiavi 'budgets', dalla 12.18)
function refreshRecurring(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ['recurring-expenses'] }),
    queryClient.invalidateQueries({ queryKey: ['budgets'] }),
  ]);
}

//Crea una spesa ricorrente: POST /api/recurring-expenses
export function useCreateRecurringExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RecurringExpenseInput) =>
      apiFetch<RecurringExpenseResponse>('/api/recurring-expenses', { method: 'POST', body: input }),
    onSuccess: () => refreshRecurring(queryClient),
  });
}

//Modifica una spesa ricorrente: PUT /api/recurring-expenses/{id}
export function useUpdateRecurringExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: RecurringExpenseInput }) =>
      apiFetch<RecurringExpenseResponse>(`/api/recurring-expenses/${id}`, { method: 'PUT', body: input }),
    onSuccess: () => refreshRecurring(queryClient),
  });
}

//Elimina (se mai usata) o termina (se ha già generato pagamenti): DELETE /api/recurring-expenses/{id}
export function useDeleteRecurringExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => apiFetch<void>(`/api/recurring-expenses/${id}`, { method: 'DELETE' }),
    onSuccess: () => refreshRecurring(queryClient),
  });
}