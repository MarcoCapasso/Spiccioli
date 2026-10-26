import { useState } from 'react';
import { shiftMonth } from './calendar';

//Il mese mostrato da una pagina: parte da quello corrente e si sposta con le frecce
export function useMonth() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const [shown, setShown] = useState({ year: currentYear, month: currentMonth });

  return {
    year: shown.year,
    month: shown.month,
    isCurrent: shown.year === currentYear && shown.month === currentMonth,
    previous: () => setShown((s) => shiftMonth(s.year, s.month, -1)),
    next: () => setShown((s) => shiftMonth(s.year, s.month, 1)),
    today: () => setShown({ year: currentYear, month: currentMonth }),
  };
}