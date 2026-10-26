import { formatMoney } from '../format';
import type { TransactionSummaryResponse } from '../types';
import { Card } from './Card';
import { Icon } from './Icon';
import { Skeleton } from './States';

type OverviewCardsProps = {
  summary: TransactionSummaryResponse;
  periodLabel: string;
};

function movements(count: number) {
  return `${count} ${count === 1 ? 'movimento' : 'movimenti'}`;
}

//Saldo, entrate e uscite del periodo: i numeri sono quelli del backend
export function OverviewCards({ summary, periodLabel }: OverviewCardsProps) {
  const { totalIncome, totalExpense, balance, incomeCount, expenseCount } = summary;

  //La proporzione tra entrate e uscite per la barra: è una percentuale di presentazione, non un importo
  const sum = totalIncome + totalExpense;
  const incomePct = sum > 0 ? Math.round((totalIncome / sum) * 100) : 0;
  const expensePct = sum > 0 ? 100 - incomePct : 0;

  return (
    <section className="overview" aria-label="Riepilogo">
      <Card className="ov-card ov-hero">
        <div className="coin-deco" aria-hidden="true" />
        <div className="ov-label">
          <Icon name="wallet" />
          Saldo · {periodLabel}
        </div>
        <div className="t-display num ov-balance">
          {balance < 0 ? '−' : ''}
          {formatMoney(Math.abs(balance))}
        </div>
        <div className="split" role="img" aria-label={`Entrate ${incomePct}%, uscite ${expensePct}%`}>
          <span style={{ width: `${incomePct}%`, background: 'var(--success)' }} />
          <span style={{ width: `${expensePct}%`, background: 'var(--danger)' }} />
        </div>
        <div className="split-legend">
          <span>Entrate {incomePct}%</span>
          <span>Uscite {expensePct}%</span>
        </div>
      </Card>

      <Card className="ov-card">
        <div className="ov-label">
          <span className="ov-ico ov-ico-inc">
            <Icon name="up" />
          </span>
          Entrate
        </div>
        <div className="ov-value num inc">{formatMoney(totalIncome)}</div>
        <div className="ov-delta">{movements(incomeCount)}</div>
      </Card>

      <Card className="ov-card">
        <div className="ov-label">
          <span className="ov-ico ov-ico-exp">
            <Icon name="down" />
          </span>
          Uscite
        </div>
        <div className="ov-value num exp">{formatMoney(totalExpense)}</div>
        <div className="ov-delta">{movements(expenseCount)}</div>
      </Card>
    </section>
  );
}

//Le forme delle tre schede mentre i dati arrivano
export function OverviewCardsSkeleton() {
  return (
    <section className="overview" role="status" aria-label="Caricamento del riepilogo">
      {[60, 70, 70].map((width, index) => (
        <Card key={index} className="ov-card">
          <Skeleton width="40%" />
          <div style={{ marginTop: 14 }}>
            <Skeleton width={`${width}%`} height={index === 0 ? 44 : 30} />
          </div>
          <div style={{ marginTop: 14 }}>
            <Skeleton width="50%" height={10} />
          </div>
        </Card>
      ))}
    </section>
  );
}