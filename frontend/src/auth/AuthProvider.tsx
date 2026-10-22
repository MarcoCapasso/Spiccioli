import { useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { setAccessTokenProvider } from "../api/client";
import { supabase } from "../api/supabase";
import { AuthContext, type AuthState } from "./auth-context";

//Possione la sessione di Supabase e la passa a tutta l'app
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    //Il client dell'API chiede il token a Supabase, rinnova se è scaduto
    setAccessTokenProvider(async () => {
      const { data } = await supabase.auth.getSession();
      return data.session?.access_token ?? null;
    });

    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setLoading(false);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const value: AuthState = {
    loading,
    session,
    signOut: async () => {
      await supabase.auth.signOut();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
