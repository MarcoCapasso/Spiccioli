import type { ComponentProps } from "react";
import { errorIdFor } from "./Field";

type TextareaProps = ComponentProps<"textarea"> & {
  id: string;
  invalid?: boolean;
};

//L'area di testo su più righe, per le note
export function Textarea({id, invalid = false, className, ...rest}: TextareaProps) {
  const classes = ["textarea", className].filter(Boolean).join(" ");

  return (
    <textarea
      {...rest}
      id={id}
      className={classes}
      aria-invalid={invalid}
      aria-describedby={invalid ? errorIdFor(id) : undefined}
    />
  );
}
