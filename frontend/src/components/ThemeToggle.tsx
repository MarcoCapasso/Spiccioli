import { useState } from 'react';
import { getTheme, toggleTheme } from '../theme';
import { IconButton } from './IconButton';

//Cambia tema: la luna invita a passare allo scuro, il sole a tornare al chiaro
export function ThemeToggle() {
  const [theme, setTheme] = useState(getTheme());
  const isDark = theme === 'dark';

  return (
    <IconButton
      icon={isDark ? 'sun' : 'moon'}
      label={isDark ? 'Passa al tema chiaro' : 'Passa al tema scuro'}
      aria-pressed={isDark}
      onClick={() => setTheme(toggleTheme())}
    />
  );
}