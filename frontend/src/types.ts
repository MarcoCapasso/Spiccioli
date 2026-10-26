// ═══════════ Tipi condivisi con il backend ═══════════

//Una data nel formato del DateOnly del backend: "2026-10-13"
export type IsoDate = string;

//Il tipo di un movimento e di una categoria, come l'enum TransactionType del backend
export type TransactionType = "Income" | "Expense";

//La frequenza di una spesa ricorrente
export type RecurrenceFrequency =
  | "Monthly"
  | "Bimonthly"
  | "Quarterly"
  | "SemiAnnual"
  | "Annual";

// ───────────── Profilo ─────────────

//GET /api/me
export type UserResponse = {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  hasCompletedOnboarding: boolean;
};

// ───────────── Categorie ─────────────

//GET /api/categories
export type CategoryResponse = {
  id: number;
  name: string;
  type: TransactionType;
  isArchived: boolean;
  color: string;
};

//Una categoria proposta nell'onboarding
export type DefaultCategory = {
  name: string;
  type: TransactionType;
};

// ───────────── Transazioni ─────────────

//Una transazione: GET /api/transactions/{id}, e gli elementi dell'elenco
export type TransactionResponse = {
  id: number;
  amount: number;
  date: IsoDate;
  type: TransactionType;
  description: string | null;
  note: string | null;
  categoryId: number | null;
  categoryName: string | null;
};

//Una pagina di risultati, per qualunque elenco paginato
export type PagedResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

//GET /api/transactions/summary
export type TransactionSummaryResponse = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  incomeCount: number;
  expenseCount: number;
};

//Gli elementi di GET /api/transactions/summary/by-category
export type CategoryTotalResponse = {
  categoryId: number | null;
  categoryName: string | null;
  type: TransactionType;
  total: number;
  count: number;
};

// ───────────── Spese ricorrenti ─────────────

//GET /api/recurring-expenses
export type RecurringExpenseResponse = {
  id: number;
  name: string;
  amount: number;
  frequency: RecurrenceFrequency;
  startDate: IsoDate;
  endDate: IsoDate | null;
  categoryId: number;
  categoryName: string | null;
  hasPaidPayments: boolean;
};

// ───────────── Piani mensili ─────────────

//Una voce del piano: quanto si prevede di spendere in una categoria
export type BudgetAllocationResponse = {
  categoryId: number;
  categoryName: string | null;
  amount: number;
};

//Una scadenza del mese, generata da una spesa ricorrente
export type PlannedPaymentResponse = {
  id: number;
  name: string;
  amount: number;
  dueDate: IsoDate;
  isPaid: boolean;
};

//POST /api/budgets/{year}/{month}, e le risposte delle modifiche del piano
export type MonthlyBudgetResponse = {
  id: number;
  year: number;
  month: number;
  plannedIncome: number;
  savingsTarget: number;
  allocations: BudgetAllocationResponse[];
  plannedPayments: PlannedPaymentResponse[];
};

// ───────────── Dashboard ─────────────

//L'andamento di una categoria: previsto contro speso
export type CategoryProgressResponse = {
  categoryId: number | null;
  categoryName: string | null;
  allocated: number | null;
  spent: number;
  isPlanned: boolean;
  remaining: number | null;
  isOverBudget: boolean;
};

//GET /api/budgets/{year}/{month}/dashboard
export type DashboardResponse = {
  year: number;
  month: number;
  plannedIncome: number;
  savingsTarget: number;
  totalAllocated: number;
  actualIncome: number;
  actualExpense: number;
  pendingPaymentsTotal: number;
  pendingPaymentsCount: number;
  categories: CategoryProgressResponse[];
  unallocated: number;
  actualSavings: number;
};
