import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { errorMessage } from "../api/client";
import {
  queryKeys,
  useCategories,
  useDeleteRecurringExpense,
  useRecurringExpenses,
  useUpdateRecurringExpense,
} from "../api/queries";
import { Button } from "./Button";
import { Card } from "./Card";
import { ConfirmModal } from "./ConfirmModal";
import { RecurringCard } from "./RecurringCard";
import { RecurringModal } from "./RecurringModal";
import { EmptyState, ErrorState, Skeleton } from "./States";
import { useToast } from "./toast-context";
import { formatMoney, formatDate } from "../format";
import { FREQUENCY_LABELS, isEnded } from "../recurrence";
import type { RecurringExpenseResponse } from "../types";

//La finestra aperta in questo momento: nuova, modifica, conferma di eliminazione, o nessuna
type OpenModal =
  | { kind: "new" }
  | { kind: "edit"; expense: RecurringExpenseResponse }
  | { kind: "delete"; expense: RecurringExpenseResponse }
  | null;

export function RecurringList() {
  const expenses = useRecurringExpenses();
  const categories = useCategories(true);
  const remove = useDeleteRecurringExpense();
  const update = useUpdateRecurringExpense();
  const queryClient = useQueryClient();
  const showToast = useToast();
  const [modal, setModal] = useState<OpenModal>(null);
  const openNew = () => setModal({ kind: "new" });

  //Il colore di ogni categoria, cercato per Id
  const colors = new Map(
    categories.data?.map((category) => [category.id, category.color]),
  );

  //"Annulla" dopo una terminazione: la spesa torna com'era, con la sua data di fine originale
  function reopen(expense: RecurringExpenseResponse) {
    update.mutate(
      {
        id: expense.id,
        input: {
          name: expense.name,
          amount: expense.amount,
          frequency: expense.frequency,
          startDate: expense.startDate,
          endDate: expense.endDate,
          categoryId: expense.categoryId,
        },
      },
      {
        onSuccess: () =>
          showToast({
            kind: "success",
            title: "Spesa ricorrente ripristinata",
            message: expense.name,
          }),
        onError: (error) =>
          showToast({
            kind: "error",
            title: "Spesa non ripristinata",
            message: errorMessage(error),
          }),
      },
    );
  }

  function confirmDelete(expense: RecurringExpenseResponse) {
    remove.mutate(expense.id, {
      onSuccess: () => {
        setModal(null);

        if (!expense.hasPaidPayments) {
          showToast({
            kind: "info",
            title: "Spesa ricorrente eliminata",
            message: expense.name,
          });
          return;
        }

        const current = queryClient.getQueryData<RecurringExpenseResponse[]>(
          queryKeys.recurringExpenses,
        );
        const after = current?.find((item) => item.id === expense.id);

        showToast({
          kind: "info",
          title: "Spesa ricorrente terminata",
          message: after?.endDate
            ? `${expense.name} non genererà più scadenze dopo il ${formatDate(after.endDate)}.`
            : expense.name,
          action: { label: "Annulla", run: () => reopen(expense) },
        });
      },
      onError: (error) => {
        setModal(null);
        showToast({
          kind: "error",
          title: "Spesa non eliminata",
          message: errorMessage(error),
        });
      },
    });
  }

  //Le finestre: le stesse per l'elenco e per lo stato vuoto
  const modals = (
    <>
      {modal?.kind === "new" && (
        <RecurringModal onClose={() => setModal(null)} />
      )}
      {modal?.kind === "edit" && (
        <RecurringModal
          expense={modal.expense}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.kind === "delete" && (
        <ConfirmModal
          title={
            modal.expense.hasPaidPayments
              ? `Terminare “${modal.expense.name}”?`
              : `Eliminare “${modal.expense.name}”?`
          }
          confirmLabel={
            modal.expense.hasPaidPayments ? "Termina spesa" : "Elimina spesa"
          }
          loading={remove.isPending}
          onConfirm={() => confirmDelete(modal.expense)}
          onClose={() => setModal(null)}
          icon={modal.expense.hasPaidPayments ? "repeat" : "trash"}
        >
          <p>
            <b style={{ color: "var(--text)" }}>{modal.expense.name}</b> ·{" "}
            {formatMoney(modal.expense.amount)},{" "}
            {FREQUENCY_LABELS[modal.expense.frequency].toLowerCase()}
          </p>
          {modal.expense.hasPaidPayments ? (
            <p>
              Ha già pagamenti saldati: la spesa resta visibile ma da questo
              momento non genera più scadenze nei mesi successivi. I mesi
              passati non cambiano.
            </p>
          ) : (
            <p>
              Non ha pagamenti saldati: verrà eliminata del tutto, insieme alle
              sue scadenze nei piani.
            </p>
          )}
        </ConfirmModal>
      )}
    </>
  );

  if (expenses.isPending) {
    return (
      <div
        className="cat-grid"
        role="status"
        aria-label="Caricamento delle spese ricorrenti"
      >
        {[1, 2, 3, 4].map((n) => (
          <Card key={n} className="rc-card">
            <div className="rc-top">
              <Skeleton width={44} height={44} radius={13} />
              <div style={{ flex: 1 }}>
                <Skeleton width="50%" />
                <div style={{ marginTop: 8 }}>
                  <Skeleton width="30%" height={10} />
                </div>
              </div>
              <Skeleton width={70} height={16} />
            </div>
            <Skeleton width="60%" height={10} />
          </Card>
        ))}
      </div>
    );
  }

  if (expenses.isError) {
    return (
      <Card>
        <ErrorState
          text={errorMessage(expenses.error)}
          onRetry={() => expenses.refetch()}
        />
      </Card>
    );
  }

  const all = expenses.data;

  if (all.length === 0) {
    return (
      <>
        <Card>
          <EmptyState
            title="Nessuna spesa ricorrente"
            text="Affitto, abbonamenti, rate: aggiungile e Spiccioli le inserirà nel piano di ogni mese."
            actions={
              <Button icon="plus" onClick={openNew}>
                Nuova spesa ricorrente
              </Button>
            }
          />
        </Card>
        {modals}
      </>
    );
  }

  //Prima le attive, poi le terminate, ciascun gruppo nell'ordine dell'API (per nome)
  const sorted = [
    ...all.filter((expense) => !isEnded(expense)),
    ...all.filter(isEnded),
  ];

  return (
    <div className="stack">
      <div className="row">
        <p className="muted" style={{ margin: 0 }}>
          {all.length}{" "}
          {all.length === 1 ? "spesa ricorrente" : "spese ricorrenti"}
        </p>
        <div className="spacer" />
        <Button variant="secondary" icon="plus" onClick={openNew}>
          Nuova spesa ricorrente
        </Button>
      </div>

      <div className="cat-grid">
        {sorted.map((expense) => (
          <RecurringCard
            key={expense.id}
            expense={expense}
            categoryColor={colors.get(expense.categoryId)}
            onEdit={() => setModal({ kind: "edit", expense })}
            onDelete={() => setModal({ kind: "delete", expense })}
          />
        ))}
      </div>

      {modals}
    </div>
  );
}
