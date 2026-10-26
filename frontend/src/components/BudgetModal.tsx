import { useState, type SubmitEvent } from 'react';
import { errorMessage, fieldErrors } from '../api/client';
import { useUpdateBudget } from '../api/queries';
import { formatMonth, parseAmount } from '../format';
import { Alert } from './Alert';
import { AmountInput } from './AmountInput';
import { Button } from './Button';
import { Field } from './Field';
import { Modal } from './Modal';
import { useToast } from './toast-context';

export type BudgetField = 'plannedIncome' | 'savingsTarget';

type BudgetModalProps = {
  year: number;
  month: number;
  plannedIncome: number;
  savingsTarget: number;
  onClose: () => void;
  focus?: BudgetField;
};

//Un importo come testo per il campo
function toField(value: number) {
  return value > 0 ? value.toFixed(2).replace('.', ',') : '';
}
const FIELD_ORDER = ['plannedIncome', 'savingsTarget'] as const;

//La finestra per le entrate previste e l'obiettivo di risparmio del mese
export function BudgetModal({ year, month, plannedIncome, savingsTarget, focus='plannedIncome', onClose }: BudgetModalProps) {
  const [income, setIncome] = useState(() => toField(plannedIncome));
  const [savings, setSavings] = useState(() => toField(savingsTarget));
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const update = useUpdateBudget();
  const showToast = useToast();

  function focusField(name: string) {
    document.getElementById(`bu-${name}`)?.focus();
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    //Un campo vuoto vale zero: nessuna entrata prevista, nessun obiettivo
    const incomeValue = income.trim() === '' ? 0 : parseAmount(income);
    const savingsValue = savings.trim() === '' ? 0 : parseAmount(savings);

    const found: Record<string, string> = {};
    if (!(incomeValue >= 0)) {
      found.plannedIncome = 'Inserisci un importo, ad esempio 1.800,00';
    }
    if (!(savingsValue >= 0)) {
      found.savingsTarget = 'Inserisci un importo, ad esempio 300,00';
    }
    setErrors(found);
    const first = FIELD_ORDER.find((name) => found[name]);
    if (first) {
      focusField(first);
      return;
    }

    update.mutate(
      { year, month, input: { plannedIncome: incomeValue, savingsTarget: savingsValue } },
      {
        onSuccess: () => {
          showToast({ kind: 'success', title: 'Piano aggiornato', message: formatMonth(year, month) });
          onClose();
        },
        onError: (error) => {
          //Gli errori del backend finiscono sotto il campo giusto; gli altri in cima al modulo
          const fields = fieldErrors(error);
          const shown = FIELD_ORDER.filter((name) => fields[name]);
          if (shown.length > 0) {
            setErrors(fields);
            focusField(shown[0]);
          } else {
            setFormError(errorMessage(error));
          }
        },
      },
    );
  }

  return (
    <Modal
      size="sm"
      title="Entrate e risparmio"
      subtitle={formatMonth(year, month)}
      initialFocusId={`bu-${focus}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annulla
          </Button>
          <Button type="submit" form="bu-form" loading={update.isPending}>
            Salva
          </Button>
        </>
      }
    >
      <form id="bu-form" className="modal-form" onSubmit={handleSubmit} noValidate>
        {formError && <Alert variant="danger">{formError}</Alert>}

        <Field id="bu-plannedIncome" label="Entrate previste" error={errors.plannedIncome}>
          <AmountInput
            id="bu-plannedIncome"
            value={income}
            onChange={(value) => {
              setIncome(value);
              setErrors((current) => ({ ...current, plannedIncome: undefined }));
            }}
            tone="Income"
            invalid={!!errors.plannedIncome}
          />
        </Field>

        <Field
          id="bu-savingsTarget"
          label="Obiettivo di risparmio"
          error={errors.savingsTarget}
          hint="Il risparmio si toglie dalle entrate: il resto lo assegni alle categorie."
        >
          <AmountInput
            id="bu-savingsTarget"
            value={savings}
            onChange={(value) => {
              setSavings(value);
              setErrors((current) => ({ ...current, savingsTarget: undefined }));
            }}
            tone="Income"
            invalid={!!errors.savingsTarget}
          />
        </Field>
      </form>
    </Modal>
  );
}