import { useState, type SubmitEvent } from "react";
import { ApiError, errorMessage, fieldErrors } from "../api/client";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
} from "../api/queries";
import { CATEGORY_COLORS, CATEGORY_COLOR_NAMES } from "../palette";
import type { CategoryResponse, TransactionType } from "../types";
import { Alert } from "./Alert";
import { Button } from "./Button";
import { ColorPicker } from "./ColorPicker";
import { Field } from "./Field";
import { Input } from "./Input";
import { Modal } from "./Modal";
import { useToast } from "./toast-context";
import { TypeToggle } from "./TypeToggle";
import { colorName } from "../color";

type CategoryModalProps = {
  //Se c'è, la finestra modifica quella categoria
  //  altrimenti ne crea una nuova
  category?: CategoryResponse;
  onClose: () => void;
};

//La finestra per creare o modificare una categoria
export function CategoryModal({ category, onClose }: CategoryModalProps) {
  const categories = useCategories(true);
  const create = useCreateCategory();
  const update = useUpdateCategory();
  const showToast = useToast();

  const [name, setName] = useState(category?.name ?? "");
  const [type, setType] = useState<TransactionType>(
    category?.type ?? "Expense",
  );
  const [color, setColor] = useState(
    () =>
      category?.color ??
      CATEGORY_COLORS[(categories.data?.length ?? 0) % CATEGORY_COLORS.length],
  );
  const [nameError, setNameError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);

  const saving = create.isPending || update.isPending;

  function focusName(message: string) {
    setNameError(message);
    document.getElementById("cat-name")?.focus();
  }

  //Un nome già usato arriva come 409
  //  va sotto il campo, non in cima al modulo
  function handleError(error: unknown) {
    const fields = fieldErrors(error);

    if (fields.name) {
      focusName(fields.name);
    } else if (error instanceof ApiError && error.status === 409) {
      focusName(errorMessage(error));
    } else {
      setFormError(fields.color ?? errorMessage(error));
    }
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      focusName("Inserisci un nome");
      return;
    }

    const input = { name: name.trim(), color };
    const callbacks = {
      onSuccess: (saved: CategoryResponse) => {
        showToast({
          kind: "success",
          title: category ? "Categoria aggiornata" : "Categoria creata",
          message: saved.name,
        });
        onClose();
      },
      onError: handleError,
    };

    if (category) {
      update.mutate({ id: category.id, input }, callbacks);
    } else {
      create.mutate({ ...input, type }, callbacks);
    }
  }

  return (
    <Modal
      size="sm"
      title={category ? "Modifica categoria" : "Nuova categoria"}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annulla
          </Button>
          <Button type="submit" form="cat-form" loading={saving}>
            {category ? "Salva modifiche" : "Crea categoria"}
          </Button>
        </>
      }
    >
      <form
        id="cat-form"
        className="modal-form"
        onSubmit={handleSubmit}
        noValidate
      >
        {formError && <Alert variant="danger">{formError}</Alert>}

        {category ? (
          <p className="t-small" style={{ margin: 0 }}>
            Categoria di {category.type === "Income" ? "entrate" : "uscite"}: il
            tipo non si può cambiare.
          </p>
        ) : (
          <TypeToggle value={type} onChange={setType} />
        )}

        <Field id="cat-name" label="Nome" error={nameError}>
          <Input
            id="cat-name"
            autoFocus
            maxLength={50}
            placeholder="Es. Palestra"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setNameError(undefined);
            }}
            invalid={!!nameError}
          />
        </Field>

        <div className="field">
          <div className="row">
            <span className="t-label" id="cat-color-label">
              Colore
            </span>
            <span className="t-small" aria-live="polite">
              {CATEGORY_COLOR_NAMES[color] ?? `${colorName(color)} (personalizzato)`}
            </span>
          </div>
          <ColorPicker
            labelId="cat-color-label"
            value={color}
            onChange={setColor}
          />
        </div>
        
      </form>
    </Modal>
  );
}
