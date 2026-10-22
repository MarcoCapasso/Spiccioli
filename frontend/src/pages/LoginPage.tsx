import { useState } from "react";
import { authenticate } from "../auth/auth-action";
import { AuthForm } from "../auth/AuthForm";
import type { AuthFields, AuthMode } from "../auth/validation";
import { Alert } from "../components/Alert";
import { Brand } from "../components/Brand";
import { GoogleButton } from "../auth/GoogleButton";
import { ThemeToggle } from "../components/ThemeToggle";

//La schermata di accesso
// il pannello di benvenuto a sinistra, il modulo a destra
export function LoginPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [notice, setNotice] = useState<string | null>(null);
  const isRegister = mode === "register";

  //Cambia modalità e toglie l'avviso, che riguardava l'operazione precedente
  function switchMode() {
    setNotice(null);
    setMode(isRegister ? "login" : "register");
  }

  //Esegue l'operazione
  //  restituisce il messaggio d'errore da mostrare nel modulo, o null
  async function handleSubmit(
    submitMode: AuthMode,
    fields: AuthFields,
  ): Promise<string | null> {
    const result = await authenticate(submitMode, fields);

    if (result.status === "error") {
      return result.message;
    }

    if (result.status === "confirm-email") {
      //Lo stesso messaggio vale per un indirizzo nuovo e per uno già registrato
      setNotice(
        "Se l'indirizzo non era già registrato, ti abbiamo inviato un'email di conferma. " +
          "Clicca il link che contiene, poi accedi qui. Controlla anche la cartella spam.",
      );
      setMode("login");
    }

    return null;
  }

  return (
    <div className="auth">
      <section className="auth-side">
        <Brand />
        <div>
          <h2>Sai sempre dove vanno i tuoi soldi.</h2>
          <p>
            Registra una spesa in pochi secondi, guarda entrate e uscite a colpo
            d'occhio, organizza tutto per categoria.
          </p>
          <div className="auth-mock" aria-hidden="true">
            <div className="mock-row">
              <div className="mock-ico mock-ico-inc">S</div>
              <div>
                <div className="mock-title">Stipendio</div>
                <div className="t-xs">Oggi</div>
              </div>
              <div className="mock-amt mock-amt-inc num">+2.450,00 €</div>
            </div>
            <div className="mock-row">
              <div className="mock-ico mock-ico-exp">S</div>
              <div>
                <div className="mock-title">Supermercato</div>
                <div className="t-xs">Ieri</div>
              </div>
              <div className="mock-amt mock-amt-exp num">−68,40 €</div>
            </div>
          </div>
        </div>
        <div className="coin-deco" aria-hidden="true" />
      </section>

      <section className="auth-main">
        <div className="auth-theme">
          <ThemeToggle />
        </div>
        <div className="auth-card">
          <Brand />
          <h1 className="t-h1 auth-title">
            {isRegister ? "Crea il tuo account" : "Bentornato"}
          </h1>
          <p className="muted auth-subtitle">
            {isRegister
              ? "Ci vuole meno di un minuto."
              : "Accedi per vedere i tuoi conti."}
          </p>

          {notice && (
            <div className="auth-notice">
              <Alert variant="info">{notice}</Alert>
            </div>
          )}

          <AuthForm key={mode} mode={mode} onSubmit={handleSubmit} />

          <div className="auth-divider" aria-hidden="true">
            oppure
          </div>
          <GoogleButton />

          <p className="t-small auth-switch">
            {isRegister ? "Hai già un account?" : "Non hai un account?"}{" "}
            <button type="button" className="switch-link" onClick={switchMode}>
              {isRegister ? "Accedi" : "Registrati"}
            </button>
          </p>
        </div>
      </section>
    </div>
  );
}
