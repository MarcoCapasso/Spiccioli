//preferenza del tema nel browser
const THEME_KEY = 'spiccioli:theme';

export type Theme = 'light' | 'dark';

//Il tema attualmente applicato alla pagina
export function getTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

//Applica il tema e lo ricorda; restituisce il nuovo tema
export function toggleTheme(): Theme {
  const next: Theme = getTheme() === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;

  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    //Archivio non disponibile (navigazione privata, dati bloccati): il tema vale solo per questa visita
  }

  return next;
}