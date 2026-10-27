import { useState, type FormEvent } from 'react';
import { passwordErrorMessage, useChangePassword } from '../api/account';

const MIN_LENGTH = 8;

//Cambia la password (solo per gli account con email)
export function ChangePasswordForm() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const change = useChangePassword();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLocalError(null);

    if (password.length < MIN_LENGTH) {
      setLocalError(`La password deve avere almeno ${MIN_LENGTH} caratteri.`);
      return;
    }
    if (password !== confirm) {
      setLocalError('Le due password non coincidono.');
      return;
    }

    change.mutate(password, {
      onSuccess: () => {
        setPassword('');
        setConfirm('');
      },
    });
  }

  const error = localError ?? (change.isError ? passwordErrorMessage(change.error) : null);

  return (
    <form className="settings-form" onSubmit={handleSubmit}>
      <label className="settings-label" htmlFor="new-password">
        Nuova password
      </label>
      <input
        id="new-password"
        className="settings-input"
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />

      <label className="settings-label" htmlFor="confirm-password">
        Ripeti la nuova password
      </label>
      <input
        id="confirm-password"
        className="settings-input"
        type="password"
        autoComplete="new-password"
        value={confirm}
        onChange={(event) => setConfirm(event.target.value)}
      />

      {error && (
        <p className="settings-error" role="alert">
          {error}
        </p>
      )}
      {change.isSuccess && !error && (
        <p className="t-small" role="status">
          Password aggiornata.
        </p>
      )}

      <div className="settings-row">
        <button type="submit" className="btn btn-primary" disabled={change.isPending}>
          Cambia password
        </button>
      </div>
    </form>
  );
}