import { useState, type SubmitEvent } from 'react';
import { errorMessage, fieldErrors } from '../api/client';
import { useCategories, useRemoveAllocation, useSetAllocation } from '../api/queries';
import { formatMoney, formatMonth, parseAmount } from '../format';
import { Alert } from './Alert';
import { AmountInput } from './AmountInput';
import { Button } from './Button';
import { Field } from './Field';
import { Modal } from './Modal';
import { Select } from './Select';
import { useToast } from './toast-context';

type AllocationModalProps = {
  year: number;
  month: number;
  plannedIds: Set<number>;
  target?: { categoryId: number; name: string; allocated: number | null };
  onClose: () => void;
};

//La finestra con le azioni
// aggiungere, modificare o togliere la voce di una categoria
export function AllocationModal({ year, month, plannedIds, target, onClose }: AllocationModalProps) {
  const categories = useCategories();
  const setAllocation = useSetAllocation();
  const removeAllocation = useRemoveAllocation();
  const showToast = useToast();

  const [categoryId, setCategoryId] = useState(target ? String(target.categoryId) : '');
  const [amount, setAmount] = useState(() =>
    target?.allocated != null ? target.allocated.toFixed(2).replace('.', ',') : '',
  );
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [formError, setFormError] = useState<string | null>(null);

  //Solo le categorie di uscita non archiviate e non ancora nel piano
  const options = (categories.data ?? []).filter(
    (category) => category.type === 'Expense' && !category.isArchived && !plannedIds.has(category.id),
  );

  const isEdit = target?.allocated != null;
  const saving = setAllocation.isPending;

  function focusField(name: string) {
    document.getElementById(`al-${name}`)?.focus();
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    //Zero è valido: significa "ho deciso di non spendere in questa categoria"
    const value = parseAmount(amount);
    const found: Record<string, string> = {};
    if (!categoryId) {
      found.categoryId = 'Scegli una categoria';
    }
    if (!(value >= 0)) {
      found.amount = 'Inserisci un importo, anche zero se non prevedi spese';
    }
    setErrors(found);
    const first = found.categoryId ? 'categoryId' : found.amount ? 'amount' : null;
    if (first) {
      focusField(first);
      return;
    }

    const name = target?.name ?? options.find((category) => String(category.id) === categoryId)?.name ?? '';

    setAllocation.mutate(
      { year, month, categoryId: Number(categoryId), amount: value },
      {
        onSuccess: () => {
          showToast({
            kind: 'success',
            title: isEdit ? 'Voce aggiornata' : 'Voce aggiunta',
            message: `${name} · ${formatMoney(value)}`,
          });
          onClose();
        },
        onError: (error) => {
          const fields = fieldErrors(error);
          if (fields.categoryId || fields.amount) {
            setErrors(fields);
            focusField(fields.categoryId ? 'categoryId' : 'amount');
          } else {
            setFormError(errorMessage(error));
          }
        },
      },
    );
  }

  function handleRemove() {
    if (!target) {
      return;
    }

    removeAllocation.mutate(
      { year, month, categoryId: target.categoryId },
      {
        onSuccess: () => {
          showToast({ kind: 'info', title: 'Voce tolta dal piano', message: target.name });
          onClose();
        },
        onError: (error) => setFormError(errorMessage(error)),
      },
    );
  }

  return (
    <Modal
      size="sm"
      title={isEdit ? `Voce: ${target?.name}` : target ? `Pianifica ${target.name}` : 'Nuova voce'}
      subtitle={formatMonth(year, month)}
      onClose={onClose}
      footer={
        <>
          {isEdit && (
            <Button variant="ghost" icon="trash" loading={removeAllocation.isPending} onClick={handleRemove}>
              Togli dal piano
            </Button>
          )}
          <span className="spacer" />
          <Button variant="secondary" onClick={onClose}>
            Annulla
          </Button>
          <Button type="submit" form="al-form" loading={saving}>
            Salva
          </Button>
        </>
      }
    >
      <form id="al-form" className="modal-form" onSubmit={handleSubmit} noValidate>
        {formError && <Alert variant="danger">{formError}</Alert>}

        {!target && (
          <Field
            id="al-categoryId"
            label="Categoria"
            error={errors.categoryId}
            hint={options.length === 0 && categories.isSuccess ? 'Tutte le categorie sono già nel piano.' : undefined}
          >
            <Select
              id="al-categoryId"
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setErrors((current) => ({ ...current, categoryId: undefined }));
              }}
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
        )}

        <Field
          id="al-amount"
          label="Importo previsto"
          error={errors.amount}
          hint="Quanto prevedi di spendere nel mese. Con zero indichi che non prevedi spese."
        >
          <AmountInput
            id="al-amount"
            autoFocus={!!target}
            value={amount}
            onChange={(value) => {
              setAmount(value);
              setErrors((current) => ({ ...current, amount: undefined }));
            }}
            tone="Expense"
            invalid={!!errors.amount}
          />
        </Field>
      </form>
    </Modal>
  );
}