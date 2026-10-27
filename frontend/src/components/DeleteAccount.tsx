import { useState } from 'react';
import { useDeleteAccount } from '../api/account';
import { errorMessage } from '../api/client';
import { useAuth } from '../auth/auth-context';

const CONFIRM_WORD = 'ELIMINA';

//Elimina l'account in due passi: prima si apre la conferma, poi si scrive la parola
export function DeleteAccount() {
  const { signOut } = useAuth();
  const remove = useDeleteAccount();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');

  const confirmed = typed.trim().toUpperCase() === CONFIRM_WORD;

  function handleDelete() {
    remove.mutate(undefined, {
      //L'account non esiste più: si esce, e l'app riparte dalla schermata di accesso
      onSuccess: () => {
        void signOut();
      },
    });
  }

  function handleCancel() {
    setOpen(false);
    setTyped('');
    remove.reset();
  }

  if (!open) {
    return (
      <button type="button" className="btn btn-danger" onClick={() => setOpen(true)}>
        Elimina account…
      </button>
    );
  }

  return (
    <div className="settings-form">
      <p className="t-small" style={{ margin: 0 }}>
        Verranno eliminati per sempre il tuo account e tutti i dati: movimenti, categorie, spese ricorrenti e piani
        mensili. L'operazione non si può annullare.
      </p>

      <label className="settings-label" htmlFor="confirm-delete">
        Per confermare scrivi {CONFIRM_WORD}
      </label>
      <input
        id="confirm-delete"
        className="settings-input"
        value={typed}
        autoComplete="off"
        onChange={(event) => setTyped(event.target.value)}
      />

      {remove.isError && (
        <p className="settings-error" role="alert">
          {errorMessage(remove.error)}
        </p>
      )}

      <div className="settings-row">
        <button type="button" className="btn btn-danger" disabled={!confirmed || remove.isPending} onClick={handleDelete}>
          {remove.isPending ? 'Elimino…' : 'Elimina per sempre'}
        </button>
        <button type="button" className="btn" disabled={remove.isPending} onClick={handleCancel}>
          Annulla
        </button>
      </div>
    </div>
  );
}