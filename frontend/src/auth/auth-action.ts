import type { AuthError } from "@supabase/supabase-js";
import { supabase } from "../api/supabase";
import { authErrorMessage } from "./errors";
import type { AuthFields, AuthMode } from "./validation";

//L'esito di un accesso o di una registrazione
export type AuthResult =
  | { status: "error"; message: string }
  | { status: "signed-in" }
  | { status: "confirm-email" };

//Esegue l'accesso o la registrazione con Supabase
export async function authenticate(
  mode: AuthMode,
  fields: AuthFields,
): Promise<AuthResult> {
  //Stessa regola del backend: l'email ha una sola forma
  const email = fields.email.trim().toLowerCase();

  if (mode === "login") {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: fields.password,
    });
    return error ? fail(error) : { status: "signed-in" };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password: fields.password,
    //il backend lo legge al primo accesso per creare il profilo
    options: { data: { full_name: fields.name.trim() } },
  });

  if (error) {
    return fail(error);
  }

  return data.session ? { status: "signed-in" } : { status: "confirm-email" };
}

function fail(error: AuthError): AuthResult {
  console.error("Errore di Supabase Auth:", error);
  return { status: "error", message: authErrorMessage(error) };
}

//Avvia l'accesso con Google: il browser lascia l'app e va sulla pagina di Google
//Restituisce un messaggio solo se non riesce a partire; se va bene, la pagina cambia e non serve altro
export async function signInWithGoogle(): Promise<string | null> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.origin },
  });

  if (error) {
    console.error("Errore di Supabase Auth:", error);
    return authErrorMessage(error);
  }

  return null;
}
