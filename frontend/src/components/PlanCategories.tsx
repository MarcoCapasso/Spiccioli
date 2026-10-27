import { formatMoney } from '../format';
import { NO_CATEGORY_COLOR } from '../palette';
import type { CategoryProgressResponse } from '../types';
import { Badge } from './Badge';
import { Button } from './Button';
import { Card, CardHeader } from './Card';
import { IconButton } from './IconButton';
import { EmptyState } from './States';

//La percentuale per la barra, da 0 a 100, UI
function percent(spent: number, allocated: number) {
  if (allocated <= 0) {
    return spent > 0 ? 100 : 0;
  }
  return Math.min(100, Math.round((spent / allocated) * 100));
}

type PlanCategoriesProps = {
  categories: CategoryProgressResponse[];
  //Il colore di ogni categoria, cercato per Id
  colors: Map<number, string>;
  onAdd: () => void;
  onEdit: (category: CategoryProgressResponse) => void;
  onPlan: (category: CategoryProgressResponse) => void;
};

//Le categorie del mese
//  previsto contro speso, con le spese non pianificate in fondo
export function PlanCategories({ categories, colors, onAdd, onEdit, onPlan }: PlanCategoriesProps) {
  const addButton = (
    <Button variant="secondary" size="sm" icon="plus" onClick={onAdd}>
      Aggiungi voce
    </Button>
  );

  if (categories.length === 0) {
    return (
      <Card>
        <EmptyState
          illustration="categories"
          title="Nessuna voce nel piano"
          text="Indica quanto prevedi di spendere per categoria: qui vedrai il confronto con la spesa reale."
          actions={addButton}
        />
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader title="Categorie" action={addButton} />
      <ul className="plan-rows">
        {categories.map((category) => {
          const { categoryId, categoryName, allocated, spent, isOverBudget, remaining } = category;
          const name = categoryName ?? 'Senza categoria';
          const color = (categoryId !== null && colors.get(categoryId)) || NO_CATEGORY_COLOR;
          const dot = <span className="cat-label-dot" style={{ background: color }} />;

          //Fuori dal piano: solo ciò che si è speso, e la possibilità di pianificarla
          if (allocated === null) {
            return (
              <li className="plan-row" key={categoryId ?? 'none'}>
                <div className="plan-row-top">
                  <span className="plan-row-name">
                    {dot}
                    {name}
                  </span>
                  <span className="plan-row-amounts num">
                    <b>{formatMoney(spent)}</b>
                  </span>
                  {categoryId !== null && (
                    <Button variant="secondary" size="sm" onClick={() => onPlan(category)}>
                      Pianifica
                    </Button>
                  )}
                </div>
                {/* Lo stato sotto, come nelle righe pianificate: sul telefono non c'è spazio per metterlo accanto al nome */}
                <div className="plan-row-note">
                  <Badge variant="neutral">Non pianificata</Badge>
                </div>
              </li>
            );
          }

          const note = isOverBudget
            ? `Sforata di ${formatMoney(Math.abs(remaining ?? 0))}`
            : allocated === 0 && spent === 0
              ? 'Nessuna spesa prevista'
              : `Restano ${formatMoney(remaining ?? 0)}`;

          return (
            <li className={isOverBudget ? 'plan-row plan-over' : 'plan-row'} key={categoryId ?? 'none'}>
              <div className="plan-row-top">
                <span className="plan-row-name">
                  {dot}
                  {name}
                </span>
                <span className="plan-row-amounts num">
                  <b>{formatMoney(spent)}</b> di {formatMoney(allocated)}
                </span>
                <IconButton icon="edit" label={`Modifica la voce ${name}`} onClick={() => onEdit(category)} />
              </div>
              <div
                className="plan-bar"
                role="progressbar"
                aria-label={`${name}: speso rispetto al previsto`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percent(spent, allocated)}
              >
                <span
                  style={{ width: `${percent(spent, allocated)}%`, background: isOverBudget ? 'var(--danger)' : color }}
                />
              </div>
              <div className="plan-row-note">{note}</div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}