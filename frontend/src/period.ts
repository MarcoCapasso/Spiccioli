import { toIso } from "./format";
import type { IsoDate } from "./types";
import type { CategoryResponse } from "./types";

export type PeriodKey = "month" | "30d" | "year" | "all" | "custom";

export const PERIOD_LABELS: Record<PeriodKey, string> = {
  month: "Questo mese",
  "30d": "Ultimi 30 giorni",
  year: "Quest'anno",
  all: "Da sempre",
  custom: "Personalizzato",
};

//Un intervallo di date, con gli estremi facoltativi
export type DateRange = { from?: IsoDate; to?: IsoDate };

//Dal periodo scelto all'intervallo da chiedere all'API; "Da sempre" non ha estremi
export function periodRange(period: PeriodKey, custom: DateRange): DateRange {
  const today = new Date();
  const end = toIso(today);

  switch (period) {
    case "month":
      return {
        from: toIso(new Date(today.getFullYear(), today.getMonth(), 1)),
        to: end,
      };
    case "30d": {
      const start = new Date(today);
      start.setDate(today.getDate() - 29);
      return { from: toIso(start), to: end };
    }
    case "year":
      return { from: `${today.getFullYear()}-01-01`, to: end };
    case "custom":
      return { from: custom.from || undefined, to: custom.to || undefined };
    case "all":
      return {};
  }
}

//I periodi, nell'ordine in cui compaiono
export const PERIODS: PeriodKey[] = ['month', '30d', 'year', 'all', 'custom'];

//Ciò che serve a chi mostra i filtri
//  la barra sul computer e la finestra sul telefono
export type PeriodFilterProps = {
  period: PeriodKey;
  onPeriodChange: (period: PeriodKey) => void;
  custom: { from: string; to: string };
  onCustomChange: (patch: Partial<{ from: string; to: string }>) => void;
  categoryId: string;
  onCategoryChange: (categoryId: string) => void;
  categories: CategoryResponse[];
};