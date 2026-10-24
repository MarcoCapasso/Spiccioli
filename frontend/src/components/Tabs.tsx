type TabOption<T extends string> = {
  value: T;
  label: string;
  count?: number;
};

type TabsProps<T extends string> = {
  label: string;
  value: T;
  options: TabOption<T>[];
  onChange: (value: T) => void;
};

export function Tabs<T extends string>({ label, value, options, onChange }: TabsProps<T>) {
  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          className="tab"
          aria-selected={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
          {option.count !== undefined && <span className="count">{option.count}</span>}
        </button>
      ))}
    </div>
  );
}