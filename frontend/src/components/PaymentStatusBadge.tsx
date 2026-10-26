import type { ScheduledPaymentResponse } from '../types';
import { Badge } from './Badge';

type PaymentStatusBadgeProps = {
  payment: ScheduledPaymentResponse;
  budgetOpen: boolean;
};

//Lo stato di una scadenza
//  pagata, scaduta, da pagare (piano aperto) o prevista (piano non ancora aperto)
export function PaymentStatusBadge({ payment, budgetOpen }: PaymentStatusBadgeProps) {
  if (payment.isPaid) {
    return <Badge variant="income">Pagata</Badge>;
  }
  if (payment.isOverdue) {
    return <Badge variant="expense">Scaduta</Badge>;
  }
  return <Badge variant="neutral">{budgetOpen ? 'Da pagare' : 'Prevista'}</Badge>;
}