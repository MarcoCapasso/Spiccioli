import { Icon } from './Icon';

type CategoryChipProps = {
  name: string;
  color: string;
  selected: boolean;
  onToggle: () => void;
};

//Una categoria da scegliere
// pallino del colore, nome e segno di spunta
export function CategoryChip({ name, color, selected, onToggle }: CategoryChipProps) {
  return (
    <button type="button" className="cat-chip" aria-pressed={selected} onClick={onToggle}>
      <span className="cat-chip-dot" style={{ background: color }} aria-hidden="true" />
      <span className="cat-chip-name">{name}</span>
      <span className="cat-chip-check" aria-hidden="true">
        <Icon name="check" />
      </span>
    </button>
  );
}