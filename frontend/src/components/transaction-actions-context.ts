import { createContext, useContext } from 'react';
import type { TransactionResponse } from '../types';

//Le azioni sui movimenti
export type TransactionActions = {
  openNew: () => void;
  openEdit: (transaction: TransactionResponse) => void;
  askDelete: (transaction: TransactionResponse) => void;
};

export const TransactionActionsContext = createContext<TransactionActions | null>(null);

export function useTransactionActions() {
  const actions = useContext(TransactionActionsContext);
  if (!actions) {
    throw new Error('useTransactionActions va usato dentro un TransactionActionsProvider.');
  }
  return actions;
}