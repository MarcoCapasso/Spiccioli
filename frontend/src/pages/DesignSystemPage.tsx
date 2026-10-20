import { useState } from "react";
import { getTheme, toggleTheme } from "../theme";
import "../styles/design-system.css";

//I token di colore da mostrare: nome leggibile e nome della variabile CSS
const COLOR_TOKENS = [
  { name: "Sfondo", token: "--bg" },
  { name: "Superficie", token: "--surface" },
  { name: "Superficie incassata", token: "--surface-sunk" },
  { name: "Panna profondo", token: "--panna-deep" },
  { name: "Primario", token: "--primary" },
  { name: "Primario hover", token: "--primary-h" },
  { name: "Secondario", token: "--secondary" },
  { name: "Testo", token: "--text" },
  { name: "Testo secondario", token: "--text-2" },
  { name: "Bordo", token: "--border" },
  { name: "Successo", token: "--success" },
  { name: "Pericolo", token: "--danger" },
];

//Pagina di sviluppo: tutti i token e i componenti, in tema chiaro e scuro
export function DesignSystemPage() {
  const [theme, setTheme] = useState(getTheme());

  return (
    <div className="ds-page">
      <div>
        <h1 className="t-h1">Sistema di design</h1>
        <p className="t-small">Componenti e stati riutilizzabili</p>
        <button onClick={() => setTheme(toggleTheme())}>
          {theme === "dark" ? "Passa al tema chiaro" : "Passa al tema scuro"}
        </button>
      </div>

      <section className="ds-section">
        <h2 className="t-h2">Colori</h2>
        <div className="ds-grid">
          {COLOR_TOKENS.map((color) => (
            <div className="swatch" key={color.token}>
              <i style={{ background: `var(${color.token})` }} />
              <div>
                <b>{color.name}</b>
                <br />
                <code>{color.token}</code>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="ds-section">
        <h2 className="t-h2">Tipografia</h2>
        <div className="t-display num">2.450,00 €</div>
        <div className="t-xs">Display · cifre tabellari per gli importi</div>
        <h1 className="t-h1">Titolo pagina</h1>
        <h2 className="t-h2">Titolo sezione</h2>
        <div className="t-label">Etichetta campo</div>
        <p style={{ margin: 0 }}>Testo di corpo per descrizioni e paragrafi.</p>
        <div className="t-small">Testo secondario per i metadati</div>
        <div className="t-xs">Testo minimo per date e dettagli</div>
      </section>
    </div>
  );
}
