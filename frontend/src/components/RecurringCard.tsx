import { inkOn, tint } from '../color';
import { formatMoney, formatNumericDate, formatShortDate } from '../format';
import { NO_CATEGORY_COLOR } from '../palette';
import { FREQUENCY_LABELS, recurrenceStatus } from '../recurrence';
import type { RecurringExpenseResponse } from '../types';
import { Badge } from './Badge';
import { Card } from './Card';
import { IconButton } from './IconButton';

type RecurringCardProps = {
  expense: RecurringExpenseResponse;
  categoryColor?: string;
  onEdit: () => void;
  onDelete: () => void;
};

//Una spesa ricorrente: nome, importo, frequenza, categoria, date e stato
export function RecurringCard({ expense, categoryColor = NO_CATEGORY_COLOR, onEdit, onDelete }: RecurringCardProps) {
  const { name, amount, frequency, startDate, endDate, categoryName } = expense;
  const status = recurrenceStatus(expense);
  const ended = status === 'ended';

  return (
    <Card className={ended ? 'rc-card rc-ended' : 'rc-card'}>
      <div className="rc-top">
        <div className="cat-swatch" style={{ background: tint(categoryColor, 0.15), color: inkOn(categoryColor) }} aria-hidden="true">
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="rc-title">
          <div className="rc-name">{name}</div>
          <div className="t-xs">{FREQUENCY_LABELS[frequency]}</div>
        </div>
        <div className="rc-amount num">{formatMoney(amount)}</div>
      </div>

      <div className="rc-meta">
        <span className="cat-label">
          <span className="cat-label-dot" style={{ background: categoryColor }} />
          {categoryName ?? 'Senza categoria'}
        </span>
        <span className="rc-dates">
          dal <b>{formatNumericDate(startDate)}</b>
          {endDate && (
            <>
              {' '}al <b>{formatNumericDate(endDate)}</b>
            </>
          )}
        </span>
      </div>

      <div className="rc-foot">
        {status === 'active' && <Badge variant="income">Attiva</Badge>}
        {status === 'ending' && endDate && <Badge variant="primary">Termina il {formatShortDate(endDate)}</Badge>}
        {ended && <Badge variant="neutral">Terminata</Badge>}
        <span className="spacer" />
        <IconButton icon="edit" label={`Modifica ${name}`} onClick={onEdit} />
        {/* Una terminata non ha più nulla da eliminare né da terminare */}
        {!ended && <IconButton icon="trash" label={`Elimina ${name}`} danger onClick={onDelete} />}
      </div>
    </Card>
  );
}