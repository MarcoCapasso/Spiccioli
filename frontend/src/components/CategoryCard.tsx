import { tint } from '../color';
import { formatMoney } from '../format';
import type { CategoryResponse } from '../types';
import { Button } from './Button';
import { Card } from './Card';
import { IconButton } from './IconButton';

type CategoryCardProps = {
  category: CategoryResponse;
  count: number;
  total: number;
  onEdit: () => void;
  onDelete: () => void;
  onRestore: () => void;
};

//Una categoria
//  colore, nome, quanti movimenti
export function CategoryCard({ category, count, total, onEdit, onDelete, onRestore }: CategoryCardProps) {
  const { name, color, isArchived } = category;

  return (
    <Card className={isArchived ? 'cat-card cat-card-archived' : 'cat-card'}>
      <div className="cat-swatch" style={{ background: tint(color, 0.15), color }} aria-hidden="true">
        {name.charAt(0).toUpperCase()}
      </div>

      <div className="info">
        <div className="name">{name}</div>
        <div className="t-xs">
          {count > 0 ? (
            <>
              {count} {count === 1 ? 'movimento' : 'movimenti'} · <span className="num">{formatMoney(total)}</span>
            </>
          ) : (
            'Nessun movimento'
          )}
        </div>
      </div>

      {isArchived ? (
        <Button variant="ghost" size="sm" icon="refresh" onClick={onRestore}>
          Ripristina
        </Button>
      ) : (
        <>
          <IconButton icon="edit" label={`Modifica ${name}`} onClick={onEdit} />
          <IconButton icon="trash" label={`Elimina ${name}`} danger onClick={onDelete} />
        </>
      )}
    </Card>
  );
}