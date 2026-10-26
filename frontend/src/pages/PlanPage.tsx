import { useState } from "react";
import { Link } from "react-router";
import { errorMessage } from "../api/client";
import { useCategories, useDashboard, useOpenBudget } from "../api/queries";
import { AllocationModal } from "../components/AllocationModal";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Icon } from "../components/Icon";
import { MonthNavigator } from "../components/MonthNavigator";
import { BudgetModal, type BudgetField } from "../components/BudgetModal";
import { PlanCards } from "../components/PlanCards";
import { PlanCategories } from "../components/PlanCategories";
import { EmptyState, ErrorState, Skeleton } from "../components/States";
import { useToast } from "../components/toast-context";
import { formatMoney, formatMonth } from "../format";
import type { CategoryProgressResponse } from "../types";
import { useMonth } from "../useMonth";

//La finestra delle voci: aggiunta di una nuova, oppure una categoria già scelta, oppure entrate e risparmi
type OpenModal =
  | { kind: "add" }
  | { kind: "target"; category: CategoryProgressResponse }
  | { kind: "budget"; focus: BudgetField }
  | null;

//Il piano del mese: previsto contro reale
export function PlanPage() {
  const { year, month, isCurrent, previous, next, today } = useMonth();
  const dashboard = useDashboard(year, month);
  const categories = useCategories(true);
  const open = useOpenBudget();
  const showToast = useToast();
  const [modal, setModal] = useState<OpenModal>(null);

  //Il colore di ogni categoria, cercato per Id
  const colors = new Map(
    categories.data?.map((category) => [category.id, category.color]),
  );

  //Apre il piano: copia entrate, risparmio e voci dall'ultimo e inserisce le scadenze
  function openBudget() {
    open.mutate(
      { year, month },
      {
        onSuccess: () =>
          showToast({
            kind: "success",
            title: "Piano aperto",
            message: formatMonth(year, month),
          }),
        onError: (error) =>
          showToast({
            kind: "error",
            title: "Piano non aperto",
            message: errorMessage(error),
          }),
      },
    );
  }

  //Le categorie già nel piano: non si possono aggiungere due volte
  const plan = dashboard.data;
  const plannedIds = new Set(
    plan
      ? plan.categories.flatMap((c) =>
          c.isPlanned && c.categoryId !== null ? [c.categoryId] : [],
        )
      : [],
  );

  //Una categoria da modificare o da pianificare; senza categoria (Id nullo) non c'è nulla da pianificare
  function openTarget(category: CategoryProgressResponse) {
    if (category.categoryId !== null) {
      setModal({ kind: "target", category });
    }
  }

  let content;
  if (dashboard.isPending) {
    content = (
      <Card padded>
        <div className="stack" style={{ gap: 12 }}>
          <Skeleton width={180} height={24} />
          <Skeleton height={80} radius={12} />
          <Skeleton height={80} radius={12} />
        </div>
      </Card>
    );
  } else if (dashboard.isError) {
    content = (
      <Card>
        <ErrorState
          text={errorMessage(dashboard.error)}
          onRetry={() => dashboard.refetch()}
        />
      </Card>
    );
  } else if (dashboard.data === null) {
    //Il backend risponde 404: per l'app è uno stato normale, non un errore
    content = (
      <Card>
        <EmptyState
          title={`Il piano di ${formatMonth(year, month).toLowerCase()} non è aperto`}
          text="Aprendolo, Spiccioli copia entrate, risparmio e voci dall'ultimo piano e inserisce le scadenze delle spese ricorrenti."
          actions={
            <Button icon="plus" loading={open.isPending} onClick={openBudget}>
              Apri il piano
            </Button>
          }
        />
      </Card>
    );
  } else {
    const data = dashboard.data;
    content = (
      <div className="stack">
        <PlanCards dashboard={data} onEdit={(focus) => setModal({ kind: "budget", focus })} />

        <PlanCategories
          categories={data.categories}
          colors={colors}
          onAdd={() => setModal({ kind: "add" })}
          onEdit={openTarget}
          onPlan={openTarget}
        />

        {data.pendingPaymentsCount > 0 && (
          <Card className="plan-pending">
            <Icon name="repeat" />
            <div className="plan-pending-text">
              <div style={{ fontWeight: 600 }}>
                {data.pendingPaymentsCount}{" "}
                {data.pendingPaymentsCount === 1
                  ? "scadenza ancora da pagare"
                  : "scadenze ancora da pagare"}
              </div>
              <div className="t-small">
                {formatMoney(data.pendingPaymentsTotal)} in totale
              </div>
            </div>
            <Link className="card-link" to="/spese-ricorrenti">
              Vai al calendario
            </Link>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="stack">
      <MonthNavigator
        year={year}
        month={month}
        isCurrent={isCurrent}
        onPrevious={previous}
        onNext={next}
        onToday={today}
      />

      {/* Cambiando mese, il precedente resta visibile e attenuato finché arriva il nuovo */}
      <div className={dashboard.isPlaceholderData ? "list-stale" : undefined}>
        {content}
      </div>

      {plan && modal?.kind === "add" && (
        <AllocationModal
          year={year}
          month={month}
          plannedIds={plannedIds}
          onClose={() => setModal(null)}
        />
      )}
      {plan && modal?.kind === "target" && modal.category.categoryId !== null && (
        <AllocationModal
          year={year}
          month={month}
          plannedIds={plannedIds}
          target={{
            categoryId: modal.category.categoryId,
            name: modal.category.categoryName ?? "",
            allocated: modal.category.allocated,
          }}
          onClose={() => setModal(null)}
        />
      )}
      {plan && modal?.kind === "budget" && (
        <BudgetModal
          year={year}
          month={month}
          plannedIncome={plan.plannedIncome}
          savingsTarget={plan.savingsTarget}
          focus={modal.focus}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}