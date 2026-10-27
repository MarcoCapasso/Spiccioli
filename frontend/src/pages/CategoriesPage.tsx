import { useState } from 'react';
import { errorMessage } from '../api/client';
import { useCategories, useCategoryTotals, useDeleteCategory, useRestoreCategory } from '../api/queries';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { CategoryCard } from '../components/CategoryCard';
import { CategoryModal } from '../components/CategoryModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { Fab } from '../components/Fab';
import { EmptyState, ErrorState, Skeleton } from '../components/States';
import { useToast } from '../components/toast-context';
import type { CategoryResponse } from '../types';

//La finestra aperta
// nuova, modifica, conferma di eliminazione, o nessuna
type OpenModal =
  | { kind: 'new' }
  | { kind: 'edit'; category: CategoryResponse }
  | { kind: 'delete'; category: CategoryResponse; count: number }
  | null;

export function CategoriesPage() {
  const categories = useCategories(true);
  const totals = useCategoryTotals();
  const remove = useDeleteCategory();
  const restoreCategory = useRestoreCategory();
  const showToast = useToast();
  const [showArchived, setShowArchived] = useState(false);
  const [modal, setModal] = useState<OpenModal>(null);

  function restore(category: CategoryResponse) {
    restoreCategory.mutate(category.id, {
      onSuccess: () => showToast({ kind: 'success', title: 'Categoria ripristinata', message: category.name }),
      onError: (error) =>
        showToast({ kind: 'error', title: 'Categoria non ripristinata', message: errorMessage(error) }),
    });
  }

  function confirmDelete(category: CategoryResponse, count: number) {
    remove.mutate(category.id, {
      onSuccess: () => {
        setModal(null);
        showToast(
          count > 0
            ? {
                kind: 'info',
                title: 'Categoria archiviata',
                message: category.name,
                action: { label: 'Annulla', run: () => restore(category) },
              }
            : { kind: 'info', title: 'Categoria eliminata', message: category.name },
        );
      },
      onError: (error) => {
        setModal(null);
        showToast({ kind: 'error', title: 'Categoria non eliminata', message: errorMessage(error) });
      },
    });
  }

  if (categories.isPending) {
    return (
      <div className="cat-grid" role="status" aria-label="Caricamento delle categorie">
        {[1, 2, 3, 4].map((n) => (
          <Card key={n} className="cat-card">
            <Skeleton width={44} height={44} radius={13} />
            <div style={{ flex: 1 }}>
              <Skeleton width="60%" />
              <div style={{ marginTop: 8 }}>
                <Skeleton width="40%" height={10} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (categories.isError) {
    return (
      <Card>
        <ErrorState text={errorMessage(categories.error)} onRetry={() => categories.refetch()} />
      </Card>
    );
  }

  const all = categories.data;
  const active = all.filter((category) => !category.isArchived);
  const archived = all.filter((category) => category.isArchived);

  //Numero di movimenti e totale per categoria
  const totalsById = new Map(totals.data?.map((t) => [t.categoryId, t]));

  function card(category: CategoryResponse) {
    const entry = totalsById.get(category.id);
    const count = entry?.count ?? 0;

    return (
      <CategoryCard
        key={category.id}
        category={category}
        count={count}
        total={entry?.total ?? 0}
        onEdit={() => setModal({ kind: 'edit', category })}
        onDelete={() => setModal({ kind: 'delete', category, count })}
        onRestore={() => restore(category)}
      />
    );
  }

  return (
    <div className="stack">
      {all.length === 0 ? (
        <Card>
          <EmptyState
            illustration="categories"
            title="Nessuna categoria"
            text="Le categorie ti aiutano a capire dove spendi di più. Creane una per iniziare."
            actions={
              <Button icon="plus" onClick={() => setModal({ kind: 'new' })}>
                Crea categoria
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          <div className="row">
            <p className="muted" style={{ margin: 0 }}>
              {active.length} {active.length === 1 ? 'categoria' : 'categorie'}
            </p>
            <div className="spacer" />
            <Button variant="secondary" icon="plus" onClick={() => setModal({ kind: 'new' })}>
              Nuova categoria
            </Button>
          </div>

          {(
            [
              ['Uscite', active.filter((category) => category.type === 'Expense')],
              ['Entrate', active.filter((category) => category.type === 'Income')],
            ] as const
          ).map(
            ([title, items]) =>
              items.length > 0 && (
                <section className="cat-group" key={title}>
                  <h2 className="t-label">{title}</h2>
                  <div className="cat-grid">{items.map(card)}</div>
                </section>
              ),
          )}

          {archived.length > 0 && (
            <section className="cat-group">
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-expanded={showArchived}
                  onClick={() => setShowArchived(!showArchived)}
                >
                  {showArchived ? 'Nascondi archiviate' : `Mostra archiviate (${archived.length})`}
                </Button>
              </div>
              {showArchived && <div className="cat-grid">{archived.map(card)}</div>}
            </section>
          )}

          {/* Il + del telefono: qui crea una categoria, non un movimento */}
          <Fab icon="plus" label="Nuova categoria" onClick={() => setModal({ kind: 'new' })} />
        </>
      )}

      {modal?.kind === 'new' && <CategoryModal onClose={() => setModal(null)} />}
      {modal?.kind === 'edit' && <CategoryModal category={modal.category} onClose={() => setModal(null)} />}
      {modal?.kind === 'delete' && (
        <ConfirmModal
          title={`Eliminare “${modal.category.name}”?`}
          confirmLabel={modal.count > 0 ? 'Archivia categoria' : 'Elimina categoria'}
          loading={remove.isPending}
          onConfirm={() => confirmDelete(modal.category, modal.count)}
          onClose={() => setModal(null)}
        >
          {modal.count > 0
            ? `${modal.count} ${modal.count === 1 ? 'movimento resta' : 'movimenti restano'} nello storico: la categoria verrà archiviata e non comparirà più tra quelle da scegliere. Potrai ripristinarla.`
            : 'La categoria non ha movimenti e verrà eliminata. Se è usata altrove, ad esempio in una spesa ricorrente, verrà archiviata.'}
        </ConfirmModal>
      )}
    </div>
  );
}