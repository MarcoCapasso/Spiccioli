import type { ReactNode } from 'react';
import { Icon } from './Icon';
import { errorIdFor } from './field-ids';


type FieldProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
};

//Etichetta, controllo e messaggi: avvolge un campo di testo, un menu a tendina o il campo dell'importo
export function Field({ id, label, hint, error, children }: FieldProps) {
  return (
    <div className="field">
      <label className="t-label" htmlFor={id}>{label}</label>
      {children}
      {hint && !error && <div className="field-hint">{hint}</div>}
      {error && (
        <div className="field-error" id={errorIdFor(id)}>
          <Icon name="alert" />
          {error}
        </div>
      )}
    </div>
  );
}