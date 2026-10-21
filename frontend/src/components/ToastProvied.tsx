import { useRef, useState, type ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import { ToastContext, type ToastKind, type ToastOptions } from './toast-context';

type ToastItem = ToastOptions & { id: number; leaving: boolean };

const ICONS: Record<ToastKind, IconName> = { success: 'check', error: 'alert', info: 'info' };

//Possiede l'elenco delle notifiche visibili, e le mette a disposizione di tutta l'app
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  //Avvia l'animazione d'uscita, poi la toglie dall'elenco quando è finita
  function dismiss(id: number) {
    setToasts((list) => list.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 200);
  }

  function show(options: ToastOptions) {
    const id = nextId.current++;

    //Al massimo tre alla volta: le più vecchie lasciano il posto
    setToasts((list) => [...list, { ...options, id, leaving: false }].slice(-3));
    
    //Con un'azione resta più a lungo, per dare il tempo di premerla
    setTimeout(() => dismiss(id), options.action ? 6500 : 4200);
  }

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={t.leaving ? 'toast out' : 'toast'}>
            <span className={`t-ico t-ico-${t.kind}`}><Icon name={ICONS[t.kind]} /></span>
            <div className="t-body">
              <b>{t.title}</b>
              {t.message && <span>{t.message}</span>}
            </div>
            {t.action && (
              <button className="t-act" type="button" onClick={() => { t.action!.run(); dismiss(t.id); }}>
                {t.action.label}
              </button>
            )}
            <button className="t-x" type="button" aria-label="Chiudi notifica" onClick={() => dismiss(t.id)}>
              <Icon name="x" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}