import type { ReactNode } from "react";
import { Icon } from "./Icon";

type AlertProps = {
  variant: "danger" | "info";
  children: ReactNode;
};

//Un avviso dentro la pagina
//  rosso per gli errori, arancione per le informazioni
export function Alert({ variant, children }: AlertProps) {
  return (
    <div
      className={`alert alert-${variant}`}
      role={variant === "danger" ? "alert" : "status"}
    >
      <Icon name={variant === "danger" ? "alert" : "info"} />
      <div>{children}</div>
    </div>
  );
}
