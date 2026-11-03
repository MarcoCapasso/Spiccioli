import { useState, type SubmitEvent } from "react";
import { errorMessage, fieldErrors } from "../api/client";
import { useAddVoucherUsage } from "../api/queries";
import { formatMoney, todayIso } from "../format";
import type { VoucherSummaryResponse } from "../types";
import { voucherLabel } from "../vouchers";
import { Alert } from "./Alert";
import { Button } from "./Button";
import { Field } from "./Field";
import { Input } from "./Input";
import { Modal } from "./Modal";
import { useToast } from "./toast-context";

//L'ordine dei campi
const FIELD_ORDER = ["count", "date", "note"] as const;

type VoucherUseModalProps = {
  summary: VoucherSummaryResponse;
  onClose: () => void;
};

//La finestra per registrare i buoni usati: si sceglie il numero, il resto lo calcola l'app
export function VoucherUseModal({ summary, onClose }: VoucherUseModalProps) {
  const { unitValue, remainingVouchers } = summary;

  const [count, setCount] = useState("1");
  const [date, setDate] = useState(todayIso());
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const add = useAddVoucherUsage();
  const showToast = useToast();

  const parsed = Number(count);
  const validCount = count !== "" && Number.isInteger(parsed) && parsed >= 1;

  function clearError(field: string) {
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  //I pulsanti − e +: il numero resta tra 1 e i buoni disponibili
  function step(delta: number) {
    const base = validCount ? parsed : 1;
    const next = Math.min(Math.max(1, base + delta), Math.max(1, remainingVouchers));
    setCount(String(next));
    clearError("count");
  }

  function focusField(name: string) {
    document.getElementById(`vu-${name}`)?.focus();
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

    const found: Record<string, string> = {};

    if (!validCount) {
      found.count = "Inserisci quanti buoni hai usato, almeno 1";
    } else if (parsed > remainingVouchers) {
      found.count =
        remainingVouchers === 0
          ? "Il credito è finito"
          : `Ti restano solo ${voucherLabel(remainingVouchers)}`;
    }
    if (!date) {
      found.date = "Scegli la data";
    }

    setErrors(found);
    const firstInvalid = FIELD_ORDER.find((name) => found[name]);
    if (firstInvalid) {
      focusField(firstInvalid);
      return;
    }

    add.mutate(
      { count: parsed, date, note: note.trim() || null },
      {
        onSuccess: (saved) => {
          showToast({
            kind: "success",
            title: "Buoni registrati",
            message: `${voucherLabel(saved.count)} · ${formatMoney(saved.total)} scalati dal credito.`,
          });
          onClose();
        },
        onError: handleError,
      },
    );
  }

  //L'anteprima: quanto vale l'uso e quanti buoni restano dopo
  const total = validCount && unitValue !== null ? Math.round(parsed * unitValue * 100) / 100 : null;

  return (
    <Modal
      title="Usa buoni"
      subtitle="Scegli quanti buoni hai usato: il credito si scala da solo."
      onClose={onClose}
      initialFocusId="vu-count"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annulla
          </Button>
          <Button type="submit" form="vu-form" loading={add.isPending}>
            Registra
          </Button>
        </>
      }
    >
      <form id="vu-form" className="modal-form" onSubmit={handleSubmit} noValidate>
        {formError && <Alert variant="danger">{formError}</Alert>}

        <Field id="vu-count" label="Numero di buoni" error={errors.count}>
          <div className="voucher-stepper">
            <Button variant="secondary" aria-label="Un buono in meno" onClick={() => step(-1)}>
              −
            </Button>
            <Input
              id="vu-count"
              inputMode="numeric"
              autoComplete="off"
              value={count}
              onChange={(e) => {
                setCount(e.target.value.replace(/\D/g, ""));
                clearError("count");
              }}
              invalid={!!errors.count}
            />
            <Button variant="secondary" aria-label="Un buono in più" onClick={() => step(1)}>
              +
            </Button>
          </div>
        </Field>

        {total !== null && unitValue !== null && (
          <div className="voucher-preview">
            {parsed} × {formatMoney(unitValue)} = <b>{formatMoney(total)}</b>
            {parsed <= remainingVouchers && <> · dopo ti restano {voucherLabel(remainingVouchers - parsed)}</>}
          </div>
        )}

        <Field id="vu-date" label="Data" error={errors.date}>
          <Input
            id="vu-date"
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              clearError("date");
            }}
            invalid={!!errors.date}
          />
        </Field>

        <Field id="vu-note" label="Nota (facoltativa)" error={errors.note}>
          <Input
            id="vu-note"
            placeholder="Es. Pranzo con i colleghi"
            maxLength={240}
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
              clearError("note");
            }}
            invalid={!!errors.note}
          />
        </Field>
      </form>
    </Modal>
  );
}
