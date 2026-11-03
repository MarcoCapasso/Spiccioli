import { useState, type SubmitEvent } from "react";
import { errorMessage, fieldErrors } from "../api/client";
import { useAddVoucherTopUp } from "../api/queries";
import { formatMoney, parseAmount, todayIso } from "../format";
import { Alert } from "./Alert";
import { AmountInput } from "./AmountInput";
import { Button } from "./Button";
import { Field } from "./Field";
import { Input } from "./Input";
import { Modal } from "./Modal";
import { useToast } from "./toast-context";

//L'ordine dei campi
const FIELD_ORDER = ["amount", "date"] as const;

//Il massimo accettato dal backend
const MAX_AMOUNT = 999_999;

type VoucherTopUpModalProps = {
  onClose: () => void;
};

//La finestra per registrare una ricarica di credito
export function VoucherTopUpModal({ onClose }: VoucherTopUpModalProps) {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayIso());
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const add = useAddVoucherTopUp();
  const showToast = useToast();

  function focusField(name: string) {
    document.getElementById(`vt-${name}`)?.focus();
  }

  function handleError(error: unknown) {
    const fields = fieldErrors(error);
    const shown = FIELD_ORDER.filter((name) => fields[name]);

    if (shown.length > 0) {
      setErrors(fields);
      focusField(shown[0]);
    } else {
      setFormError(errorMessage(error));
    }
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const value = parseAmount(amount);
    const found: Record<string, string> = {};

    if (!(value > 0)) {
      found.amount = "Inserisci un importo maggiore di zero, ad esempio 150,00";
    } else if (value > MAX_AMOUNT) {
      found.amount = "Importo troppo alto";
    }
    if (!date) {
      found.date = "Scegli la data della ricarica";
    }

    setErrors(found);
    const firstInvalid = FIELD_ORDER.find((name) => found[name]);
    if (firstInvalid) {
      focusField(firstInvalid);
      return;
    }

    add.mutate(
      { amount: value, date },
      {
        onSuccess: (saved) => {
          showToast({
            kind: "success",
            title: "Ricarica registrata",
            message: `${formatMoney(saved.amount)} aggiunti al credito.`,
          });
          onClose();
        },
        onError: handleError,
      },
    );
  }

  return (
    <Modal
      title="Nuova ricarica"
      subtitle="Il credito che ti ha accreditato l'azienda."
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annulla
          </Button>
          <Button type="submit" form="vt-form" loading={add.isPending}>
            Registra ricarica
          </Button>
        </>
      }
    >
      <form id="vt-form" className="modal-form" onSubmit={handleSubmit} noValidate>
        {formError && <Alert variant="danger">{formError}</Alert>}

        <Field id="vt-amount" label="Importo" error={errors.amount}>
          <AmountInput
            id="vt-amount"
            value={amount}
            onChange={(next) => {
              setAmount(next);
              setErrors((current) => ({ ...current, amount: undefined }));
            }}
            tone="Income"
            invalid={!!errors.amount}
            autoFocus
          />
        </Field>

        <Field id="vt-date" label="Data" error={errors.date}>
          <Input
            id="vt-date"
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setErrors((current) => ({ ...current, date: undefined }));
            }}
            invalid={!!errors.date}
          />
        </Field>
      </form>
    </Modal>
  );
}
