import { useQuery } from "@tanstack/react-query";
import type { UserResponse } from "../types";
import { apiFetch } from "./client";

//Le chiavi della cache: una per ogni tipo di dato
export const queryKeys = {
  profile: ["profile"] as const,
};

//Il profilo dell'utente collegato: GET /api/me
export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: () => apiFetch<UserResponse>("/api/me"),
  });
}
