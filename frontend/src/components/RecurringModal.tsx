import { useState, type SubmitEvent } from 'react';
import { errorMessage, fieldErrors } from '../api/client';
import {
  useCategories,
  useCreateRecurringExpense,
  useUpdateRecurringExpense,
  type RecurringExpenseInput,
} from '../api/queries';
import { parseAmount, todayIso } from '../format';
import { FREQUENCIES, FREQUENCY_LABELS } from '../recurrence';
import type { RecurrenceFrequency, RecurringExpenseResponse } from '../types';
import { Alert } from './Alert';
import { AmountInput } from './AmountInput';
import { Button } from './Button';
import { Field } from './Field';
import { Input } from './Input';
import { Modal } from './Modal';
import { Select } from './Select';
import { useToast } from './toast-context';

//I campi del modulo
type FormState = {
  name: string;
  amount: string;
  frequency: RecurrenceFrequency;
  categoryId: string;
  startDate: string;
  endDate: string;
};

//L'ordine dei campi
const FIELD_ORDER = ['name', 'amount', 'frequency', 'categoryId', 'startDate', 'endDate'] as const;

function initialForm(expense?: RecurringExpenseResponse): FormState {
  if (!expense) {
    return { name: '', amount: '', frequency: 'Monthly', categoryId: '', startDate: todayIso(), endDate: '' };
  }

  return {
    name: expense.name,
    amount: expense.amount.toFixed(2).replace('.', ','),
    frequency: expense.frequency,
    categoryId: String(expense.categoryId),
    startDate: expense.startDate,
    endDate: expense.endDate ?? '',
  };
}

function validate(form: FormState) {
  const errors: Record<string, string> = {};
  const amount = parseAmount(form.amount);

  if (!form.name.trim()) {
    errors.name = 'Inserisci un nome';
  }
  if (!(amount > 0)) {
    errors.amount = 'Inserisci un importo maggiore di zero, ad esempio 12,50';
  } else if (amount > 999_999_999) {
    errors.amount = 'Importo troppo alto';
  }
  if (!form.categoryId) {
    errors.categoryId = 'Scegli una categoria';
  }
  if (!form.startDate) {
    errors.startDate = 'Scegli la data di inizio';
  }
  if (form.endDate && form.startDate && form.endDate < form.startDate) {
    errors.endDate = 'La data di fine non può essere prima di quella di inizio';
  }

  return errors;
}

type RecurringModalProps = {
  expense?: RecurringExpenseResponse;
  onClose: () => void;
};

//La finestra per creare o modificare una spesa ricorrente
export function RecurringModal({ expense, onClose }: RecurringModalProps) {
  const [form, setForm] = useState(() => initialForm(expense));
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const categories = useCategories();
  const create = useCreateRecurringExpense();
  const update = useUpdateRecurringExpense();
  const showToast = useToast();

  const saving = create.isPending || update.isPending;
  //Una spesa ricorrente è sempre un'uscita
  // mostriamo quindi solo le categorie di uscita
  const options = (categories.data ?? []).filter((category) => category.type === 'Expense');

  function setField(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function focusField(name: string) {
    document.getElementById(`rc-${name}`)?.focus();
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

    const found = validate(form);
    setErrors(found);
    const firstInvalid = FIELD_ORDER.find((name) => found[name]);
    if (firstInvalid) {
      focusField(firstInvalid);
      return;
    }

    const input: RecurringExpenseInput = {
      name: form.name.trim(),
      amount: parseAmount(form.amount),
      frequency: form.frequency,
      startDate: form.startDate,
      endDate: form.endDate || null,
      categoryId: Number(form.categoryId),
    };

    const callbacks = {
      onSuccess: (saved: RecurringExpenseResponse) => {
        showToast({
          kind: 'success',
          title: expense ? 'Modifiche salvate' : 'Spesa ricorrente creata',
          message: `${saved.name}: i piani dal mese corrente sono aggiornati.`,
        });
        onClose();
      },
      onError: handleError,
    };

    if (expense) {
      update.mutate({ id: expense.id, input }, callbacks);
    } else {
      create.mutate(input, callbacks);
    }
  }

  return (
    <Modal
      title={expense ? 'Modifica spesa ricorrente' : 'Nuova spesa ricorrente'}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annulla
          </Button>
          <Button type="submit" form="rc-form" loading={saving}>
            {expense ? 'Salva modifiche' : 'Crea spesa ricorrente'}
          </Button>
        </>
      }
    >
      <form id="rc-form" className="modal-form" onSubmit={handleSubmit} noValidate>
        {formError && <Alert variant="danger">{formError}</Alert>}

        <Field id="rc-name" label="Nome" error={errors.name}>
          <Input
            id="rc-name"
            autoFocus
            placeholder="Es. Affitto"
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            invalid={!!errors.name}
          />
        </Field>

        <Field id="rc-amount" label="Importo" error={errors.amount}>
          <AmountInput
            id="rc-amount"
            value={form.amount}
            onChange={(value) => setField('amount', value)}
            tone="Expense"
            invalid={!!errors.amount}
          />
        </Field>

        <div className="grid-2">
          <Field id="rc-frequency" label="Frequenza" error={errors.frequency}>
            <Select
              id="rc-frequency"
              value={form.frequency}
              onChange={(e) => setField('frequency', e.target.value)}
              invalid={!!errors.frequency}
            >
              {FREQUENCIES.map((frequency) => (
                <option key={frequency} value={frequency}>
                  {FREQUENCY_LABELS[frequency]}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            id="rc-categoryId"
            label="Categoria"
            error={errors.categoryId}
            hint={options.length === 0 && categories.isSuccess ? 'Non hai categorie di uscita.' : undefined}
          >
            <Select
              id="rc-categoryId"
              value={form.categoryId}
              onChange={(e) => setField('categoryId', e.target.value)}
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
        </div>

        <div className="grid-2">
          <Field
            id="rc-startDate"
            label="Inizio"
            error={errors.startDate}
            hint="Le scadenze si ripetono nello stesso giorno del mese."
          >
            <Input
              id="rc-startDate"
              type="date"
              value={form.startDate}
              onChange={(e) => setField('startDate', e.target.value)}
              invalid={!!errors.startDate}
            />
          </Field>

          <Field id="rc-endDate" label="Fine (facoltativa)" error={errors.endDate}>
            <Input
              id="rc-endDate"
              type="date"
              value={form.endDate}
              min={form.startDate || undefined}
              onChange={(e) => setField('endDate', e.target.value)}
              invalid={!!errors.endDate}
            />
          </Field>
        </div>
      </form>
    </Modal>
  );
}