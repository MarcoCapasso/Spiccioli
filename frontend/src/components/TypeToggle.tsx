import type { TransactionType } from '../types';
import { Icon } from './Icon';

type TypeToggleProps = {
  value: TransactionType;
  onChange: (value: TransactionType) => void;
};

//Sceglie il tipo di movimento
export function TypeToggle({ value, onChange }: TypeToggleProps) {
  return (
    <div className="seg" role="group" aria-label="Tipo di movimento">
      <button
        type="button"
        className="exp"
        aria-pressed={value === 'Expense'}
        onClick={() => onChange('Expense')}
      >
        <Icon name="down" />
        Uscita
      </button>
      <button
        type="button"
        className="inc"
        aria-pressed={value === 'Income'}
        onClick={() => onChange('Income')}
      >
        <Icon name="up" />
        Entrata
      </button>
    </div>
  );
}