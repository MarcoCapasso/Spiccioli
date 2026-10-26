import { useState, type SubmitEvent } from 'react';
import { Link } from 'react-router';
import { errorMessage, fieldErrors } from '../api/client';
import { usePayScheduledPayment } from '../api/queries';
import { formatDate, formatMoney, parseAmount, todayIso } from '../format';
import type { ScheduledPaymentResponse } from '../types';
import { Alert } from './Alert';
import { AmountInput } from './AmountInput';
import { Button } from './Button';
import { Field } from './Field';
import { Input } from './Input';
import { Modal } from './Modal';
import { PaymentStatusBadge } from './PaymentStatusBadge';
import { useToast } from './toast-context';

type ScheduleModalProps = {
  payment: ScheduledPaymentResponse;
  year: number;
  month: number;
  onClose: () => void;
};

//Il dettaglio di una scadenza
//  se è da pagare il modulo del "Pagato", se è saldata il pagamento reale
export function ScheduleModal({ payment, year, month, onClose }: ScheduleModalProps) {
  const [amount, setAmount] = useState(() => payment.amount.toFixed(2).replace('.', ','));
  const [date, setDate] = useState(todayIso);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const pay = usePayScheduledPayment();
  const showToast = useToast();

  //Senza un pagamento previsto il piano del mese non è aperto
  // si apre al momento di saldare
  const budgetOpen = payment.plannedPaymentId !== null;

  function handleError(error: unknown) {
    const fields = fieldErrors(error);

    if (fields.amount || fields.date) {
      setErrors(fields);
      document.getElementById(fields.amount ? 'pay-amount' : 'pay-date')?.focus();
    } else {
      setFormError(errorMessage(error));
    }
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const cents = parseAmount(amount);
    const found: Record<string, string> = {};
    if (!(cents > 0)) {
      found.amount = 'Inserisci un importo maggiore di zero, ad esempio 12,50';
    }
    if (!date) {
      found.date = 'Scegli la data del pagamento';
    }
    setErrors(found);
    if (found.amount || found.date) {
      document.getElementById(found.amount ? 'pay-amount' : 'pay-date')?.focus();
      return;
    }

    pay.mutate(
      { payment, year, month, input: { amount: cents, date } },
      {
        onSuccess: () => {
          showToast({ kind: 'success', title: 'Pagamento registrato', message: `${payment.name} · ${formatMoney(cents)}` });
          onClose();
        },
        onError: handleError,
      },
    );
  }

  //Già saldata
  //  solo i dettagli, con il collegamento ai movimenti
  if (payment.isPaid) {
    return (
      <Modal
        size="sm"
        title={payment.name}
        subtitle={payment.categoryName ?? undefined}
        onClose={onClose}
        footer={<Button onClick={onClose}>Chiudi</Button>}
      >
        <dl className="detail-list">
          <dt>Scadenza</dt>
          <dd>{formatDate(payment.dueDate)}</dd>
          <dt>Importo previsto</dt>
          <dd className="num">{formatMoney(payment.amount)}</dd>
          <dt>Stato</dt>
          <dd>
            <PaymentStatusBadge payment={payment} budgetOpen />
          </dd>
          {payment.paidDate && payment.paidAmount !== null && (
            <>
              <dt>Pagata il</dt>
              <dd>{formatDate(payment.paidDate)}</dd>
              <dt>Importo pagato</dt>
              <dd className="num">{formatMoney(payment.paidAmount)}</dd>
            </>
          )}
        </dl>
        <div>
          <Link className="card-link" to="/movimenti" onClick={onClose}>
            Vedi nei Movimenti
          </Link>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      size="sm"
      title={payment.name}
      subtitle={payment.categoryName ?? undefined}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annulla
          </Button>
          <Button type="submit" form="pay-form" icon="check" loading={pay.isPending}>
            Pagato
          </Button>
        </>
      }
    >
      <dl className="detail-list">
        <dt>Scadenza</dt>
        <dd>{formatDate(payment.dueDate)}</dd>
        <dt>Importo previsto</dt>
        <dd className="num">{formatMoney(payment.amount)}</dd>
        <dt>Stato</dt>
        <dd>
          <PaymentStatusBadge payment={payment} budgetOpen={budgetOpen} />
        </dd>
      </dl>

      <form id="pay-form" className="modal-form modal-section" onSubmit={handleSubmit} noValidate>
        {formError && <Alert variant="danger">{formError}</Alert>}
        {!budgetOpen && <Alert variant="info">Il piano di questo mese verrà aperto al momento del pagamento.</Alert>}

        <Field
          id="pay-amount"
          label="Importo pagato"
          error={errors.amount}
          hint="Importo e data reali, anche diversi da quelli previsti."
        >
          <AmountInput
            id="pay-amount"
            autoFocus
            value={amount}
            onChange={(value) => {
              setAmount(value);
              setErrors((current) => ({ ...current, amount: undefined }));
            }}
            tone="Expense"
            invalid={!!errors.amount}
          />
        </Field>

        <Field id="pay-date" label="Data del pagamento" error={errors.date}>
          <Input
            id="pay-date"
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