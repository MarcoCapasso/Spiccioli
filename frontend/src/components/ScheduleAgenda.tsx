import type { ReactNode } from 'react';
import { dayOfMonth, formatMoney, formatWeekday, todayIso } from '../format';
import { NO_CATEGORY_COLOR } from '../palette';
import type { ScheduledPaymentResponse } from '../types';
import { PaymentStatusBadge } from './PaymentStatusBadge';
import { Card } from './Card';

type ScheduleAgendaProps = {
  year: number;
  month: number;
  budgetOpen: boolean;
  payments: ScheduledPaymentResponse[];
  //Il colore di ogni categoria, cercato per Id
  colors: Map<number, string>;
  onSelect: (payment: ScheduledPaymentResponse) => void;
};


//Le scadenze del mese per giorno: la versione per il telefono del calendario
export function ScheduleAgenda({ year, month, budgetOpen, payments, colors, onSelect }: ScheduleAgendaProps) {
  const today = todayIso();
  const isCurrentMonth = today.startsWith(`${year}-${String(month).padStart(2, '0')}`);

  //Le scadenze raggruppate per giorno: arrivano già in ordine di data
  const days: { date: string; items: ScheduledPaymentResponse[] }[] = [];
  for (const payment of payments) {
    const last = days[days.length - 1];
    if (last && last.date === payment.dueDate) {
      last.items.push(payment);
    } else {
      days.push({ date: payment.dueDate, items: [payment] });
    }
  }

  if (days.length === 0) {
    return (
      <Card className="agenda">
        <p className="t-small" style={{ margin: 0, padding: '16px 0' }}>
          Nessuna scadenza in questo mese.
        </p>
      </Card>
    );
  }

  //Se "oggi" non ha scadenze, un segnaposto lo mostra comunque al suo posto
  const showMarker = isCurrentMonth && !days.some((day) => day.date === today);
  const marker = (
    <div className="ag-today" key="today">
      Oggi · nessuna scadenza
    </div>
  );

  const rows: ReactNode[] = [];
  let markerDone = false;

  for (const day of days) {
    if (showMarker && !markerDone && day.date > today) {
      rows.push(marker);
      markerDone = true;
    }

    rows.push(
      <div className={day.date === today ? 'ag-day ag-day-today' : 'ag-day'} key={day.date}>
        <div className="ag-date">
          {formatWeekday(day.date)}
          <b>{dayOfMonth(day.date)}</b>
        </div>
        <div className="ag-items">
          {day.items.map((payment) => (
            <button type="button" className="ag-item" key={payment.recurringExpenseId} onClick={() => onSelect(payment)}>
              <div className="ag-item-main">
                <div className="ag-item-name">{payment.name}</div>
                <span className="cat-label">
                  <span
                    className="cat-label-dot"
                    style={{ background: colors.get(payment.categoryId) ?? NO_CATEGORY_COLOR }}
                  />
                  {payment.categoryName ?? 'Senza categoria'}
                </span>
              </div>
              <div className="ag-item-end">
                <div className="ag-item-amt num">{formatMoney(payment.paidAmount ?? payment.amount)}</div>
                <PaymentStatusBadge payment={payment} budgetOpen={budgetOpen} />
              </div>
            </button>
          ))}
        </div>
      </div>,
    );
  }

  //Tutte le scadenze sono prima di "oggi"
  if (showMarker && !markerDone) {
    rows.push(marker);
  }

  return <Card className="agenda">{rows}</Card>;
}