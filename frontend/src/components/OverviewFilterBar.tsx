import { PERIOD_LABELS, type DateRange, type PeriodKey } from '../period';
import type { CategoryResponse } from '../types';
import { Input } from './Input';
import { Select } from './Select';
import { Tabs } from './Tabs';

//I periodi, nell'ordine in cui compaiono
const PERIODS: PeriodKey[] = ['month', '30d', 'year', 'all', 'custom'];

type OverviewFilterBarProps = {
  period: PeriodKey;
  onPeriodChange: (period: PeriodKey) => void;
  //Le date del periodo personalizzato: testi vuoti finché non si scelgono
  custom: { from: string; to: string };
  onCustomChange: (range: Partial<DateRange & { from: string; to: string }>) => void;
  categoryId: string;
  onCategoryChange: (categoryId: string) => void;
  categories: CategoryResponse[];
};

//Periodo, intervallo personalizzato e categoria della Panoramica
export function OverviewFilterBar({
  period,
  onPeriodChange,
  custom,
  onCustomChange,
  categoryId,
  onCategoryChange,
  categories,
}: OverviewFilterBarProps) {
  return (
    <div className="filters" role="group" aria-label="Filtri della panoramica">
      <Tabs
        label="Periodo"
        value={period}
        onChange={onPeriodChange}
        options={PERIODS.map((key) => ({ value: key, label: PERIOD_LABELS[key] }))}
      />

      {period === 'custom' && (
        <>
          <Input
            small
            id="ov-from"
            type="date"
            aria-label="Dal"
            title="Dal"
            value={custom.from}
            max={custom.to || undefined}
            onChange={(e) => onCustomChange({ from: e.target.value })}
          />
          <span className="t-small">–</span>
          <Input
            small
            id="ov-to"
            type="date"
            aria-label="Al"
            title="Al"
            value={custom.to}
            min={custom.from || undefined}
            onChange={(e) => onCustomChange({ to: e.target.value })}
          />
        </>
      )}

      <Select
        small
        id="ov-category"
        aria-label="Categoria"
        value={categoryId}
        onChange={(e) => onCategoryChange(e.target.value)}
      >
        <option value="">Tutte le categorie</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.isArchived ? `${category.name} (archiviata)` : category.name}
          </option>
        ))}
      </Select>
    </div>
  );
}