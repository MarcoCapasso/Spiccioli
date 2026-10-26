import { CATEGORY_COLOR_NAMES, CATEGORY_COLORS } from "../palette";
import { Icon } from "./Icon";

type ColorPickerProps = {
  //L'id dell'etichetta che descrive il gruppo
  labelId: string;
  value: string;
  onChange: (color: string) => void;
};

//Sceglie un colore tra quelli della tavolozza, o uno personalizzato:
//un gruppo di opzioni, una sola attiva
export function ColorPicker({ labelId, value, onChange }: ColorPickerProps) {
  //Un colore fuori dalla tavolozza è un colore personalizzato
  const isCustom = !(CATEGORY_COLORS as readonly string[]).includes(value);

  return (
    <div className="color-picker" role="radiogroup" aria-labelledby={labelId}>
      {CATEGORY_COLORS.map((color) => (
        <button
          title={CATEGORY_COLOR_NAMES[color]}
          key={color}
          type="button"
          role="radio"
          aria-checked={color === value}
          aria-label={`Colore ${CATEGORY_COLOR_NAMES[color]}`}
          style={{ background: color }}
          onClick={() => onChange(color)}
        >
          {color === value && <Icon name="check" />}
        </button>
      ))}
      <label
        className={isCustom ? "color-custom selected" : "color-custom"}
        style={isCustom ? { background: value } : undefined}
        title="Colore personalizzato"
      >
        <Icon name={isCustom ? "check" : "plus"} />
        <input
          type="color"
          aria-label="Colore personalizzato"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
        />
      </label>
    </div>
  );
}