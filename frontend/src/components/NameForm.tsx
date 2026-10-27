import { useState, type FormEvent } from 'react';
import { useUpdateProfile } from '../api/account';
import { errorMessage, fieldErrors } from '../api/client';

//Modifica il nome mostrato nell'app
export function NameForm({ currentName }: { currentName: string }) {
  const [name, setName] = useState(currentName);
  const update = useUpdateProfile();

  const trimmed = name.trim();
  const unchanged = trimmed === currentName;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (trimmed === '' || unchanged) {
      return;
    }
    update.mutate(trimmed);
  }

  return (
    <form className="settings-form" onSubmit={handleSubmit}>
      <label className="settings-label" htmlFor="display-name">
        Nome visualizzato
      </label>
      <div className="settings-row">
        <input
          id="display-name"
          className="settings-input"
          value={name}
          maxLength={100}
          autoComplete="name"
          onChange={(event) => setName(event.target.value)}
        />
        <button type="submit" className="btn btn-primary" disabled={trimmed === '' || unchanged || update.isPending}>
          Salva
        </button>
      </div>
      {update.isError && (
        <p className="settings-error" role="alert">
          {fieldErrors(update.error).firstName ?? errorMessage(update.error)}
        </p>
      )}
      {update.isSuccess && unchanged && (
        <p className="t-small" role="status">
          Salvato.
        </p>
      )}
    </form>
  );
}