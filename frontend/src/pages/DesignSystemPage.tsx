import { useState } from "react";
import type { TransactionType, UserResponse } from "../types";
import { AmountInput } from "../components/AmountInput";
import { Badge, TransactionTypeBadge } from "../components/Badge";
import { Button } from "../components/Button";
import { Card, CardHeader } from "../components/Card";
import { ConfirmModal } from "../components/ConfirmModal";
import { apiFetch, ApiError, errorMessage } from "../api/client";
import { EmptyState } from "../components/States";
import { ErrorState } from "../components/States";
import { Field } from "../components/Field";
import { Icon, type IconName } from "../components/Icon";
import { IconButton } from "../components/IconButton";
import { Input } from "../components/Input";
import { Modal } from "../components/Modal";
import { Select } from "../components/Select";
import { Textarea } from "../components/Textarea";
import { TypeToggle } from "../components/TypeToggle";

import { Skeleton } from "../components/States";
import { useToast } from "../components/toast-context";

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

//Le icone da mostrare nella pagina
const DEMO_ICONS: IconName[] = [
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
];

//Una griglia di campi, ognuno largo almeno 250px
const FIELDS_GRID = {
  gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
};

//Pagina di sviluppo
export function DesignSystemPage() {
  //Stati delle prove interattive
  const [demoText, setDemoText] = useState("");
  const [demoAmount, setDemoAmount] = useState("");
  const [demoType, setDemoType] = useState<TransactionType>("Expense");
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const showToast = useToast();

  //Prova: legge il profilo dall'API, con il tipo del DTO
  async function tryApi() {
    try {
      const user = await apiFetch<UserResponse>("/api/me");
      showToast({
        kind: "success",
        title: `Ciao, ${user.firstName}`,
        message: user.email,
      });
    } catch (error) {
      const status = error instanceof ApiError ? ` (${error.status})` : "";
      showToast({
        kind: "error",
        title: `Richiesta non riuscita${status}`,
        message: errorMessage(error),
      });
    }
  }

  return (
    <div className="ds-page">

      {/* ───────────── Fondamenta ───────────── */}
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
        <Card padded>
          <div className="stack" style={{ gap: 10 }}>
            <div className="t-display num">2.450,00 €</div>
            <div className="t-xs">
              Display · cifre tabellari per gli importi
            </div>
            <h1 className="t-h1">Titolo pagina</h1>
            <h2 className="t-h2">Titolo sezione</h2>
            <div className="t-label">Etichetta campo</div>
            <p style={{ margin: 0 }}>
              Testo di corpo per descrizioni e paragrafi.
            </p>
            <div className="t-small">Testo secondario per i metadati</div>
            <div className="t-xs">Testo minimo per date e dettagli</div>
          </div>
        </Card>
      </section>

      <section className="ds-section">
        <h2 className="t-h2">Icone</h2>
        <div className="row">
          {DEMO_ICONS.map((name) => (
            <Icon key={name} name={name} className="ds-icon" />
          ))}
        </div>
      </section>

      {/* ───────────── Componenti di base ───────────── */}
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
          <IconButton icon="edit" label="Modifica" />
          <IconButton icon="trash" label="Elimina" danger />
        </div>
      </section>

      <section className="ds-section">
        <h2 className="t-h2">Badge</h2>
        <div className="row">
          <TransactionTypeBadge type="Income" />
          <TransactionTypeBadge type="Expense" />
          <Badge variant="neutral">Neutro</Badge>
          <Badge variant="primary">In evidenza</Badge>
        </div>
      </section>

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

      {/* ───────────── Moduli ───────────── */}
      <section className="ds-section">
        <h2 className="t-h2">Campi</h2>
        <div className="ds-grid" style={FIELDS_GRID}>
          <Field
            id="ds-text"
            label="Testo"
            hint="Un suggerimento sotto il campo"
          >
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
            <Textarea
              id="ds-note"
              placeholder="Aggiungi un dettaglio"
              rows={2}
            />
          </Field>
        </div>
      </section>

      <section className="ds-section">
        <h2 className="t-h2">Importo e tipo</h2>
        <div className="ds-grid" style={FIELDS_GRID}>
          <Field id="ds-amount" label="Importo">
            <AmountInput
              id="ds-amount"
              value={demoAmount}
              onChange={setDemoAmount}
              tone={demoType}
            />
          </Field>
          <div className="field">
            <span className="t-label">Tipo</span>
            <TypeToggle value={demoType} onChange={setDemoType} />
          </div>
        </div>
      </section>

      {/* ───────────── Finestre ───────────── */}
      <section className="ds-section">
        <h2 className="t-h2">Finestre e Notifiche</h2>
        <div className="row">
          <Button variant="secondary" onClick={() => setModalOpen(true)}>
            Apri una finestra
          </Button>
          <Button variant="secondary" onClick={() => setConfirmOpen(true)}>
            Finestra di conferma
          </Button>
        </div>
      </section>

      <Button variant="secondary" onClick={tryApi}>
        Prova l'API
      </Button>

      {modalOpen && (
        <Modal
          title="Nuovo movimento"
          onClose={() => setModalOpen(false)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setModalOpen(false)}>
                Annulla
              </Button>
              <Button onClick={() => setModalOpen(false)}>
                Aggiungi movimento
              </Button>
            </>
          }
        >
          <Field id="ds-modal-title" label="Descrizione">
            <Input
              id="ds-modal-title"
              placeholder="Es. Spesa al supermercato"
            />
          </Field>
        </Modal>
      )}

      {confirmOpen && (
        <ConfirmModal
          title="Eliminare questo movimento?"
          confirmLabel="Elimina movimento"
          onConfirm={() => setConfirmOpen(false)}
          onClose={() => setConfirmOpen(false)}
        >
          <b style={{ color: "var(--text)" }}>Esselunga</b> (−68,40 €, 12 ott)
          verrà rimosso dallo storico e dai totali.
        </ConfirmModal>
      )}

      <div className="row">
        <Button
          variant="secondary"
          onClick={() =>
            showToast({
              kind: "success",
              title: "Uscita aggiunta",
              message: "−24,90 € · Spesa alimentare",
            })
          }
        >
          Notifica di successo
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            showToast({
              kind: "error",
              title: "Modifiche non salvate",
              message: "Controlla la connessione e riprova.",
            })
          }
        >
          Notifica d'errore
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            showToast({
              kind: "info",
              title: "Movimento eliminato",
              action: {
                label: "Annulla",
                run: () =>
                  showToast({
                    kind: "success",
                    title: "Movimento ripristinato",
                  }),
              },
            })
          }
        >
          Notifica con azione
        </Button>
      </div>

      <section className="ds-section">
        <h2 className="t-h2">Stati</h2>
        <div
          className="ds-grid"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          }}
        >
          <Card>
            <EmptyState
              title="Nessun movimento ancora"
              text="Aggiungi la tua prima entrata o uscita: la panoramica si riempirà da sola."
              actions={
                <Button size="sm" icon="plus">
                  Aggiungi movimento
                </Button>
              }
            />
          </Card>
          <Card>
            <EmptyState
              illustration="categories"
              title="Nessuna categoria"
              text="Creane una per organizzare le spese."
            />
          </Card>
          <Card>
            <EmptyState
              illustration="search"
              title="Nessun risultato"
              text="Prova a cambiare i filtri o azzerali."
            />
          </Card>
          <Card>
            <ErrorState
              onRetry={() =>
                showToast({ kind: "info", title: "Nuovo tentativo in corso" })
              }
            />
          </Card>
          <Card padded>
            <div className="stack" style={{ gap: 12 }}>
              <Skeleton width={140} />
              <Skeleton height={40} radius={12} />
              <Skeleton width="55%" />
              <Skeleton width="30%" height={10} />
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
