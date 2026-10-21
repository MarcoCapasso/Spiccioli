import { createContext, useContext } from 'react';

export type ToastKind = 'success' | 'error' | 'info';

export type ToastOptions = {
  kind: ToastKind;
  title: string;
  message?: string;
  //Un'azione facoltativa, come "Annulla" dopo un'eliminazione
  action?: { label: string; run: () => void };
};

//La funzione per mostrare una notifica
export const ToastContext = createContext<((options: ToastOptions) => void) | null>(null);

//Mostra una notifica da qualunque componente sotto il ToastProvider
export function useToast() {
  const show = useContext(ToastContext);
  if (!show) {
    throw new Error('useToast va usato dentro un ToastProvider.');
  }
  return show;
}