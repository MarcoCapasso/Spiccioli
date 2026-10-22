import { useState, type ComponentProps } from "react";
import { IconButton } from "./IconButton";
import { Input } from "./Input";

type PasswordInputProps = Omit<
  ComponentProps<typeof Input>,
  "type" | "icon" | "className"
>;

//campo password
export function PasswordInput(props: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="input-wrap">
      <Input
        {...props}
        type={visible ? "text" : "password"}
        className="input-with-trail"
      />
      <IconButton
        className="trail"
        icon={visible ? "eyeoff" : "eye"}
        label={visible ? "Nascondi password" : "Mostra password"}
        aria-pressed={visible}
        onClick={() => setVisible(!visible)}
      />
    </div>
  );
}
