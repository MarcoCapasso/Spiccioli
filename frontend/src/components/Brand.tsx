import { Icon } from "./Icon";

//Il logo di Spiccioli: la moneta arancione e il nome
export function Brand() {
  return (
    <div className="brand">
      <div className="brand-mark">
        <Icon name="coin" />
      </div>
      <span>Spiccioli</span>
    </div>
  );
}
