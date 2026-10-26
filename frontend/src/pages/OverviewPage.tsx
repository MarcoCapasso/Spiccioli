import { Button } from '../components/Button';
import { Card, CardHeader } from '../components/Card';
import { CategoryBars, CategoryBarsSkeleton } from '../components/CategoryBars';
import { EmptyState, ErrorState } from '../components/States';
import { errorMessage } from '../api/client';
import { Icon } from '../components/Icon';
import { OverviewFilterSheet } from '../components/OverviewFilterSheet';
import { formatShortDate } from '../format';
import { Link } from 'react-router';
import { PERIOD_LABELS, periodRange, type PeriodKey } from '../period';
import { OverviewCards, OverviewCardsSkeleton } from '../components/OverviewCards';
import { OverviewFilterBar } from '../components/OverviewFilterBar';
import { useState } from 'react';
import { useCategories, useCategoryTotals, useTransactions, useTransactionSummary } from '../api/queries';
import { useTransactionActions } from '../components/transaction-actions-context';
import { TransactionListSkeleton } from '../components/TransactionListSkeleton';
import { TransactionRow } from '../components/TransactionRow';


export function OverviewPage() {
  const [period, setPeriod] = useState<PeriodKey>('month');
  const [custom, setCustom] = useState({ from: '', to: '' });
  const [categoryId, setCategoryId] = useState('');
  const { openNew } = useTransactionActions();
  const [filterOpen, setFilterOpen] = useState(false);

  const categories = useCategories(true);

  //L'intervallo del periodo scelto, più la categoria: gli stessi filtri per tutta la pagina
  const range = periodRange(period, custom);
  const filters = { ...range, categoryId: categoryId ? Number(categoryId) : undefined };

  const summary = useTransactionSummary(filters);
  const recent = useTransactions(filters, 1, 6);
  const byCategory = useCategoryTotals(range);

  //Il colore di ogni categoria, cercato per Id
  const colors = new Map(categories.data?.map((category) => [category.id, category.color]));

  const isFiltered = period !== 'all' || categoryId !== '';

  function showAll() {
    setPeriod('all');
    setCategoryId('');
  }

    function resetFilters() {
    setPeriod('month');
    setCustom({ from: '', to: '' });
    setCategoryId('');
  }

  //La selezione in una riga, per il pulsante dei filtri sul telefono
  const categoryName = categories.data?.find((category) => String(category.id) === categoryId)?.name;
  const periodText =
    period === 'custom' && (custom.from || custom.to)
      ? `${custom.from ? formatShortDate(custom.from) : '…'} – ${custom.to ? formatShortDate(custom.to) : '…'}`
      : PERIOD_LABELS[period];
  const filterSummary = `${periodText} · ${categoryName ?? 'Tutte le categorie'}`;

  //Le stesse proprietà per la barra e per la finestra
  const filterProps = {
    period,
    onPeriodChange: setPeriod,
    custom,
    onCustomChange: (patch: Partial<{ from: string; to: string }>) =>
      setCustom((current) => ({ ...current, ...patch })),
    categoryId,
    onCategoryChange: setCategoryId,
    categories: categories.data ?? [],
  };

  //Le schede
  let cards;
  if (summary.isPending) {
    cards = <OverviewCardsSkeleton />;
  } else if (summary.isError) {
    cards = (
      <Card>
        <ErrorState text={errorMessage(summary.error)} onRetry={() => summary.refetch()} />
      </Card>
    );
  } else {
    cards = <OverviewCards summary={summary.data} periodLabel={PERIOD_LABELS[period]} />;
  }

  //Gli ultimi movimenti
  let recentContent;
  if (recent.isPending) {
    recentContent = <TransactionListSkeleton />;
  } else if (recent.isError) {
    recentContent = <ErrorState text={errorMessage(recent.error)} onRetry={() => recent.refetch()} />;
  } else if (recent.data.items.length === 0) {
    recentContent = (
      <EmptyState
        illustration="search"
        title="Nessun movimento nel periodo"
        text="Prova un altro periodo o un'altra categoria, oppure aggiungi un movimento."
        actions={
          <>
            {isFiltered && (
              <Button variant="secondary" size="sm" onClick={showAll}>
                Mostra tutto
              </Button>
            )}
            <Button icon="plus" size="sm" onClick={openNew}>
              Aggiungi movimento
            </Button>
          </>
        }
      />
    );
  } else {
    recentContent = (
      <ul className={recent.isPlaceholderData ? 'tx-list list-stale' : 'tx-list'}>
        {recent.data.items.map((t) => (
          <TransactionRow
            key={t.id}
            transaction={t}
            categoryColor={t.categoryId ? colors.get(t.categoryId) : undefined}
          />
        ))}
      </ul>
    );
  }

  //Le uscite più alte
  const expenses = (byCategory.data ?? [])
    .filter((entry) => entry.type === 'Expense' && (!categoryId || entry.categoryId === Number(categoryId)))
    .slice(0, 6);

  let barsContent;
  if (byCategory.isPending) {
    barsContent = <CategoryBarsSkeleton />;
  } else if (byCategory.isError) {
    barsContent = <ErrorState text={errorMessage(byCategory.error)} onRetry={() => byCategory.refetch()} />;
  } else if (expenses.length === 0) {
    barsContent = (
      <p className="t-small" style={{ margin: 0, padding: '4px 20px 22px' }}>
        Nessuna uscita nel periodo selezionato.
      </p>
    );
  } else {
    barsContent = <CategoryBars totals={expenses} colors={colors} />;
  }

  return (
    <div className="stack">
      <OverviewFilterBar {...filterProps}/>

      <button type="button" className='filter-btn' aria-haspopup="dialog" onClick={() => setFilterOpen(true)}>
        <Icon name="filter" />
        <span className='filter-btn-text'>{filterSummary}</span>
        <Icon name="chevron" />
      </button>

      {cards}

      <div className="dash-grid">
        <Card>
          <CardHeader
            title="Movimenti recenti"
            action={
              <Link className="card-link" to="/movimenti">
                Vedi tutti
              </Link>
            }
          />
          {recentContent}
        </Card>

        <Card>
          <CardHeader title="Uscite per categoria" />
          {barsContent}
        </Card>
      </div>
      {filterOpen && (
        <OverviewFilterSheet {...filterProps} onReset={resetFilters} onClose={() => setFilterOpen(false)} />
      )}
    </div>
  );
}