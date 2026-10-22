import { useState, type SubmitEvent } from "react";
import { Alert } from "../components/Alert";
import { Button } from "../components/Button";
import { Field } from "../components/Field";
import { Input } from "../components/Input";
import { PasswordInput } from "../components/PasswordInput";
import {
  FIELD_ORDER,
  validateAuth,
  type AuthErrors,
  type AuthFields,
  type AuthMode,
} from "./validation";

const EMPTY_FIELDS: AuthFields = {
  name: "",
  email: "",
  password: "",
  confirm: "",
};

type AuthFormProps = {
  mode: AuthMode;
  //Esegue l'accesso o la registrazione
  onSubmit: (mode: AuthMode, fields: AuthFields) => Promise<string | null>;
};

//Il modulo di accesso e di registrazione
export function AuthForm({ mode, onSubmit }: AuthFormProps) {
  const [fields, setFields] = useState<AuthFields>(EMPTY_FIELDS);
  const [errors, setErrors] = useState<AuthErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const isRegister = mode === "register";

  //Aggiorna un campo e toglie il suo errore
  function update(field: keyof AuthFields, value: string) {
    setFields((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const found = validateAuth(mode, fields);
    setErrors(found);

    //Se c'è un errore il cursore lo rileva
    const firstInvalid = FIELD_ORDER.find((field) => found[field]);
    if (firstInvalid) {
      document.getElementById(`auth-${firstInvalid}`)?.focus();
      return;
    }

    setSubmitting(true);
    const error = await onSubmit(mode, fields);
    setSubmitting(false);
    setFormError(error);
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      {formError && <Alert variant="danger">{formError}</Alert>}

      {isRegister && (
        <Field id="auth-name" label="Nome" error={errors.name}>
          <Input
            id="auth-name"
            value={fields.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Mario Rossi"
            autoComplete="name"
            invalid={!!errors.name}
          />
        </Field>
      )}

      <Field id="auth-email" label="Email" error={errors.email}>
        <Input
          id="auth-email"
          type="email"
          value={fields.email}
          onChange={(e) => update("email", e.target.value)}
          placeholder="nome@esempio.it"
          autoComplete="email"
          invalid={!!errors.email}
        />
      </Field>

      <Field id="auth-password" label="Password" error={errors.password}>
        <PasswordInput
          id="auth-password"
          value={fields.password}
          onChange={(e) => update("password", e.target.value)}
          placeholder={isRegister ? "Almeno 8 caratteri" : "La tua password"}
          autoComplete={isRegister ? "new-password" : "current-password"}
          invalid={!!errors.password}
        />
      </Field>

      {isRegister && (
        <Field
          id="auth-confirm"
          label="Conferma password"
          error={errors.confirm}
        >
          <PasswordInput
            id="auth-confirm"
            value={fields.confirm}
            onChange={(e) => update("confirm", e.target.value)}
            placeholder="Ripeti la password"
            autoComplete="new-password"
            invalid={!!errors.confirm}
          />
        </Field>
      )}

      <Button type="submit" size="lg" block loading={submitting}>
        {submitting
          ? isRegister
            ? "Creazione account…"
            : "Accesso…"
          : isRegister
            ? "Crea account"
            : "Accedi"}
      </Button>
    </form>
  );
}
