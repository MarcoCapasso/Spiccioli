import { tint } from "../color";
import { formatShortDate, formatSigned, transactionTitle } from "../format";
import type { TransactionResponse } from "../types";
import { TransactionTypeBadge } from "./Badge";
import { IconButton } from "./IconButton";
import { NO_CATEGORY_COLOR } from "../palette";

type TransactionRowProps = {
  transaction: TransactionResponse;

  //Il colore della categoria
  categoryColor?: string;
  showDate?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
};

//Una riga dell'elenco
// categoria, titolo, nota, importo con segno e, se servono, le azioni
export function TransactionRow({
  transaction,
  categoryColor = NO_CATEGORY_COLOR,
  showDate = true,
  onEdit,
  onDelete,
}: TransactionRowProps) {
  const { note, categoryName, date, amount, type } = transaction;
  const title = transactionTitle(transaction);
  const hasActions = onEdit !== undefined || onDelete !== undefined;

  return (
    <li className={hasActions ? "tx tx-with-actions" : "tx"}>
      <div
        className="tx-ico"
        style={{ background: tint(categoryColor, 0.14), color: categoryColor }}
        aria-hidden="true"
      >
        {(categoryName ?? "?").charAt(0).toUpperCase()}
      </div>

      <div className="tx-main">
        <div className="tx-title">{title}</div>
        <div className="tx-meta">
          <span className="cat-label">
            <span
              className="cat-label-dot"
              style={{ background: categoryColor }}
            />
            {categoryName ?? "Senza categoria"}
          </span>
          {showDate && <span className="t-xs">{formatShortDate(date)}</span>}
        </div>
        {note && <div className="tx-note">{note}</div>}
      </div>

      <div className={type === "Income" ? "tx-amt inc" : "tx-amt exp"}>
        <div className="num">{formatSigned(amount, type)}</div>
        <TransactionTypeBadge type={type} />
      </div>

      {hasActions && (
        <div className="tx-actions">
          {onEdit && (
            <IconButton
              icon="edit"
              label={`Modifica ${title}`}
              onClick={onEdit}
            />
          )}
          {onDelete && (
            <IconButton
              icon="trash"
              label={`Elimina ${title}`}
              danger
              onClick={onDelete}
            />
          )}
        </div>
      )}
    </li>
  );
}
