import { useState, type ReactNode } from 'react';
import { errorMessage } from '../api/client';
import { useCompleteOnboarding, useDefaultCategories, useProfile } from '../api/queries';
import { useAuth } from '../auth/auth-context';
import { Brand } from '../components/Brand';
import { Button } from '../components/Button';
import { CategoryChip } from '../components/CategoryChip';
import { IconButton } from '../components/IconButton';
import { ErrorState, Skeleton } from '../components/States';
import { useToast } from '../components/toast-context';
import { CATEGORY_COLORS } from '../palette';
import { usePageTitle } from '../usePageTitle';

//I due gruppi della schermata
const GROUPS = [
  { type: 'Expense', title: 'Uscite' },
  { type: 'Income', title: 'Entrate' },
] as const;

//La cornice comune a tutti gli stati della schermata
function Shell({ children }: { children: ReactNode }) {
  const { signOut } = useAuth();

  return (
    <main className="onboarding">
      <div className="onboarding-theme">
        <IconButton icon="logout" label="Esci" onClick={signOut} />
      </div>
      <div className="onboarding-card">
        <Brand />
        {children}
      </div>
    </main>
  );
}

//Il setup iniziale
// l'utente sceglie le categorie con cui partire
export function OnboardingPage() {
  usePageTitle('Benvenuto');

  const categories = useDefaultCategories();
  const profile = useProfile();
  const complete = useCompleteOnboarding();
  const showToast = useToast();

  //Si ricordano le categorie TOLTE, non quelle scelte
  //  all'inizio sono tutte selezionate, senza effetti
  const [excluded, setExcluded] = useState<Set<string>>(new Set());

  if (categories.isPending) {
    return (
      <Shell>
        <div className="stack" style={{ gap: 12 }}>
          <Skeleton width={220} height={32} />
          <Skeleton width="70%" />
          <Skeleton height={46} radius={12} />
          <Skeleton height={46} radius={12} />
        </div>
      </Shell>
    );
  }

  if (categories.isError) {
    return (
      <Shell>
        <ErrorState text={errorMessage(categories.error)} onRetry={() => categories.refetch()} />
      </Shell>
    );
  }

  const list = categories.data;
  const selected = list.filter((category) => !excluded.has(category.name));
  const allSelected = selected.length === list.length;
  const firstName = profile.data?.firstName.split(' ')[0];

  //Aggiunge la categoria alle escluse, o la toglie se c'era già (delete restituisce true se c'era)
  function toggle(name: string) {
    setExcluded((current) => {
      const next = new Set(current);
      if (!next.delete(name)) {
        next.add(name);
      }
      return next;
    });
  }

  function toggleAll() {
    setExcluded(allSelected ? new Set(list.map((category) => category.name)) : new Set());
  }

  function handleSubmit() {
    complete.mutate(
      selected.map((category) => category.name),
      {
        onError: (error) =>
          showToast({ kind: 'error', title: 'Setup non completato', message: errorMessage(error) }),
      },
    );
  }

  return (
    <Shell>
      <h1 className="t-h1 onboarding-title">{firstName ? `Benvenuto, ${firstName}` : 'Benvenuto'}</h1>
      <p className="muted onboarding-subtitle">Scegli le categorie con cui iniziare. Potrai cambiarle quando vuoi.</p>

      {GROUPS.map(({ type, title }) => (
        <section className="onboarding-group" key={type}>
          <h2 className="t-label">{title}</h2>
          <div className="chip-grid">
            {list
              .filter((category) => category.type === type)
              .map((category) => (
                <CategoryChip
                  key={category.name}
                  name={category.name}
                  //Il colore dipende dalla posizione nell'elenco intero: lo stesso che assegna il backend
                  color={CATEGORY_COLORS[list.indexOf(category) % CATEGORY_COLORS.length]}
                  selected={!excluded.has(category.name)}
                  onToggle={() => toggle(category.name)}
                />
              ))}
          </div>
        </section>
      ))}

      <div className="onboarding-foot">
        <span className="t-small onboarding-count">
          {selected.length === 1 ? '1 categoria scelta' : `${selected.length} categorie scelte`}
        </span>
        <Button variant="ghost" size="sm" onClick={toggleAll}>
          {allSelected ? 'Deseleziona tutte' : 'Seleziona tutte'}
        </Button>
        <Button size="lg" loading={complete.isPending} onClick={handleSubmit}>
          Inizia
        </Button>
      </div>
    </Shell>
  );
}