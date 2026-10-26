import { formatMoney } from '../format';
import type { ScheduleResponse } from '../types';

//Previsto, pagato e da pagare nel mese
// I totali vengono calcolati direttamente nel backend
export function ScheduleSummary({ schedule }: { schedule: ScheduleResponse }) {
  const items = [
    { label: 'Previsto nel mese', value: schedule.plannedTotal, tone: '' },
    { label: 'Già pagato', value: schedule.paidTotal, tone: 'inc' },
    { label: 'Ancora da pagare', value: schedule.pendingTotal, tone: 'exp' },
  ];

  return (
    <div className="sched-sum">
      {items.map((item) => (
        <div className="sched-sum-item" key={item.label}>
          <div className="t-small">{item.label}</div>
          <div className={`sched-sum-value num ${item.tone}`}>{formatMoney(item.value)}</div>
        </div>
      ))}
    </div>
  );
}