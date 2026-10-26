//I tre canali (rosso, verde, blu) di un colore #RRGGBB
function channels(hex: string) {
  const value = parseInt(hex.slice(1), 16);
  return [value >> 16, (value >> 8) & 255, value & 255] as const;
}

//Un colore #RRGGBB con una trasparenza da 0 a 1: "rgba(249, 115, 22, 0.14)"
export function tint(hex: string, alpha: number) {
  const [red, green, blue] = channels(hex);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

//I colori di riferimento, con il loro nome
const NAMED_COLORS: readonly (readonly [string, string])[] = [
  ['Nero', '#111827'],
  ['Grigio scuro', '#4B5563'],
  ['Grigio', '#9CA3AF'],
  ['Grigio chiaro', '#D1D5DB'],
  ['Bianco', '#FFFFFF'],
  ['Rosso', '#EF4444'],
  ['Bordeaux', '#881337'],
  ['Arancione', '#F97316'],
  ['Marrone', '#92400E'],
  ['Beige', '#E7D3B0'],
  ['Giallo', '#EAB308'],
  ['Lime', '#84CC16'],
  ['Verde', '#22C55E'],
  ['Verde scuro', '#166534'],
  ['Verde acqua', '#14B8A6'],
  ['Azzurro', '#0EA5E9'],
  ['Blu', '#3B82F6'],
  ['Blu notte', '#1E3A8A'],
  ['Indaco', '#4F46E5'],
  ['Viola', '#8B5CF6'],
  ['Fucsia', '#D946EF'],
  ['Rosa', '#EC4899'],
  ['Rosa chiaro', '#FBCFE8'],
];

//La distanza tra due colori, pesata come li percepisce l'occhio (formula "redmean")
function distance(a: string, b: string) {
  const [r1, g1, b1] = channels(a);
  const [r2, g2, b2] = channels(b);
  const meanRed = (r1 + r2) / 2;

  return (
    (2 + meanRed / 256) * (r1 - r2) ** 2 +
    4 * (g1 - g2) ** 2 +
    (2 + (255 - meanRed) / 256) * (b1 - b2) ** 2
  );
}

//Il nome del colore di riferimento più vicino
export function colorName(hex: string) {
  let best = NAMED_COLORS[0];

  for (const candidate of NAMED_COLORS) {
    if (distance(hex, candidate[1]) < distance(hex, best[1])) {
      best = candidate;
    }
  }

  return best[0];
}