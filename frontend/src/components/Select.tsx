import type { ComponentProps } from "react";
import { errorIdFor } from './field-ids';

type SelectProps = ComponentProps<"select"> & {
  id: string;
  invalid?: boolean;
  small?: boolean;
};

//Il menu a tendina
export function Select({
  id,
  invalid = false,
  small = false,
  className,
  children,
  ...rest
}: SelectProps) {
  const classes = ["select", small && "input-sm", className]
    .filter(Boolean)
    .join(" ");

  return (
    <select
      {...rest}
      id={id}
      className={classes}
      aria-invalid={invalid}
      aria-describedby={invalid ? errorIdFor(id) : undefined}
    >
      {children}
    </select>
  );
}
