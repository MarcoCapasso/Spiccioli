import type { ComponentProps } from "react";
import { errorIdFor } from './field-ids';
import { Icon, type IconName } from "./Icon";

type InputProps = ComponentProps<"input"> & {
  id: string;
  invalid?: boolean;
  icon?: IconName;
  small?: boolean;
};

//Il campo di testo: con un errore, si colora e collega il messaggio per i lettori di schermo
export function Input({
  id,
  invalid = false,
  icon,
  small = false,
  className,
  ...rest
}: InputProps) {
  const classes = ["input", small && "input-sm", className]
    .filter(Boolean)
    .join(" ");

  const input = (
    <input
      {...rest}
      id={id}
      className={classes}
      aria-invalid={invalid}
      aria-describedby={invalid ? errorIdFor(id) : undefined}
    />
  );

  if (!icon) {
    return input;
  }

  return (
    <div className="input-wrap">
      <Icon name={icon} />
      {input}
    </div>
  );
}
