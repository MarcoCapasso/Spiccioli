import { useState } from "react";
import { errorMessage } from "../api/client";
import {
  useDeleteVoucherTopUp,
  useDeleteVoucherUsage,
  useVoucherSummary,
  useVoucherTopUps,
  useVoucherUsages,
} from "../api/queries";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { ConfirmModal } from "../components/ConfirmModal";
import { Fab } from "../components/Fab";
import { IconButton } from "../components/IconButton";
import { EmptyState, ErrorState, Skeleton } from "../components/States";
import { Tabs } from "../components/Tabs";
import { useToast } from "../components/toast-context";
import { VoucherTopUpModal } from "../components/VoucherTopUpModal";
import { VoucherUseModal } from "../components/VoucherUseModal";
import { VoucherValueModal } from "../components/VoucherValueModal";
import { formatMoney, formatShortDate, formatSigned } from "../format";
import type { VoucherTopUpResponse, VoucherUsageResponse } from "../types";
import { voucherLabel } from "../vouchers";

type Tab = "usages" | "topups";

//La finestra aperta in questo momento, o nessuna
type OpenModal =
  | { kind: "value" }
  | { kind: "topup" }
  | { kind: "use" }
  | { kind: "delete-usage"; usage: VoucherUsageResponse }
  | { kind: "delete-topup"; topUp: VoucherTopUpResponse }
  | null;

