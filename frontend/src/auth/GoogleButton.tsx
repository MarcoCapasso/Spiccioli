import { useState } from "react";
import googleLogo from "../assets/google-g.svg";
import { Alert } from "../components/Alert";
import { Button } from "../components/Button";
import { signInWithGoogle } from "./auth-action";

//Il pulsante "Continua con Google": porta l'utente alla pagina di Google, da dove tornerà già collegato
export function GoogleButton() {
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    setRedirecting(true);
    const message = await signInWithGoogle();

    //Se è andato tutto bene il browser sta già lasciando la pagina: non c'è altro da fare
    if (message) {
      setRedirecting(false);
      setError(message);
    }
  }

  return (
    <div className="google-signin">
      <Button
        variant="secondary"
        block
        className="google-btn"
        disabled={redirecting}
        onClick={handleClick}
      >
        <img src={googleLogo} alt="" />
        <span className="google-btn-label">Continua con Google</span>
      </Button>
      {error && <Alert variant="danger">{error}</Alert>}
    </div>
  );
}
