import type { AuthError } from "@supabase/supabase-js";

//Un messaggio per ogni codice d'errore di Supabase Auth che l'utente può incontrare
const MESSAGES: Record<string, string> = {
  invalid_credentials: "Email o password non corretti. Controlla e riprova.",
  email_not_confirmed:
    "Devi ancora confermare l'email: controlla la posta e clicca il link che ti abbiamo inviato.",
  user_already_exists:
    "Esiste già un account con questa email. Prova ad accedere.",
  email_exists: "Esiste già un account con questa email. Prova ad accedere.",
  weak_password:
    "La password è troppo debole. Scegline una più lunga o più complessa.",
  over_request_rate_limit:
    "Troppi tentativi ravvicinati. Aspetta qualche minuto e riprova.",
  over_email_send_rate_limit:
    "Sono state inviate troppe email. Aspetta qualche minuto e riprova.",
  signup_disabled: "Le registrazioni sono temporaneamente chiuse.",
};

const GENERIC = "Qualcosa è andato storto. Riprova tra poco.";
const OFFLINE =
  "Impossibile contattare il server. Controlla la connessione e riprova.";

//Il messaggio da mostrare all'utente per un errore di Supabase Auth
export function authErrorMessage(error: AuthError): string {
  //Nessuna risposta dal servizio: rete assente o servizio irraggiungibile
  if (error.name === "AuthRetryableFetchError") {
    return OFFLINE;
  }

  return (error.code && MESSAGES[error.code]) || GENERIC;
}
