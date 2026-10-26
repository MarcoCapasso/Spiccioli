import { useState } from 'react';
import { errorMessage } from '../api/client';
import { useCategories, useSchedule } from '../api/queries';
import { shiftMonth } from '../calendar';
import type { ScheduledPaymentResponse } from '../types';
import { Alert } from './Alert';
import { CalendarGrid } from './CalendarGrid';
import { Card } from './Card';
import { MonthNavigator } from './MonthNavigator';
import { ScheduleAgenda } from './ScheduleAgenda';
import { ScheduleModal } from './ScheduleModal';
import { ScheduleSummary } from './ScheduleSummary';
import { ErrorState, Skeleton } from './States';

//La vista a calendario: il mese, i totali e le scadenze
export function ScheduleView() {
  const now = new Date();
  const [current, setCurrent] = useState({ year: now.getFullYear(), month: now.getMonth() + 1 });
  const [selected, setSelected] = useState<ScheduledPaymentResponse | null>(null);
  const { year, month } = current;

  const schedule = useSchedule(year, month);
  const categories = useCategories(true);
  const colors = new Map(categories.data?.map((category) => [category.id, category.color]));

  const isCurrent = year === now.getFullYear() && month === now.getMonth() + 1;

  let content;
  if (schedule.isPending) {
    content = (
      <Card padded>
        <Skeleton height={320} radius={12} />
      </Card>
    );
  } else if (schedule.isError) {
    content = (
      <Card>
        <ErrorState text={errorMessage(schedule.error)} onRetry={() => schedule.refetch()} />
      </Card>
    );
  } else {
    const data = schedule.data;
    content = (
      <>
        {!data.budgetOpen && (
          <Alert variant="info">
            Il piano di questo mese non è ancora aperto: le scadenze sono previste dalle spese ricorrenti. Saldando una
            scadenza il piano si apre.
          </Alert>
        )}
        <ScheduleSummary schedule={data} />
        {/* Con il mese appena cambiato si vedono ancora i dati del precedente, attenuati, finché arrivano quelli nuovi */}
        <div className={schedule.isPlaceholderData ? 'list-stale' : undefined}>
          <CalendarGrid
            year={data.year}
            month={data.month}
            payments={data.payments}
            colors={colors}
            onSelect={setSelected}
          />
          <ScheduleAgenda
            year={data.year}
            month={data.month}
            budgetOpen={data.budgetOpen}
            payments={data.payments}
            colors={colors}
            onSelect={setSelected}
          />
        </div>

        {selected && (
          <ScheduleModal payment={selected} year={data.year} month={data.month} onClose={() => setSelected(null)} />
        )}
      </>
    );
  }

  return (
    <div className="stack">
      <MonthNavigator
        year={year}
        month={month}
        isCurrent={isCurrent}
        onPrevious={() => setCurrent(shiftMonth(year, month, -1))}
        onNext={() => setCurrent(shiftMonth(year, month, 1))}
        onToday={() => setCurrent({ year: now.getFullYear(), month: now.getMonth() + 1 })}
      />
      {content}
    </div>
  );
}