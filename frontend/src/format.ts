import type { IsoDate, TransactionType, TransactionResponse } from "./types";

const EUR = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
  useGrouping: "always",
});

//Un importo in euro: "1.800,00 €"
export function formatMoney(amount: number) {
  return EUR.format(amount);
}

//Un importo con segno: "+1.800,00 €" per le entrate, "−68,40 €" per le uscite
export function formatSigned(amount: number, type: TransactionType) {
  return (type === "Income" ? "+" : "−") + EUR.format(Math.abs(amount));
}

//A mezzogiorno, per non cambiare giorno con i fusi orari
function parse(date: IsoDate) {
  return new Date(`${date}T12:00:00`);
}

export function toIso(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

//"13 ott"
export function formatShortDate(date: IsoDate) {
  return parse(date).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
  });
}

//"Oggi", "Ieri", oppure "Martedì 13 ottobre" (con l'anno se non è quello corrente)
export function formatDayLabel(date: IsoDate) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date === toIso(today)) {
    return "Oggi";
  }
  if (date === toIso(yesterday)) {
    return "Ieri";
  }

  const parsed = parse(date);
  const text = parsed.toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: parsed.getFullYear() === today.getFullYear() ? undefined : "numeric",
  });
  return text.charAt(0).toUpperCase() + text.slice(1);
}

//Da "1.234,56" o "12,5" a un numero; NaN se non è un importo valido
export function parseAmount(text: string) {
  const normalized = text
    .replace(/\s|€/g, "")
    .replace(/\.(?=\d{3}(\D|$))/g, "")
    .replace(",", ".");
  //Solo cifre, con al massimo due decimali: niente segni, niente notazione scientifica
  return /^\d+(\.\d{1,2})?$/.test(normalized) ? Number(normalized) : NaN;
}

//La data di oggi nel formato dell'API
export function todayIso() {
  return toIso(new Date());
}

//Il titolo di una riga: la descrizione, altrimenti la categoria
export function transactionTitle(transaction: TransactionResponse) {
  return (
    transaction.description || transaction.categoryName || "Senza categoria"
  );
}

//Data con anno
export function formatDate(date: IsoDate) {
  return parse(date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric'});
}

//"26/10/2026": la data in numeri, per le schede delle spese ricorrenti
export function formatNumericDate(date: IsoDate) {
  return parse(date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
