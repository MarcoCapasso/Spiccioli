import { toIso } from './format';
import type { IsoDate } from './types';

export type CalendarCell = { date: IsoDate; day: number; inMonth: boolean };

//Le celle di un mese, a settimane intere da lunedì a domenica
export function buildMonthGrid(year: number, month: number): CalendarCell[] {
  const first = new Date(year, month - 1, 1);

  //getDay() vale 0 per la domenica: si sposta in modo che il lunedì sia il giorno 0
  const offset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month, 0).getDate();
  const total = Math.ceil((offset + daysInMonth) / 7) * 7;

  return Array.from({ length: total }, (_, index) => {
    
    //Un giorno fuori dal mese (numero zero o negativo, o oltre la fine) il Date lo sposta nel mese vicino
    const date = new Date(year, month - 1, 1 - offset + index);
    return { date: toIso(date), day: date.getDate(), inMonth: date.getMonth() === month - 1 };
  });
}

//Il mese prima o dopo: dicembre e gennaio scavalcano l'anno
export function shiftMonth(year: number, month: number, delta: number) {
  const date = new Date(year, month - 1 + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}