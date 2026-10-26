import { lazy } from "react";
import { Route, Routes } from "react-router";
import { PublicOnly } from "./auth/PublicOnly";
import { RequireAuth } from "./auth/RequireAuth";
import { AppLayout } from "./layout/AppLayout";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { OnboardingGate } from "./auth/OnboardingGate";

//Le pagine dentro l'app si scaricano solo quando si aprono: le pagine hanno export con nome,
//quindi si presenta l'export come "default", che è ciò che lazy si aspetta
const OverviewPage = lazy(() =>
  import("./pages/OverviewPage").then((m) => ({ default: m.OverviewPage })),
);
const TransactionsPage = lazy(() =>
  import("./pages/TransactionsPage").then((m) => ({ default: m.TransactionsPage })),
);
const RecurringPage = lazy(() =>
  import("./pages/RecurringPage").then((m) => ({ default: m.RecurringPage })),
);
const CategoriesPage = lazy(() =>
  import("./pages/CategoriesPage").then((m) => ({ default: m.CategoriesPage })),
);
const PlanPage = lazy(() =>
  import("./pages/PlanPage").then((m) => ({ default: m.PlanPage })),
);
const DesignSystemPage = import.meta.env.DEV
  ? lazy(() => import("./pages/DesignSystemPage").then((m) => ({ default: m.DesignSystemPage })))
  : null;

//Contenuto radice
function App() {
  return (
    <Routes>
      {/* Solo per chi non è collegato */}
      <Route element={<PublicOnly />}>
        <Route path="/accedi" element={<LoginPage />} />
      </Route>

      {/* Solo per chi è collegato */}
      <Route element={<RequireAuth />}>
        {/* Solo per chi deve ancora fare il setup */}
        <Route element={<OnboardingGate completed={false} />}>
          <Route path="/benvenuto" element={<OnboardingPage />} />
        </Route>

        {/* Solo per chi ha completato il setup */}
        <Route element={<OnboardingGate completed />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/movimenti" element={<TransactionsPage />} />
            <Route path="/spese-ricorrenti" element={<RecurringPage />} />
            <Route path="/categorie" element={<CategoriesPage />} />
            <Route path="/piano" element={<PlanPage />} />
            {DesignSystemPage && (
              <Route path="/sviluppo" element={<DesignSystemPage />} />
            )}
          </Route>
        </Route>
      </Route>

      {/* Qualunque altro indirizzo */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;