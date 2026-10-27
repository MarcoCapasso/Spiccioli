import { formatBalance, formatMoney } from '../format';
import type { DashboardResponse } from '../types';
import { Button } from './Button';
import type { BudgetField } from "../components/BudgetModal";
import { Card } from './Card';
import { IconButton } from './IconButton';

//La percentuale per la barra, da 0 a 100, solo UI
function percent(part: number, whole: number) {
  return whole > 0 ? Math.min(100, Math.max(0, Math.round((part / whole) * 100))) : 0;
}

type ProgressBarProps = { label: string; value: number; color: string };

//Barra di avanzamento, con il suo nome per i lettori di schermo
function ProgressBar({ label, value, color }: ProgressBarProps) {
  return (
    <div className="plan-bar" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}>
      <span style={{ width: `${value}%`, background: color }} />
    </div>
  );
}

type EditActionProps = {
  isSet: boolean;
  name: string;
  onEdit: () => void;
};

//L'azione di una scheda
function EditAction({ isSet, name, onEdit }: EditActionProps) {
  if (!isSet) {
    return (
      <Button variant="secondary" size="sm" aria-label={`Imposta ${name}`} onClick={onEdit}>
        Imposta
      </Button>
    );
  }

  return <IconButton className="plan-edit" icon="edit" label={`Modifica ${name}`} onClick={onEdit} />;
}

type PlanCardsProps = {
  dashboard: DashboardResponse;
  onEdit: (field: BudgetField) => void;
};

//Entrate, risparmio e quanto resta da assegnare alle categorie
export function PlanCards({ dashboard, onEdit }: PlanCardsProps) {
  const { plannedIncome, actualIncome, savingsTarget, actualSavings, unallocated } = dashboard;

  //Senza un obiettivo il risparmio non ha un riferimento: niente cifra, solo un trattino
  const hasSavingsTarget = savingsTarget > 0;
  const savingsReached = hasSavingsTarget && actualSavings >= savingsTarget;
  const savingsTone = !hasSavingsTarget ? 'muted' : actualSavings < 0 ? 'neg' : savingsReached ? 'pos' : '';
  const overPlanned = unallocated < 0;

  return (
    <section className="plan-cards" aria-label="Riepilogo del piano">
      <Card className="plan-card">
        <div className="plan-label">Entrate</div>
        <div className="plan-value-row">
          <div className="plan-value num pos">{formatMoney(actualIncome)}</div>
          <EditAction isSet={plannedIncome > 0} name="le entrate previste" onEdit={() => onEdit('plannedIncome')} />
        </div>
        <div className="plan-sub">
          {plannedIncome > 0 ? `previste ${formatMoney(plannedIncome)}` : 'nessuna entrata prevista'}
        </div>
        {plannedIncome > 0 && (
          <ProgressBar label="Entrate rispetto al previsto" value={percent(actualIncome, plannedIncome)} color="var(--success)" />
        )}
      </Card>

      <Card className="plan-card">
        <div className="plan-label">Risparmio</div>
        <div className="plan-value-row">
          <div className={`plan-value num ${savingsTone}`}>
            {hasSavingsTarget ? formatBalance(actualSavings) : '—'}
          </div>
          <EditAction isSet={hasSavingsTarget} name="l'obiettivo di risparmio" onEdit={() => onEdit('savingsTarget')} />
        </div>
        <div className="plan-sub">
          {hasSavingsTarget ? `obiettivo ${formatMoney(savingsTarget)}` : 'nessun obiettivo impostato'}
        </div>
        {hasSavingsTarget && (
          <ProgressBar
            label="Risparmio rispetto all'obiettivo"
            value={percent(actualSavings, savingsTarget)}
            color={savingsReached ? 'var(--success)' : 'var(--primary)'}
          />
        )}
      </Card>

      <Card className={overPlanned ? 'plan-card plan-card-alert' : 'plan-card'}>
        <div className="plan-label">Da assegnare</div>
        <div className="plan-value-row">
          <div className={`plan-value num ${overPlanned ? 'neg' : ''}`}>{formatBalance(unallocated)}</div>
        </div>
        <div className="plan-sub">
          {overPlanned
            ? `Pianificato oltre le entrate di ${formatMoney(Math.abs(unallocated))}`
            : 'alle categorie, dopo il risparmio'}
        </div>
      </Card>
    </section>
  );
}