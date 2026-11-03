//"1 buono", "8 buoni"
export function voucherLabel(count: number) {
  return count === 1 ? "1 buono" : `${count} buoni`;
}
