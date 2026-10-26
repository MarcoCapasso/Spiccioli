import { todayIso } from './format';
import type { RecurrenceFrequency, RecurringExpenseResponse } from './types';

//Le frequenze, dalla più breve alla più lunga
export const FREQUENCIES: RecurrenceFrequency[] = ['Monthly', 'Bimonthly', 'Quarterly', 'SemiAnnual', 'Annual'];

//Un testo per ogni frequenza
//  se ne aggiungi una al tipo, il compilatore ti dice che manca qui
export const FREQUENCY_LABELS: Record<RecurrenceFrequency, string> = {
  Monthly: 'Ogni mese',
  Bimonthly: 'Ogni 2 mesi',
  Quarterly: 'Ogni 3 mesi',
  SemiAnnual: 'Ogni 6 mesi',
  Annual: 'Ogni anno',
};

//Terminata
//  la data di fine è già passata (le date ISO si confrontano come testi)
export function isEnded(expense: RecurringExpenseResponse) {
  return expense.endDate !== null && expense.endDate < todayIso();
}

export type RecurrenceStatus = 'active' | 'ending' | 'ended';

//Attiva (senza fine), in chiusura (fine oggi o futura), terminata (fine passata)
export function recurrenceStatus(expense: RecurringExpenseResponse): RecurrenceStatus {
  if (expense.endDate === null) {
    return 'active';
  }
  return expense.endDate < todayIso() ? 'ended' : 'ending';
}