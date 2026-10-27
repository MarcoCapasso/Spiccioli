import { Link } from 'react-router';
import { useExportTransactions } from '../api/account';
import { errorMessage } from '../api/client';
import { useProfile } from '../api/queries';
import { useAccountInfo } from '../auth/useAccountInfo';
import { Avatar } from '../components/Avatar';
import { Card, CardHeader } from '../components/Card';
import { ChangePasswordForm } from '../components/ChangePasswordForm';
import { DeleteAccount } from '../components/DeleteAccount';
import { NameForm } from '../components/NameForm';
import { ThemeSelector } from '../components/ThemeSelector';

//Le impostazioni: account, aspetto, dati, password, privacy ed eliminazione
export function SettingsPage() {
  const account = useAccountInfo();
  const { data: profile } = useProfile();
  const exporter = useExportTransactions();

  return (
    <div className="stack">
      <Card>
        <CardHeader title="Account" />
        <div style={{ padding: '4px 20px 20px' }}>
          {account && (
            <div className="account-head">
              <div className="who">
                <div className="t-h3">{account.name}</div>
                <div className="t-small">{account.email}</div>
              </div>
              <Avatar name={account.name} imageUrl={account.avatarUrl} size="lg" />
            </div>
          )}
          {/* Il modulo parte solo a profilo caricato: il campo si riempie col nome vero */}
          {profile && (
            <div style={{ marginTop: 20 }}>
              <NameForm currentName={profile.firstName} />
            </div>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader title="Aspetto" />
        <div style={{ padding: '4px 20px 20px' }}>
          <p className="t-small" style={{ marginTop: 0 }}>
            «Sistema» segue il tema del tuo dispositivo.
          </p>
          <ThemeSelector />
        </div>
      </Card>

      <Card>
        <CardHeader title="I tuoi dati" />
        <div style={{ padding: '4px 20px 20px' }}>
          <p className="t-small" style={{ marginTop: 0 }}>
            Scarica tutti i tuoi movimenti in un file CSV, che puoi aprire con Excel o con un altro foglio di calcolo.
          </p>
          <button type="button" className="btn" disabled={exporter.isPending} onClick={() => exporter.mutate()}>
            {exporter.isPending ? 'Preparo il file…' : 'Scarica i movimenti (CSV)'}
          </button>
          {exporter.isError && (
            <p className="settings-error" role="alert" style={{ marginTop: 10 }}>
              {errorMessage(exporter.error)}
            </p>
          )}
        </div>
      </Card>

      {account?.hasPassword && (
        <Card>
          <CardHeader title="Password" />
          <div style={{ padding: '4px 20px 20px' }}>
            <ChangePasswordForm />
          </div>
        </Card>
      )}

      <Card>
        <CardHeader title="Privacy" />
        <div style={{ padding: '4px 20px 20px' }}>
          <p className="t-small" style={{ marginTop: 0 }}>
            Come Spiccioli tratta i tuoi dati, e quali diritti hai.
          </p>
          <Link className="card-link" to="/privacy">
            Leggi l'informativa privacy
          </Link>
        </div>
      </Card>

      <Card>
        <CardHeader title="Elimina account" />
        <div style={{ padding: '4px 20px 20px' }}>
          <DeleteAccount />
        </div>
      </Card>
    </div>
  );
}