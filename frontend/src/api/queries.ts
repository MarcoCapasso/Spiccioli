import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { DefaultCategory, UserResponse } from "../types";
import { apiFetch } from "./client";

//Le chiavi della cache: una per ogni tipo di dato
export const queryKeys = {
  profile: ["profile"] as const,
  DefaultCategories: ["default-categories"] as const,
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
    queryKey: queryKeys.DefaultCategories,
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
