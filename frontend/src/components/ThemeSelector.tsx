import { useTheme } from '../useTheme';
import type { ThemePreference } from '../theme';

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'light', label: 'Chiaro' },
  { value: 'dark', label: 'Scuro' },
  { value: 'system', label: 'Sistema' },
];

//Scelta del tema a tre voci
export function ThemeSelector() {
  const { preference, setPreference } = useTheme();

  return (
    <div className="segmented" role="radiogroup" aria-label="Tema">
      {OPTIONS.map((option) => (
        <label key={option.value}>
          <input
            type="radio"
            name="theme"
            value={option.value}
            checked={preference === option.value}
            onChange={() => setPreference(option.value)}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
}