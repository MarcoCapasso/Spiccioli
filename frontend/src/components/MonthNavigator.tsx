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
      <IconButton icon="left" label="Mese precedente" onClick={onPrevious} />
      <span className="month-title" aria-live="polite">
        {formatMonth(year, month)}
      </span>
      <IconButton icon="right" label="Mese successivo" onClick={onNext} />
      {!isCurrent && (
        <Button variant="ghost" size="sm" onClick={onToday}>
          Oggi
        </Button>
      )}
    </div>
  );
}