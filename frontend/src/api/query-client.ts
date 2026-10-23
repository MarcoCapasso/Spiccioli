import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { ApiError } from "./client";
import { supabase } from "./supabase";

//Il backend ha rifiutato il token
function handleUnauthorized(error: Error) {
  if (error instanceof ApiError && error.status === 401) {
    void supabase.auth.signOut({ scope: "local" });
  }
}

//La cache dei dati del server
export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: handleUnauthorized }),
  mutationCache: new MutationCache({ onError: handleUnauthorized }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        //Un errore 4xx dipende dalla richiesta
        if (
          error instanceof ApiError &&
          error.status >= 400 &&
          error.status < 500
        ) {
          return false;
        }
        //Rete assente o errore 5xx
        return failureCount < 2;
      },
    },
  },
});
