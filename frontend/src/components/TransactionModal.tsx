import { useState, type SubmitEvent } from "react";
import { errorMessage, fieldErrors } from "../api/client";
import {
  useCategories,
  useCreateTransaction,
  useUpdateTransaction,
  type TransactionInput,
} from "../api/queries";
import { formatSigned, parseAmount, todayIso } from "../format";
import type { TransactionResponse, TransactionType } from "../types";
import { Alert } from "./Alert";
import { AmountInput } from "./AmountInput";
import { Button } from "./Button";
import { Field } from "./Field";
import { Input } from "./Input";
import { Modal } from "./Modal";
import { Select } from "./Select";
import { Textarea } from "./Textarea";
import { useToast } from "./toast-context";
import { TypeToggle } from "./TypeToggle";

//I campi del modulo
type FormState = {
  type: TransactionType;
  amount: string;
  description: string;
  categoryId: string;
  date: string;
  note: string;
};

//L'ordine dei campi
const FIELD_ORDER = [
  "amount",
  "description",
  "categoryId",
  "date",
  "note",
] as const;

//L'esempio nella descrizione cambia con il tipo di movimento
const DESCRIPTION_PLACEHOLDER: Record<TransactionType, string> = {
  Expense: "Es. Spesa al supermercato",
  Income: "Es. Stipendio di ottobre",
};

function initialForm(transaction?: TransactionResponse): FormState {
  if (!transaction) {
    return {
      type: "Expense",
      amount: "",
      description: "",
      categoryId: "",
      date: todayIso(),
      note: "",
    };
  }

  return {
    type: transaction.type,
    amount: transaction.amount.toFixed(2).replace(".", ","),
    description: transaction.description ?? "",
    categoryId: transaction.categoryId ? String(transaction.categoryId) : "",
    date: transaction.date,
    note: transaction.note ?? "",
  };
}

//Le regole di forma
function validate(form: FormState) {
  const errors: Record<string, string> = {};
  const amount = parseAmount(form.amount);

  if (!(amount > 0)) {
    errors.amount = "Inserisci un importo maggiore di zero, ad esempio 12,50";
  } else if (amount > 999_999_999) {
    errors.amount = "Importo troppo alto";
  }
  if (!form.categoryId) {
    errors.categoryId = "Scegli una categoria";
  }
  if (!form.date) {
    errors.date = "Scegli una data";
  }

  return errors;
}

type TransactionModalProps = {
  //Se c'è, la finestra modifica quel movimento; altrimenti ne crea uno nuovo
  transaction?: TransactionResponse;
  onClose: () => void;
};

//La finestra per creare o modificare un movimento
export function TransactionModal({
  transaction,
  onClose,
}: TransactionModalProps) {
  const [form, setForm] = useState(() => initialForm(transaction));
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const categories = useCategories();
  const create = useCreateTransaction();
  const update = useUpdateTransaction();
  const showToast = useToast();

  const saving = create.isPending || update.isPending;
  //Il backend accetta solo categorie dello stesso tipo del movimento
  const options = (categories.data ?? []).filter(
    (category) => category.type === form.type,
  );

  function setField(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function setType(type: TransactionType) {
    setForm((current) => ({ ...current, type, categoryId: "" }));
    setErrors((current) => ({ ...current, categoryId: undefined }));
  }

  function focusField(name: string) {
    document.getElementById(`tx-${name}`)?.focus();
  }

  //Gli errori del backend finiscono sotto il campo giusto; gli altri in cima al modulo
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

    const found = validate(form);
    setErrors(found);
    const firstInvalid = FIELD_ORDER.find((name) => found[name]);
    if (firstInvalid) {
      focusField(firstInvalid);
      return;
    }

    const input: TransactionInput = {
      amount: parseAmount(form.amount),
      date: form.date,
      type: form.type,
      categoryId: Number(form.categoryId),
      description: form.description.trim() || null,
      note: form.note.trim() || null,
    };

    const callbacks = {
      onSuccess: (saved: TransactionResponse) => {
        showToast({
          kind: "success",
          title: transaction
            ? "Modifiche salvate"
            : saved.type === "Income"
              ? "Entrata aggiunta"
              : "Uscita aggiunta",
          message: `${formatSigned(saved.amount, saved.type)} · ${saved.categoryName ?? "Senza categoria"}`,
        });
        onClose();
      },
      onError: handleError,
    };

    if (transaction) {
      update.mutate({ id: transaction.id, input }, callbacks);
    } else {
      create.mutate(input, callbacks);
    }
  }

  return (
    <Modal
      title={transaction ? "Modifica movimento" : "Nuovo movimento"}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annulla
          </Button>
          <Button type="submit" form="tx-form" loading={saving}>
            {transaction ? "Salva modifiche" : "Aggiungi movimento"}
          </Button>
        </>
      }
    >
      <form
        id="tx-form"
        className="modal-form"
        onSubmit={handleSubmit}
        noValidate
      >
        {formError && <Alert variant="danger">{formError}</Alert>}

        <TypeToggle value={form.type} onChange={setType} />

        <Field id="tx-amount" label="Importo" error={errors.amount}>
          <AmountInput
            id="tx-amount"
            autoFocus
            value={form.amount}
            onChange={(value) => setField("amount", value)}
            tone={form.type}
            invalid={!!errors.amount}
          />
        </Field>

        <Field
          id="tx-description"
          label="Descrizione"
          error={errors.description}
        >
          <Input
            id="tx-description"
            maxLength={200}
            placeholder={DESCRIPTION_PLACEHOLDER[form.type]}
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            invalid={!!errors.description}
          />
        </Field>

        <div className="grid-2">
          <Field
            id="tx-categoryId"
            label="Categoria"
            error={errors.categoryId}
            hint={
              options.length === 0 && categories.isSuccess
                ? "Non hai categorie di questo tipo."
                : undefined
            }
          >
            <Select
              id="tx-categoryId"
              value={form.categoryId}
              onChange={(e) => setField("categoryId", e.target.value)}
              invalid={!!errors.categoryId}
            >
              <option value="" disabled>
                Scegli una categoria
              </option>
              {options.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field id="tx-date" label="Data" error={errors.date}>
            <Input
              id="tx-date"
              type="date"
              value={form.date}
              onChange={(e) => setField("date", e.target.value)}
              invalid={!!errors.date}
            />
          </Field>
        </div>

        <Field id="tx-note" label="Nota (facoltativa)" error={errors.note}>
          <Textarea
            id="tx-note"
            rows={2}
            maxLength={240}
            placeholder="Aggiungi un dettaglio"
            value={form.note}
            onChange={(e) => setField("note", e.target.value)}
            invalid={!!errors.note}
          />
        </Field>
      </form>
    </Modal>
  );
}