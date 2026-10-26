import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router";
import { errorMessage } from "../api/client";
import {
  useCategories,
  useTransactions,
  useTransactionSummary,
} from "../api/queries";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Pagination } from "../components/Pagination";
import { EmptyState, ErrorState } from "../components/States";
import { useTransactionActions } from "../components/transaction-actions-context";
import { TransactionFilterBar } from "../components/TransactionFilterBar";
import { TransactionListSkeleton } from "../components/TransactionListSkeleton";
import { TransactionRow } from "../components/TransactionRow";
import {
  filtersFromParams,
  hasActiveFilters,
  pageFromParams,
  toApiFilters,
  toSearchParams,
  type FilterState,
} from "../filters";
import { formatMoney } from "../format";
import { useDebouncedValue } from "../useDebouncedValue";

export function TransactionsPage() {
  //Filtri e pagina vivono nell'indirizzo: si ricaricano con la pagina e si possono condividere
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => filtersFromParams(searchParams), [searchParams]);
  const page = pageFromParams(searchParams);
  const { openNew, openEdit, askDelete } = useTransactionActions();

  //La ricerca parte solo quando si smette di scrivere
  const search = useDebouncedValue(filters.search);
  const apiFilters = toApiFilters(filters, search);

  const categories = useCategories(true);
  const transactions = useTransactions(apiFilters, page);
  //I totali dell'elenco filtrato, e con gli stessi filtri senza il tipo i conteggi delle schede
  const summary = useTransactionSummary(apiFilters);
  const counts = useTransactionSummary({ ...apiFilters, type: undefined });

  //Il colore di ogni categoria, cercato per Id
  const colors = new Map(
    categories.data?.map((category) => [category.id, category.color]),
  );

  //Se la pagina corrente non esiste più (per esempio dopo un'eliminazione), si torna all'ultima
  const lastPage = Math.max(1, transactions.data?.totalPages ?? 1);
  useEffect(() => {
    if (transactions.data && !transactions.isPlaceholderData && page > lastPage) {
      setSearchParams(toSearchParams(filters, lastPage), { replace: true });
    }
  }, [transactions.data, transactions.isPlaceholderData, page, lastPage, filters, setSearchParams]);

  //Ogni cambio di filtro riporta alla prima pagina; "replace" evita una voce nella cronologia a ogni tasto
  function updateFilters(patch: Partial<FilterState>) {
    setSearchParams(toSearchParams({ ...filters, ...patch }), { replace: true });
  }

  function resetFilters() {
    setSearchParams({}, { replace: true });
  }

  //Cambiare pagina invece sì: Indietro torna alla pagina precedente
  function changePage(next: number) {
    setSearchParams(toSearchParams(filters, next));
    window.scrollTo({ top: 0 });
  }

  //Cosa mostrare al posto dell'elenco: caricamento, errore, nessun dato, o i movimenti
  let content;
  if (transactions.isPending) {
    content = <TransactionListSkeleton />;
  } else if (transactions.isError) {
    content = (
      <ErrorState
        text={errorMessage(transactions.error)}
        onRetry={() => transactions.refetch()}
      />
    );
  } else if (transactions.data.items.length === 0) {
    content = hasActiveFilters(filters) ? (
      <EmptyState
        illustration="search"
        title="Nessun risultato"
        text="Nessun movimento corrisponde ai filtri. Prova a cambiarli o azzerali."
        actions={
          <Button variant="secondary" size="sm" onClick={resetFilters}>
            Azzera filtri
          </Button>
        }
      />
    ) : (
      <EmptyState
        title="Nessun movimento ancora"
        text="Qui troverai lo storico completo di entrate e uscite, dal più recente."
        actions={
          <Button icon="plus" size="sm" onClick={openNew}>
            Aggiungi movimento
          </Button>
        }
      />
    );
  } else {
    content = (
      <ul
        className={
          transactions.isPlaceholderData ? "tx-list list-stale" : "tx-list"
        }
      >
        {transactions.data.items.map((t) => (
          <TransactionRow
            key={t.id}
            transaction={t}
            categoryColor={t.categoryId ? colors.get(t.categoryId) : undefined}
            onEdit={() => openEdit(t)}
            onDelete={() => askDelete(t)}
          />
        ))}
      </ul>
    );
  }

  const total = summary.data
    ? summary.data.incomeCount + summary.data.expenseCount
    : 0;

  return (
    <Card>
      <TransactionFilterBar
        filters={filters}
        counts={
          counts.data && {
            all: counts.data.incomeCount + counts.data.expenseCount,
            income: counts.data.incomeCount,
            expense: counts.data.expenseCount,
          }
        }
        categories={categories.data ?? []}
        onChange={updateFilters}
        onReset={resetFilters}
      />

      {content}

      <Pagination
        page={page}
        totalPages={transactions.data?.totalPages ?? 1}
        onChange={changePage}
      />

      {summary.data && total > 0 && (
        <div className="summary-bar">
          <span>
            <b>{total}</b> {total === 1 ? "movimento" : "movimenti"}
          </span>
          <span>
            Entrate{" "}
            <b className="num inc">{formatMoney(summary.data.totalIncome)}</b>
          </span>
          <span>
            Uscite{" "}
            <b className="num exp">{formatMoney(summary.data.totalExpense)}</b>
          </span>
          <span>
            Saldo <b className="num">{formatMoney(summary.data.balance)}</b>
          </span>
        </div>
      )}
    </Card>
  );
}