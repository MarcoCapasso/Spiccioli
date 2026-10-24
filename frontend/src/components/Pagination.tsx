import { Button } from './Button';
import { Icon } from './Icon';

type PaginationProps = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
};

//Pagina precedente e successiva
export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className="pager" aria-label="Pagine">
      <Button variant="secondary" size="sm" icon="left" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Precedente
      </Button>
      <span className="t-small">
        Pagina {page} di {totalPages}
      </span>
      <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Successiva
        <Icon name="right" />
      </Button>
    </nav>
  );
}