import type { ReactNode } from "react";
import type { TransactionType } from "../types";
import { Icon, type IconName } from "./Icon";

type BadgeProps = {
  variant: "income" | "expense" | "neutral" | "primary";
  icon?: IconName;
  children: ReactNode;
};

export function Badge({ variant, icon, children }: BadgeProps) {
  return (
    <span className={`badge badge-${variant}`}>
      {icon && <Icon name={icon} />}
      {children}
    </span>
  );
}

//Il badge del tipo di movimento: verde con la freccia in su per le entrate, rosso in giù per le uscite
export function TransactionTypeBadge({ type }: { type: TransactionType }) {
  return type === "Income" ? (
    <Badge variant="income" icon="up">
      Entrata
    </Badge>
  ) : (
    <Badge variant="expense" icon="down">
      Uscita
    </Badge>
  );
}
