import { PERIODS, PERIOD_LABELS, type PeriodFilterProps, type PeriodKey } from '../period';
import { Button } from './Button';
import { Field } from './Field';
import { Input } from './Input';
import { Modal } from './Modal';
import { Select } from './Select';

type OverviewFilterSheetProps = PeriodFilterProps & {
  onReset: () => void;
  onClose: () => void;
};

//Periodo e categoria della Panoramica, per il telefono: le scelte valgono subito, "Fatto" chiude
export function OverviewFilterSheet({
  period,
  onPeriodChange,
  custom,
  onCustomChange,
  categoryId,
  onCategoryChange,
  categories,
  onReset,
  onClose,
}: OverviewFilterSheetProps) {
  return (
    <Modal
      title="Filtri"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onReset}>
            Azzera
          </Button>
          <Button onClick={onClose}>Fatto</Button>
        </>
      }
    >
      <div className="modal-form">
        <Field id="ovm-period" label="Periodo">
          <Select id="ovm-period" value={period} onChange={(e) => onPeriodChange(e.target.value as PeriodKey)}>
            {PERIODS.map((key) => (
              <option key={key} value={key}>
                {PERIOD_LABELS[key]}
              </option>
            ))}
          </Select>
        </Field>

        {period === 'custom' && (
          <div className="grid-2">
            <Field id="ovm-from" label="Dal">
              <Input
                id="ovm-from"
                type="date"
                value={custom.from}
                max={custom.to || undefined}
                onChange={(e) => onCustomChange({ from: e.target.value })}
              />
            </Field>
            <Field id="ovm-to" label="Al">
              <Input
                id="ovm-to"
                type="date"
                value={custom.to}
                min={custom.from || undefined}
                onChange={(e) => onCustomChange({ to: e.target.value })}
              />
            </Field>
          </div>
        )}

        <Field id="ovm-category" label="Categoria">
          <Select id="ovm-category" value={categoryId} onChange={(e) => onCategoryChange(e.target.value)}>
            <option value="">Tutte le categorie</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.isArchived ? `${category.name} (archiviata)` : category.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>
    </Modal>
  );
}