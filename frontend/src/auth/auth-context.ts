import { createContext, useContext } from "react";
import type { Session } from "@supabase/supabase-js";

//True finché non si sa se esiste una sessione attiva
export type AuthState = {
  loading: boolean;
  session: Session | null;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthState | null>(null);

//Sessione corrente
export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) {
    throw new Error("useAuth va usato dentro AuthProvider.");
  }
  return auth;
}
