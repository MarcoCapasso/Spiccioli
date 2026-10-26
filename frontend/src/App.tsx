import { Route, Routes } from "react-router";
import { PublicOnly } from "./auth/PublicOnly";
import { RequireAuth } from "./auth/RequireAuth";
import { AppLayout } from "./layout/AppLayout";
import { CategoriesPage } from "./pages/CategoriesPage";
import { DesignSystemPage } from "./pages/DesignSystemPage";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { OverviewPage } from "./pages/OverviewPage";
import { TransactionsPage } from "./pages/TransactionsPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { OnboardingGate } from "./auth/OnboardingGate";
import { RecurringPage } from "./pages/RecurringPage";
import { PlanPage } from "./pages/PlanPage";

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
            {import.meta.env.DEV && (
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
