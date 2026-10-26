//I dieci colori delle categorie: gli stessi della tavolozza del backend, nello stesso ordine
export const CATEGORY_COLORS = [
  '#F97316', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6',
  '#EAB308', '#64748B', '#22C55E', '#EF4444', '#0EA5E9',
] as const;

//Il nome di ogni colore, per chi usa il lettore di schermo
export const CATEGORY_COLOR_NAMES: Record<string, string | undefined> = {
  '#F97316': 'Arancione',
  '#3B82F6': 'Blu',
  '#8B5CF6': 'Viola',
  '#EC4899': 'Rosa',
  '#14B8A6': 'Verde acqua',
  '#EAB308': 'Giallo',
  '#64748B': 'Grigio',
  '#22C55E': 'Verde',
  '#EF4444': 'Rosso',
  '#0EA5E9': 'Azzurro',
};

//Il colore delle transazioni senza categoria: lo stesso del testo più discreto
export const NO_CATEGORY_COLOR = '#9A958C';