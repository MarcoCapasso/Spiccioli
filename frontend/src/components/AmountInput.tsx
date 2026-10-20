import type { TransactionType } from "../types";
import { errorIdFor } from "./Field";

type AmountInputProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  tone: TransactionType;
  invalid?: boolean;
};

//Il campo dell'importo
export function AmountInput({
  id,
  value,
  onChange,
  tone,
  invalid = false,
}: AmountInputProps) {
  const toneClass = tone === "Income" ? "inc" : "exp";

  return (
    <div className={`amount-box ${toneClass}`} data-invalid={invalid}>
      <span className="cur" aria-hidden="true">
        €
      </span>
      <input
        id={id}
        inputMode="decimal"
        autoComplete="off"
        placeholder="0,00"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^\d.,]/g, ""))}
        aria-invalid={invalid}
        aria-describedby={invalid ? errorIdFor(id) : undefined}
      />
    </div>
  );
}
