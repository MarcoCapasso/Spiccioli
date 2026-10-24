import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { apiFetch } from "./client";
import type {
  CategoryResponse,
  DefaultCategory,
  IsoDate,
  PagedResponse,
  TransactionResponse,
  TransactionSummaryResponse,
  TransactionType,
  UserResponse,
} from "../types";

//I movimenti per pagina
export const PAGE_SIZE = 20;

//I filtri dell'elenco: gli stessi nomi dei parametri dell'API
export type TransactionFilters = {
  type?: TransactionType;
  categoryId?: number;
  from?: IsoDate;
  to?: IsoDate;
  search?: string;
};

//Le chiavi della cache: una per ogni tipo di dato
export const queryKeys = {
  profile: ["profile"] as const,
  defaultCategories: ["default-categories"] as const,
  categories: (includeArchived: boolean) =>
    ["categories", includeArchived] as const,
  transactions: (filters: TransactionFilters, page: number) =>
    ["transactions", "list", filters, page] as const,
  summary: (filters: TransactionFilters) =>
    ["transactions", "summary", filters] as const,
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
export function useTransactions(filters: TransactionFilters, page: number) {
  return useQuery({
    queryKey: queryKeys.transactions(filters, page),
    queryFn: () =>
      apiFetch<PagedResponse<TransactionResponse>>(
        `/api/transactions${toQuery({ ...filters, page, pageSize: PAGE_SIZE })}`,
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
