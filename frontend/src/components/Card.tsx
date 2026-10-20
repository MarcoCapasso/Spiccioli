import type { ReactNode } from "react";

type CardProps = {
  padded?: boolean;
  className?: string;
  children: ReactNode;
};

export function Card({ padded = false, className, children }: CardProps) {
  const classes = ["card", padded && "card-pad", className]
    .filter(Boolean)
    .join(" ");
  return <div className={classes}>{children}</div>;
}

type CardHeaderProps = {
  title: string;
  action?: ReactNode;
};

//L'intestazione di una card
export function CardHeader({ title, action }: CardHeaderProps) {
  return (
    <div className="card-head">
      <h2 className="t-h2">{title}</h2>
      {action}
    </div>
  );
}
