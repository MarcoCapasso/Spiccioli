//preferenza del tema nel browser
const THEME_KEY = 'spiccioli:theme';

//Cosa sceglie l'utente (system = segui il dispositivo) e cosa viene applicato alla pagina
export type ThemePreference = 'light' | 'dark' | 'system';
export type Theme = 'light' | 'dark';

const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
const listeners = new Set<() => void>();

//La scelta salvata; senza scelta salvata si segue il sistema
function readPreference(): ThemePreference {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    return saved === 'light' || saved === 'dark' ? saved : 'system';
  } catch {
    return 'system';
  }
}

let preference = readPreference();

//Da preferenza a tema concreto
function resolve(pref: ThemePreference): Theme {
  if (pref === 'system') {
    return systemDark.matches ? 'dark' : 'light';
  }
  return pref;
}

//Scrive il tema sulla pagina e avvisa chi lo sta mostrando
function apply() {
  document.documentElement.dataset.theme = resolve(preference);
  listeners.forEach((listener) => listener());
}

//Il tema attualmente applicato alla pagina
export function getTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

export function getPreference(): ThemePreference {
  return preference;
}

//Cambia la scelta e la ricorda; "system" cancella la scelta salvata
export function setPreference(next: ThemePreference) {
  preference = next;

  try {
    if (next === 'system') {
      localStorage.removeItem(THEME_KEY);
    } else {
      localStorage.setItem(THEME_KEY, next);
    }
  } catch {
    //Archivio non disponibile (navigazione privata, dati bloccati): la scelta vale solo per questa visita
  }

  apply();
}

//Scorciatoia a due stati: da qualunque tema passa all'altro, come scelta esplicita
export function toggleTheme() {
  setPreference(getTheme() === 'dark' ? 'light' : 'dark');
}

//Per React: chiama listener a ogni cambio; restituisce la funzione per smettere di ascoltare
export function subscribeTheme(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

//Se il dispositivo cambia tema (es. scuro di sera) e si segue il sistema, ci si adegua
systemDark.addEventListener('change', () => {
  if (preference === 'system') {
    apply();
  }
});