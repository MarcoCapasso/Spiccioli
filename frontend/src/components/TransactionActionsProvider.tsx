import { useState, type ReactNode } from 'react';
import { errorMessage } from '../api/client';
import { useCreateTransaction, useDeleteTransaction, type TransactionInput } from '../api/queries';
import { formatShortDate, formatSigned, transactionTitle } from '../format';
import type { TransactionResponse } from '../types';
import { ConfirmModal } from './ConfirmModal';
import { useToast } from './toast-context';
import { TransactionActionsContext } from './transaction-actions-context';
import { TransactionModal } from './TransactionModal';

//La finestra aperta in questo momento
type OpenModal =
  | { kind: 'new' }
  | { kind: 'edit'; transaction: TransactionResponse }
  | { kind: 'delete'; transaction: TransactionResponse };

//Possiede le finestre dei movimenti e le mette a disposizione di tutta l'app
export function TransactionActionsProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<OpenModal | null>(null);
  const remove = useDeleteTransaction();
  const recreate = useCreateTransaction();
  const showToast = useToast();

  const close = () => setModal(null);

  //"Annulla" dopo l'eliminazione
  //  il movimento viene ricreato con gli stessi dati, e ottiene un nuovo Id
  function restore(transaction: TransactionResponse, categoryId: number) {
    const input: TransactionInput = {
      amount: transaction.amount,
      date: transaction.date,
      type: transaction.type,
      categoryId,
      description: transaction.description,
      note: transaction.note,
    };

    recreate.mutate(input, {
      onSuccess: () => showToast({ kind: 'success', title: 'Movimento ripristinato' }),
      onError: (error) =>
        showToast({ kind: 'error', title: 'Movimento non ripristinato', message: errorMessage(error) }),
    });
  }

  function confirmDelete(transaction: TransactionResponse) {
    const { categoryId } = transaction;

    remove.mutate(transaction.id, {
      onSuccess: () => {
        close();
        showToast({
          kind: 'info',
          title: 'Movimento eliminato',
          //Senza categoria non si può ricreare: il backend la richiede
          action: categoryId === null ? undefined : { label: 'Annulla', run: () => restore(transaction, categoryId) },
        });
      },
      onError: (error) => {
        close();
        showToast({ kind: 'error', title: 'Movimento non eliminato', message: errorMessage(error) });
      },
    });
  }

  return (
    <TransactionActionsContext.Provider
      value={{
        openNew: () => setModal({ kind: 'new' }),
        openEdit: (transaction) => setModal({ kind: 'edit', transaction }),
        askDelete: (transaction) => setModal({ kind: 'delete', transaction }),
      }}
    >
      {children}

      {modal?.kind === 'new' && <TransactionModal onClose={close} />}
      {modal?.kind === 'edit' && <TransactionModal transaction={modal.transaction} onClose={close} />}
      {modal?.kind === 'delete' && (
        <ConfirmModal
          title="Eliminare questo movimento?"
          confirmLabel="Elimina movimento"
          loading={remove.isPending}
          onConfirm={() => confirmDelete(modal.transaction)}
          onClose={close}
        >
          <b style={{ color: 'var(--text)' }}>{transactionTitle(modal.transaction)}</b> (
          {formatSigned(modal.transaction.amount, modal.transaction.type)}, {formatShortDate(modal.transaction.date)}) verrà
          rimosso dallo storico e dai totali.
        </ConfirmModal>
      )}
    </TransactionActionsContext.Provider>
  );
}