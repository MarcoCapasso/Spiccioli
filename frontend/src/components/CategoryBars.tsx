import { formatMoney } from '../format';
import { NO_CATEGORY_COLOR } from '../palette';
import type { CategoryTotalResponse } from '../types';
import { Skeleton } from './States';

type CategoryBarsProps = {
  totals: CategoryTotalResponse[];
  colors: Map<number, string>;
};

//Le uscite per categoria
//  una barra per ognuna, in proporzione alla più alta
export function CategoryBars({ totals, colors }: CategoryBarsProps) {
  const max = Math.max(...totals.map((entry) => entry.total), 0.01);

  return (
    <ul className="bars">
      {totals.map((entry) => {
        const color = (entry.categoryId !== null && colors.get(entry.categoryId)) || NO_CATEGORY_COLOR;

        return (
          <li className="bar-row" key={entry.categoryId ?? 'none'}>
            <span className="cat-label bar-name">
              <span className="cat-label-dot" style={{ background: color }} />
              {entry.categoryName ?? 'Senza categoria'}
            </span>
            <span className="num bar-amount">{formatMoney(entry.total)}</span>
            <div className="bar-track">
              {/* Un minimo del 3%, perché una barra molto piccola resti visibile */}
              <div className="bar-fill" style={{ width: `${Math.max(3, (entry.total / max) * 100)}%`, background: color }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

//Le forme delle barre mentre i dati arrivano
export function CategoryBarsSkeleton() {
  return (
    <div className="bars" role="status" aria-label="Caricamento delle categorie">
      {[70, 50, 40, 25].map((width) => (
        <div key={width}>
          <Skeleton width={`${width}%`} />
          <div style={{ marginTop: 8 }}>
            <Skeleton height={8} />
          </div>
        </div>
      ))}
    </div>
  );
}