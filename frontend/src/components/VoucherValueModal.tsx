import { useState, type SubmitEvent } from "react";
import { errorMessage, fieldErrors } from "../api/client";
import { useSetVoucherValue } from "../api/queries";
import { formatMoney, parseAmount } from "../format";
import { Alert } from "./Alert";
import { AmountInput } from "./AmountInput";
import { Button } from "./Button";
import { Field } from "./Field";
import { Modal } from "./Modal";
import { useToast } from "./toast-context";

//I tagli più comuni dei buoni pasto
const PRESETS = [5, 7, 8];

//Il valore massimo accettato dal backend
const MAX_VALUE = 1000;

type VoucherValueModalProps = {
  //Il valore attuale, null se non è ancora stato impostato
  current: number | null;
  onClose: () => void;
};

//La finestra per impostare o cambiare il valore di un buono
export function VoucherValueModal({ current, onClose }: VoucherValueModalProps) {
  //Un valore già impostato che non è tra i classici riapre direttamente "Altro"
  const customStart = current !== null && !PRESETS.includes(current) ? current : null;

  const [preset, setPreset] = useState<number | "custom" | null>(
    customStart !== null ? "custom" : current,
  );
  const [custom, setCustom] = useState(
    customStart !== null ? customStart.toFixed(2).replace(".", ",") : "",
  );
  const [error, setError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);

  const setValue = useSetVoucherValue();
  const showToast = useToast();

  function choose(next: number | "custom") {
    setPreset(next);
    setError(undefined);
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const value = preset === "custom" ? parseAmount(custom) : preset;

    if (value === null) {
      setError("Scegli il valore del tuo buono");
      return;
    }
    if (!(value > 0)) {
      setError("Inserisci un valore maggiore di zero, ad esempio 7,50");
      return;
    }
    if (value > MAX_VALUE) {
      setError("Valore troppo alto");
      return;
    }

    setValue.mutate(value, {
      onSuccess: () => {
        showToast({
          kind: "success",
          title: "Valore del buono salvato",
          message: `Ogni buono vale ${formatMoney(value)}. Gli usi passati non cambiano.`,
        });
        onClose();
      },
      onError: (e) => {
        const fields = fieldErrors(e);
        if (fields.value) {
          setError(fields.value);
        } else {
          setFormError(errorMessage(e));
        }
      },
    });
  }

  return (
    <Modal
      title="Valore del buono"
      subtitle="Quanto vale un singolo buono pasto."
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annulla
          </Button>
          <Button type="submit" form="vv-form" loading={setValue.isPending}>
            Salva
          </Button>
        </>
      }
    >
      <form id="vv-form" className="modal-form" onSubmit={handleSubmit} noValidate>
        {formError && <Alert variant="danger">{formError}</Alert>}

        <Field id="vv-chips" label="Valore di un buono" error={error}>
          <div className="voucher-chips" role="group" aria-label="Valore di un buono">
            {PRESETS.map((value) => (
              <button
                key={value}
                type="button"
                className={preset === value ? "voucher-chip on" : "voucher-chip"}
                aria-pressed={preset === value}
                onClick={() => choose(value)}
              >
                {formatMoney(value)}
              </button>
            ))}
            <button
              type="button"
              className={preset === "custom" ? "voucher-chip on" : "voucher-chip"}
              aria-pressed={preset === "custom"}
              onClick={() => choose("custom")}
            >
              Altro
            </button>
          </div>
        </Field>

        {preset === "custom" && (
          <Field id="vv-custom" label="Importo del buono">
            <AmountInput
              id="vv-custom"
              value={custom}
              onChange={(next) => {
                setCustom(next);
                setError(undefined);
              }}
              tone="Expense"
              invalid={!!error}
              autoFocus
            />
          </Field>
        )}
      </form>
    </Modal>
  );
}
