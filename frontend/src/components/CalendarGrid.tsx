import { buildMonthGrid } from '../calendar';
import { tint } from '../color';
import { formatMoney, todayIso } from '../format';
import { NO_CATEGORY_COLOR } from '../palette';
import type { ScheduledPaymentResponse } from '../types';
import { Icon } from './Icon';

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

type CalendarGridProps = {
  year: number;
  month: number;
  payments: ScheduledPaymentResponse[];
  colors: Map<number, string>;
  onSelect: (payment: ScheduledPaymentResponse) => void;
};

//Il mese a settimane da lunedì a domenica
export function CalendarGrid({ year, month, payments, colors, onSelect }: CalendarGridProps) {
  const today = todayIso();

  //Le scadenze raggruppate per giorno
  const byDate = new Map<string, ScheduledPaymentResponse[]>();
  for (const payment of payments) {
    byDate.set(payment.dueDate, [...(byDate.get(payment.dueDate) ?? []), payment]);
  }

  return (
    <div className="cal-grid">
      {WEEKDAYS.map((day) => (
        <div className="cal-dow" key={day}>
          {day}
        </div>
      ))}

      {buildMonthGrid(year, month).map((cell) => {
        const classes = ['cal-cell', !cell.inMonth && 'cal-cell-out', cell.date === today && 'cal-cell-today']
          .filter(Boolean)
          .join(' ');

        return (
          <div className={classes} key={cell.date}>
            <div className="cal-num">{cell.day}</div>
            {(byDate.get(cell.date) ?? []).map((payment) => (
              <button
                key={payment.recurringExpenseId}
                type="button"
                className={payment.isOverdue ? 'cal-chip cal-chip-late' : 'cal-chip'}
                style={{ background: tint(colors.get(payment.categoryId) ?? NO_CATEGORY_COLOR, 0.16) }}
                title={`${payment.name} · ${formatMoney(payment.amount)}`}
                onClick={() => onSelect(payment)}
              >
                {payment.isPaid && <Icon name="check" />}
                <span>{payment.name}</span>
              </button>
            ))}
          </div>
        );
      })}
    </div>
  );
}