import { Icon, type IconName } from "../components/Icon";
import { IconButton } from "../components/IconButton";
import { ThemeToggle } from "../components/ThemeToggle";
import { Button } from "../components/Button";
import { Badge, TransactionTypeBadge } from "../components/Badge";
import { Card, CardHeader } from "../components/Card";
import { Input } from "../components/Input";
import { Field } from "../components/Field";
import { Select } from "../components/Select";
import { Textarea } from "../components/Textarea";
import { AmountInput } from "../components/AmountInput";
import type { TransactionType } from "../types";
import { TypeToggle } from "../components/TypeToggle";
import { useState } from "react";
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
  const [demoText, setDemoText] = useState("");
  const [demoAmount, setDemoAmount] = useState("");
  const [demoType, setDemoType] = useState<TransactionType>("Expense");

  return (
    <div className="ds-page">
      <div>
        <h1 className="t-h1">Sistema di design</h1>
        <p className="t-small">Componenti e stati riutilizzabili</p>
        <div className="row">
          <IconButton icon="edit" label="Modifica" />
          <IconButton icon="trash" label="Elimina" danger />
          <ThemeToggle />
        </div>
      </div>

      <div>
        <section className="ds-section">
          <h2 className="t-h2">Icone</h2>
          <div className="row">
            {(
              [
                "home",
                "list",
                "tag",
                "plus",
                "edit",
                "trash",
                "search",
                "wallet",
                "coin",
                "sun",
                "moon",
                "check",
                "alert",
                "info",
              ] as IconName[]
            ).map((name) => (
              <Icon key={name} name={name} className="ds-icon" />
            ))}
          </div>
        </section>
      </div>

      <div
        className="ds-grid"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))" }}
      >
        <Field id="ds-text" label="Testo" hint="Un suggerimento sotto il campo">
          <Input
            id="ds-text"
            value={demoText}
            onChange={(e) => setDemoText(e.target.value)}
            placeholder="Es. Spesa al mercato"
          />
        </Field>
        <Field
          id="ds-error"
          label="Con errore"
          error="Inserisci un importo valido"
        >
          <Input id="ds-error" invalid defaultValue="abc" />
        </Field>
        <Field id="ds-disabled" label="Disabilitato">
          <Input id="ds-disabled" disabled defaultValue="Non modificabile" />
        </Field>
        <Field id="ds-search" label="Con icona">
          <Input
            id="ds-search"
            icon="search"
            placeholder="Cerca per titolo o nota"
          />
        </Field>
      </div>

      <div>
        <Field id="ds-select" label="Categoria">
          <Select id="ds-select" defaultValue="">
            <option value="" disabled>
              Scegli una categoria
            </option>
            <option value="1">Alimentari</option>
            <option value="2">Casa</option>
            <option value="3">Trasporti</option>
          </Select>
        </Field>
        <Field id="ds-date" label="Data">
          <Input id="ds-date" type="date" />
        </Field>
        <Field id="ds-note" label="Nota">
          <Textarea id="ds-note" placeholder="Aggiungi un dettaglio" rows={2} />
        </Field>
      </div>

      <div>
        <Field id="ds-amount" label="Importo">
          <AmountInput
            id="ds-amount"
            value={demoAmount}
            onChange={setDemoAmount}
            tone={demoType}
          />
        </Field>
        <TypeToggle value={demoType} onChange={setDemoType} />
      </div>

      <div>
        <section className="ds-section">
          <h2 className="t-h2">Card</h2>
          <div className="row" style={{ alignItems: "stretch" }}>
            <Card padded>
              <h3 className="t-h3">Card semplice</h3>
              <p className="t-small">Con la spaziatura standard.</p>
            </Card>
            <Card>
              <CardHeader
                title="Movimenti recenti"
                action={<button className="card-link">Vedi tutti</button>}
              />
              <p
                className="t-small"
                style={{ padding: "0 20px 20px", margin: 0 }}
              >
                Il contenuto gestisce la sua spaziatura.
              </p>
            </Card>
          </div>
        </section>
      </div>

      <div>
        <section className="ds-section">
          <h2 className="t-h2">Pulsanti</h2>
          <div className="row">
            <Button icon="plus">Primario</Button>
            <Button variant="secondary">Secondario</Button>
            <Button variant="dark">Scuro</Button>
            <Button variant="danger" icon="trash">
              Elimina
            </Button>
            <Button variant="ghost">Ghost</Button>
            <Button disabled>Disabilitato</Button>
            <Button loading>Salvataggio…</Button>
          </div>
          <div className="row">
            <Button size="sm">Piccolo</Button>
            <Button>Medio</Button>
            <Button size="lg">Grande</Button>
          </div>
        </section>
      </div>

      <div>
        <section className="ds-section">
          <h2 className="t-h2">Badge</h2>
          <div className="row">
            <TransactionTypeBadge type="Income" />
            <TransactionTypeBadge type="Expense" />
            <Badge variant="neutral">Neutro</Badge>
            <Badge variant="primary">In evidenza</Badge>
          </div>
        </section>
      </div>

      <div>
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
      </div>

      <div>
        <section className="ds-section">
          <h2 className="t-h2">Tipografia</h2>
          <div className="t-display num">2.450,00 €</div>
          <div className="t-xs">Display · cifre tabellari per gli importi</div>
          <h1 className="t-h1">Titolo pagina</h1>
          <h2 className="t-h2">Titolo sezione</h2>
          <div className="t-label">Etichetta campo</div>
          <p style={{ margin: 0 }}>
            Testo di corpo per descrizioni e paragrafi.
          </p>
          <div className="t-small">Testo secondario per i metadati</div>
          <div className="t-xs">Testo minimo per date e dettagli</div>
        </section>
      </div>
    </div>
  );
}
