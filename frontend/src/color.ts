//Un colore #RRGGBB con una trasparenza da 0 a 1: "rgba(249, 115, 22, 0.14)"
export function tint(hex: string, alpha: number) {
  const value = parseInt(hex.slice(1), 16);
  return `rgba(${value >> 16}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`;
}
