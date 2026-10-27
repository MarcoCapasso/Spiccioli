import { Link } from 'react-router';
import { Button } from '../components/Button';
import { EmptyState } from '../components/States';
import { usePageTitle } from '../usePageTitle';

//Per ogni indirizzo che non esiste
export function NotFoundPage() {
  usePageTitle('Pagina non trovata');

  return (
    <main className="auth-main" style={{ minHeight: '100vh' }}>
      <EmptyState
        illustration="search"
        title="Pagina non trovata"
        text="L'indirizzo che hai aperto non esiste."
        actions={
          <Link to="/">
            <Button icon="home">Torna alla Panoramica</Button>
          </Link>
        }
      />
    </main>
  );
}