//La pagina dei buoni pasto: un portafoglio a parte, che non tocca movimenti e piano
export function VouchersPage() {
  const summary = useVoucherSummary();
  const usages = useVoucherUsages();
  const topUps = useVoucherTopUps();
  const removeUsage = useDeleteVoucherUsage();
  const removeTopUp = useDeleteVoucherTopUp();
  const showToast = useToast();

  const [tab, setTab] = useState<Tab>("usages");
  const [modal, setModal] = useState<OpenModal>(null);
  const close = () => setModal(null);

  if (summary.isPending) {
    return (
      <div className="stack">
        <Skeleton height={96} radius={16} />
        <Skeleton height={220} radius={16} />
      </div>
    );
  }

  if (summary.isError) {
    return <ErrorState onRetry={() => summary.refetch()} />;
  }

  const { unitValue, balance, remainingVouchers, totalTopUps, totalUsed } = summary.data;
  const hasValue = unitValue !== null;
  const canUse = hasValue && remainingVouchers > 0;

  function confirmDeleteUsage(usage: VoucherUsageResponse) {
    removeUsage.mutate(usage.id, {
      onSuccess: () => {
        close();
        showToast({
          kind: "info",
          title: "Uso eliminato",
          message: `${voucherLabel(usage.count)} tornano nel credito.`,
        });
      },
      onError: (error) => {
        close();
        showToast({ kind: "error", title: "Uso non eliminato", message: errorMessage(error) });
      },
    });
  }

  function confirmDeleteTopUp(topUp: VoucherTopUpResponse) {
    removeTopUp.mutate(topUp.id, {
      onSuccess: () => {
        close();
        showToast({
          kind: "info",
          title: "Ricarica eliminata",
          message: `${formatMoney(topUp.amount)} tolti dal credito.`,
        });
      },
      onError: (error) => {
        close();
        showToast({ kind: "error", title: "Ricarica non eliminata", message: errorMessage(error) });
      },
    });
  }

  //Il + del telefono segue la scheda: usa buoni, oppure nuova ricarica
  function handleFab() {
    if (tab === "topups") {
      setModal({ kind: "topup" });
    } else if (!hasValue) {
      setModal({ kind: "value" });
    } else if (canUse) {
      setModal({ kind: "use" });
    } else {
      setModal({ kind: "topup" });
    }
  }

  const fabLabel =
    tab === "topups" ? "Nuova ricarica" : !hasValue ? "Imposta il valore del buono" : canUse ? "Usa buoni" : "Nuova ricarica";

  return (
    <div className="stack">
      <section className="plan-cards" aria-label="Riepilogo dei buoni pasto">
        <Card className="plan-card">
          <div className="plan-label">Credito residuo</div>
          <div className="plan-value-row">
            <div className="plan-value num">{formatMoney(balance)}</div>
          </div>
          <div className="plan-sub">
            ricaricati {formatMoney(totalTopUps)} · usati {formatMoney(totalUsed)}
          </div>
        </Card>

        <Card className="plan-card">
          <div className="plan-label">Buoni rimasti</div>
          <div className="plan-value-row">
            <div className={hasValue ? "plan-value num" : "plan-value num muted"}>{hasValue ? remainingVouchers : "—"}</div>
          </div>
          <div className="plan-sub">
            {hasValue ? `da ${formatMoney(unitValue)} ciascuno` : "imposta prima il valore del buono"}
          </div>
        </Card>

        <Card className="plan-card">
          <div className="plan-label">Valore di un buono</div>
          <div className="plan-value-row">
            <div className={hasValue ? "plan-value num" : "plan-value num muted"}>
              {hasValue ? formatMoney(unitValue) : "—"}
            </div>
            {hasValue ? (
              <IconButton
                className="plan-edit"
                icon="edit"
                label="Modifica il valore del buono"
                onClick={() => setModal({ kind: "value" })}
              />
            ) : (
              <Button variant="secondary" size="sm" onClick={() => setModal({ kind: "value" })}>
                Imposta
              </Button>
            )}
          </div>
          <div className="plan-sub">{hasValue ? "gli usi passati non cambiano" : "per esempio 5, 7 o 8 euro"}</div>
        </Card>
      </section>

      <div className="row">
        <Button icon="coin" disabled={!canUse} onClick={() => setModal({ kind: "use" })}>
          Usa buoni
        </Button>
        <Button variant="secondary" icon="plus" onClick={() => setModal({ kind: "topup" })}>
          Nuova ricarica
        </Button>
        {hasValue && remainingVouchers === 0 && (
          <span className="t-small">Il credito è finito: registra una ricarica per continuare.</span>
        )}
      </div>

      <div>
        <Tabs
          label="Cronologia"
          value={tab}
          onChange={setTab}
          options={[
            { value: "usages", label: "Utilizzi", count: usages.data?.length },
            { value: "topups", label: "Ricariche", count: topUps.data?.length },
          ]}
        />
      </div>

      {tab === "usages" ? (
        usages.isPending ? (
          <Skeleton height={160} radius={16} />
        ) : usages.isError ? (
          <ErrorState onRetry={() => usages.refetch()} />
        ) : usages.data.length === 0 ? (
          <Card>
            <EmptyState
              title="Nessun buono usato"
              text={
                hasValue
                  ? "Quando usi dei buoni, registrali qui: il credito si scala da solo."
                  : "Imposta il valore del buono e registra una ricarica per iniziare."
              }
            />
          </Card>
        ) : (
          <Card>
            <ul className="tx-list">
              {usages.data.map((usage) => (
                <li key={usage.id} className="tx tx-with-actions">
                  <div className="tx-ico voucher-ico" aria-hidden="true">
                    {usage.count}
                  </div>
                  <div className="tx-main">
                    <div className="tx-title">{voucherLabel(usage.count)}</div>
                    <div className="tx-meta">
                      <span className="t-xs">{formatShortDate(usage.date)}</span>
                      <span className="t-xs">
                        {usage.count} × {formatMoney(usage.unitValue)}
                      </span>
                    </div>
                    {usage.note && <div className="tx-note">{usage.note}</div>}
                  </div>
                  <div className="tx-amt exp">
                    <div className="num">{formatSigned(usage.total, "Expense")}</div>
                  </div>
                  <div className="tx-actions">
                    <IconButton
                      icon="trash"
                      label={`Elimina l'uso del ${formatShortDate(usage.date)}`}
                      danger
                      onClick={() => setModal({ kind: "delete-usage", usage })}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )
      ) : topUps.isPending ? (
        <Skeleton height={160} radius={16} />
      ) : topUps.isError ? (
        <ErrorState onRetry={() => topUps.refetch()} />
      ) : topUps.data.length === 0 ? (
        <Card>
          <EmptyState
            title="Nessuna ricarica"
            text="Registra il credito che ti accredita l'azienda: da lì si scalano i buoni."
            actions={
              <Button icon="plus" onClick={() => setModal({ kind: "topup" })}>
                Nuova ricarica
              </Button>
            }
          />
        </Card>
      ) : (
        <Card>
          <ul className="tx-list">
            {topUps.data.map((topUp) => (
              <li key={topUp.id} className="tx tx-with-actions">
                <div className="tx-ico voucher-ico" aria-hidden="true">
                  +
                </div>
                <div className="tx-main">
                  <div className="tx-title">Ricarica</div>
                  <div className="tx-meta">
                    <span className="t-xs">{formatShortDate(topUp.date)}</span>
                  </div>
                </div>
                <div className="tx-amt inc">
                  <div className="num">{formatSigned(topUp.amount, "Income")}</div>
                </div>
                <div className="tx-actions">
                  <IconButton
                    icon="trash"
                    label={`Elimina la ricarica del ${formatShortDate(topUp.date)}`}
                    danger
                    onClick={() => setModal({ kind: "delete-topup", topUp })}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Fab icon="plus" label={fabLabel} onClick={handleFab} />

      {modal?.kind === "value" && <VoucherValueModal current={unitValue} onClose={close} />}
      {modal?.kind === "topup" && <VoucherTopUpModal onClose={close} />}
      {modal?.kind === "use" && <VoucherUseModal summary={summary.data} onClose={close} />}

      {modal?.kind === "delete-usage" && (
        <ConfirmModal
          title="Eliminare questo uso?"
          confirmLabel="Elimina uso"
          loading={removeUsage.isPending}
          onConfirm={() => confirmDeleteUsage(modal.usage)}
          onClose={close}
        >
          {voucherLabel(modal.usage.count)} del {formatShortDate(modal.usage.date)} (
          {formatMoney(modal.usage.total)}): il credito torna disponibile.
        </ConfirmModal>
      )}

      {modal?.kind === "delete-topup" && (
        <ConfirmModal
          title="Eliminare questa ricarica?"
          confirmLabel="Elimina ricarica"
          loading={removeTopUp.isPending}
          onConfirm={() => confirmDeleteTopUp(modal.topUp)}
          onClose={close}
        >
          Ricarica di {formatMoney(modal.topUp.amount)} del {formatShortDate(modal.topUp.date)}. Non si può eliminare se il
          credito che resterebbe non copre i buoni già usati.
        </ConfirmModal>
      )}
    </div>
  );
}
