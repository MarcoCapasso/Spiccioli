import { formatMonth } from '../format';
import { Button } from './Button';
import { IconButton } from './IconButton';

type MonthNavigatorProps = {
  year: number;
  month: number;
  isCurrent: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
};

//Le frecce per cambiare mese, il titolo e il ritorno a "oggi"
export function MonthNavigator({ year, month, isCurrent, onPrevious, onNext, onToday }: MonthNavigatorProps) {
  return (
    <div className="month-nav">
      <div className="month-nav-row">
        <IconButton icon="left" label="Mese precedente" onClick={onPrevious} />
        <span className="month-title" aria-live="polite">
          {formatMonth(year, month)}
        </span>
        <IconButton icon="right" label="Mese successivo" onClick={onNext} />
      </div>
      {/* Riga sempre presente: sul mese corrente il pulsante si nasconde ma lo spazio resta */}
      <div className={isCurrent ? 'month-nav-today hidden' : 'month-nav-today'}>
        <Button variant="ghost" size="sm" onClick={onToday}>
          Oggi
        </Button>
      </div>
    </div>
  );
}