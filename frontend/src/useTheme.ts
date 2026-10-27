import { useSyncExternalStore } from 'react';
import { getPreference, getTheme, setPreference, subscribeTheme, toggleTheme } from './theme';

//Il tema per i componenti: si aggiorna da solo quando cambia, ovunque
export function useTheme() {
  const theme = useSyncExternalStore(subscribeTheme, getTheme);
  const preference = useSyncExternalStore(subscribeTheme, getPreference);

  return { theme, preference, setPreference, toggleTheme };
}