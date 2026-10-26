import { hasActiveFilters, type FilterState } from '../filters';
import type { CategoryResponse } from '../types';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { Tabs } from './Tabs';

type TransactionFilterBarProps = {
  filters: FilterState;
  counts?: { all: number; income: number; expense: number };
  categories: CategoryResponse[];
  onChange: (patch: Partial<FilterState>) => void;
  onReset: () => void;
};

//Schede per tipo, ricerca, categoria e intervallo di date
export function TransactionFilterBar({ filters, counts, categories, onChange, onReset }: TransactionFilterBarProps) {
  return (
    <div className="toolbar">
      <div className="toolbar-row">
        <Tabs
          label="Tipo di movimento"
          value={filters.type}
          onChange={(type) => onChange({ type })}
          options={[
            { value: 'all', label: 'Tutti', count: counts?.all },
            { value: 'Income', label: 'Entrate', count: counts?.income },
            { value: 'Expense', label: 'Uscite', count: counts?.expense },
          ]}
        />
        <div className="spacer" />
        {hasActiveFilters(filters) && (
          <Button variant="ghost" size="sm" icon="x" onClick={onReset}>
            Azzera filtri
          </Button>
        )}
      </div>

      <div className="toolbar-row toolbar-filters">
        <Input
          small
          icon="search"
          id="tx-search"
          type="search"
          aria-label="Cerca"
          placeholder="Cerca per titolo o nota"
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
        />
        <Select
          small
          id="tx-category"
          aria-label="Categoria"
          value={filters.categoryId}
          onChange={(e) => onChange({ categoryId: e.target.value })}
        >
          <option value="">Tutte le categorie</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.isArchived ? `${category.name} (archiviata)` : category.name}
            </option>
          ))}
        </Select>

        {/* Le due date stanno insieme, ognuna con la sua etichetta sopra */}
        <div className="toolbar-dates">
          <div className="toolbar-date">
            <label className="toolbar-label" htmlFor="tx-from">
              Dal
            </label>
            <Input
              small
              id="tx-from"
              type="date"
              value={filters.from}
              max={filters.to || undefined}
              onChange={(e) => onChange({ from: e.target.value })}
            />
          </div>
          <div className="toolbar-date">
            <label className="toolbar-label" htmlFor="tx-to">
              Al
            </label>
            <Input
              small
              id="tx-to"
              type="date"
              value={filters.to}
              min={filters.from || undefined}
              onChange={(e) => onChange({ to: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}